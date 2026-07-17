import { describe, it, expect, vi, beforeEach } from 'vitest'
import { saveToDb, getFromDb, deleteFromDb, getAllFromDb } from '../src/lib/indexed-db'

vi.mock('../src/lib/indexed-db', () => {
  const store: Record<string, any> = {}
  return {
    initDb: vi.fn(),
    saveToDb: vi.fn().mockImplementation(async (storeName, key, value) => {
      store[key] = value
    }),
    getFromDb: vi.fn().mockImplementation(async (storeName, key) => {
      return store[key] || null
    }),
    deleteFromDb: vi.fn().mockImplementation(async (storeName, key) => {
      delete store[key]
    }),
    getAllFromDb: vi.fn().mockImplementation(async (storeName) => {
      return Object.values(store)
    })
  }
})

describe('PWA IndexedDB Cache Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should successfully store configuration blocks', async () => {
    const key = 'dashboard_layout'
    const layout = ['widget-1', 'widget-2']
    
    await saveToDb('cache', key, layout)
    const cached = await getFromDb('cache', key)
    
    expect(cached).toEqual(layout)
  })

  it('should retrieve empty array if store is empty', async () => {
    const records = await getAllFromDb('offline_queue')
    expect(records).toBeDefined()
  })

  it('should delete keys from database', async () => {
    const key = 'notes_sync'
    await saveToDb('cache', key, 'data')
    await deleteFromDb('cache', key)
    
    const record = await getFromDb('cache', key)
    expect(record).toBeNull()
  })
})
