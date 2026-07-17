import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from '../src/stores/authStore'

describe('Auth Zustand Store Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    useAuthStore.getState().logout()
  })

  it('should initialize with null user and token', () => {
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })

  it('should set login credentials on success', () => {
    const mockUser = {
      id: 1,
      email: 'test@sololife.com',
      full_name: 'Test User',
      is_active: true,
      is_superuser: false,
      created_at: new Date().toISOString()
    }
    const mockToken = 'mock_jwt_token'
    const mockRefresh = 'mock_refresh_token'

    useAuthStore.getState().login(mockToken, mockRefresh, mockUser, false)

    const state = useAuthStore.getState()
    expect(state.user).toEqual(mockUser)
    expect(state.token).toBe(mockToken)
    expect(state.isAuthenticated).toBe(true)
    
    // Default should store in sessionStorage
    expect(sessionStorage.getItem('sololife_token')).toBe(mockToken)
    expect(localStorage.getItem('sololife_token')).toBeNull()
  })

  it('should store in localStorage if rememberMe is checked', () => {
    const mockUser = {
      id: 1,
      email: 'test@sololife.com',
      full_name: 'Test User',
      is_active: true,
      is_superuser: false,
      created_at: new Date().toISOString()
    }
    const mockToken = 'mock_jwt_token'
    const mockRefresh = 'mock_refresh_token'

    useAuthStore.getState().login(mockToken, mockRefresh, mockUser, true)

    expect(localStorage.getItem('sololife_token')).toBe(mockToken)
    expect(sessionStorage.getItem('sololife_token')).toBeNull()
  })

  it('should clear stores on logout', () => {
    const mockUser = {
      id: 1,
      email: 'test@sololife.com',
      full_name: 'Test User',
      is_active: true,
      is_superuser: false,
      created_at: new Date().toISOString()
    }
    const mockToken = 'mock_jwt_token'
    const mockRefresh = 'mock_refresh_token'

    useAuthStore.getState().login(mockToken, mockRefresh, mockUser, true)
    useAuthStore.getState().logout()

    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(localStorage.getItem('sololife_token')).toBeNull()
  })
})
