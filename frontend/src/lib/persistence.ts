import { apiClient } from './api-client'
import { saveToDb } from './indexed-db'

// We keep a local cache in memory to avoid redundant localStorage parsing
const latestUserData: Record<string, any> = {}

export const fetchAndRestoreUserData = async () => {
  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (!token) return

    const res = await apiClient.get('/users/me/data')
    const data = res.data || {}
    const keys = [
      'tasks', 'notes', 'habits', 'finances', 'goals', 'fitness', 
      'pomodoro', 'journal', 'study', 'reading', 'alarms', 'calendar'
    ]
    keys.forEach(k => {
      const storageKey = `sololifeos_${k}`
      if (data[k] !== undefined) {
        localStorage.setItem(storageKey, JSON.stringify(data[k]))
        latestUserData[k] = data[k]
      }
    })
  } catch (err) {
    console.error('Failed to restore user data from database:', err)
  }
}

export const saveUserData = async (moduleKey: string, data: any) => {
  const storageKey = `sololifeos_${moduleKey}`
  localStorage.setItem(storageKey, JSON.stringify(data))
  latestUserData[moduleKey] = data

  const keys = [
    'tasks', 'notes', 'habits', 'finances', 'goals', 'fitness', 
    'pomodoro', 'journal', 'study', 'reading', 'alarms', 'calendar'
  ]
  const fullData: Record<string, any> = {}
  keys.forEach(k => {
    if (k === moduleKey) {
      fullData[k] = data
    } else if (latestUserData[k] !== undefined) {
      fullData[k] = latestUserData[k]
    } else {
      const local = localStorage.getItem(`sololifeos_${k}`)
      if (local) {
        try {
          fullData[k] = JSON.parse(local)
        } catch {
          fullData[k] = []
        }
      }
    }
  })

  try {
    if (navigator.onLine) {
      await apiClient.put('/users/me/data', fullData)
    } else {
      // Background Sync request queueing
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      const offlineReq = {
        id: `sync-${Date.now()}-${Math.random()}`,
        url: `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/users/me/data`,
        method: 'PUT' as const,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(fullData),
        timestamp: Date.now()
      }
      await saveToDb('offline_queue', offlineReq.id, offlineReq)
    }
  } catch (err) {
    console.error('Failed to sync userdata with database:', err)
  }
}
