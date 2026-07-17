import axios from 'axios'
import { getActiveToken, getActiveRefreshToken } from '../stores/authStore'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Attach authorization header if token exists
apiClient.interceptors.request.use(
  (config) => {
    const token = getActiveToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

let isRefreshing = false
let failedQueue: any[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Intercept responses for global error and refresh handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Skip redirect if we are already on the auth page
    if (window.location.pathname.startsWith('/auth')) {
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return apiClient(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = getActiveRefreshToken()
      if (refreshToken) {
        try {
          const response = await axios.post(
            `${API_BASE_URL}/auth/refresh?refresh_token=${refreshToken}`
          )
          const { access_token, refresh_token } = response.data

          const rememberMe = localStorage.getItem('rememberMe') === 'true'
          const storage = rememberMe ? localStorage : sessionStorage
          storage.setItem('token', access_token)
          storage.setItem('refreshToken', refresh_token)

          processQueue(null, access_token)

          originalRequest.headers.Authorization = `Bearer ${access_token}`
          return apiClient(originalRequest)
        } catch (refreshError) {
          processQueue(refreshError, null)
          localStorage.clear()
          sessionStorage.clear()
          window.location.href = '/auth'
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      } else {
        localStorage.clear()
        sessionStorage.clear()
        window.location.href = '/auth'
      }
    }
    return Promise.reject(error)
  }
)
