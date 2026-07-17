import { create } from 'zustand'

export interface User {
  id: number
  email: string
  full_name: string | null
  is_active: boolean
  is_superuser: boolean
  created_at: string
}

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  rememberMe: boolean
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  initializeAuth: () => void
  setUser: (user: User | null) => void
  login: (token: string, refreshToken: string, user: User, rememberMe: boolean) => void
  logout: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  refreshToken: null,
  rememberMe: false,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  initializeAuth: () => {
    const rememberMe = localStorage.getItem('rememberMe') === 'true'
    const storage = rememberMe ? localStorage : sessionStorage
    
    const token = storage.getItem('token')
    const refreshToken = storage.getItem('refreshToken')
    const userStr = storage.getItem('user')
    let user = null
    
    if (userStr) {
      try {
        user = JSON.parse(userStr)
      } catch {
        // Clear corrupt storage
        storage.clear()
      }
    }

    set({
      token,
      refreshToken,
      user,
      rememberMe,
      isAuthenticated: !!token,
      isLoading: false
    })
  },

  setUser: (user) => {
    const rememberMe = get().rememberMe
    const storage = rememberMe ? localStorage : sessionStorage
    if (user) {
      storage.setItem('user', JSON.stringify(user))
    } else {
      storage.removeItem('user')
    }
    set({ user })
  },

  login: (token, refreshToken, user, rememberMe) => {
    const storage = rememberMe ? localStorage : sessionStorage
    
    // Persist rememberMe setting
    localStorage.setItem('rememberMe', String(rememberMe))
    
    storage.setItem('token', token)
    storage.setItem('refreshToken', refreshToken)
    storage.setItem('user', JSON.stringify(user))

    set({
      token,
      refreshToken,
      user,
      rememberMe,
      isAuthenticated: true,
      error: null
    })
  },

  logout: () => {
    const rememberMe = get().rememberMe
    const storage = rememberMe ? localStorage : sessionStorage
    
    storage.removeItem('token')
    storage.removeItem('refreshToken')
    storage.removeItem('user')
    localStorage.removeItem('rememberMe')

    set({
      token: null,
      refreshToken: null,
      user: null,
      rememberMe: false,
      isAuthenticated: false,
      error: null
    })
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error })
}))
export const getActiveToken = (): string | null => {
  const rememberMe = localStorage.getItem('rememberMe') === 'true'
  const storage = rememberMe ? localStorage : sessionStorage
  return storage.getItem('token')
}
export const getActiveRefreshToken = (): string | null => {
  const rememberMe = localStorage.getItem('rememberMe') === 'true'
  const storage = rememberMe ? localStorage : sessionStorage
  return storage.getItem('refreshToken')
}
