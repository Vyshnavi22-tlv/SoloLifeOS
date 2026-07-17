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
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  setToken: (token: string | null) => void
  setUser: (user: User | null) => void
  login: (token: string, user: User) => void
  logout: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,
  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
    set({ token, isAuthenticated: !!token })
  },
  setUser: (user) => set({ user }),
  login: (token, user) => {
    localStorage.setItem('token', token)
    set({ token, user, isAuthenticated: true, error: null })
  },
  logout: () => {
    localStorage.removeItem('token')
    set({ token: null, user: null, isAuthenticated: false, error: null })
  },
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}))
