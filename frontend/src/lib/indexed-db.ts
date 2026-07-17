const DB_NAME = 'sololifeos_db'
const DB_VERSION = 1

export interface OfflineRequest {
  id: string
  url: string
  method: 'POST' | 'PUT' | 'DELETE' | 'GET'
  headers: Record<string, string>
  body?: string
  timestamp: number
}

let dbInstance: IDBDatabase | null = null

export const initDb = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance)
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result as IDBDatabase
      // Object store for caching offline layout data
      if (!db.objectStoreNames.contains('cache')) {
        db.createObjectStore('cache')
      }
      // Object store for queueing background sync requests
      if (!db.objectStoreNames.contains('offline_queue')) {
        db.createObjectStore('offline_queue', { keyPath: 'id' })
      }
    }

    request.onsuccess = (event: any) => {
      dbInstance = event.target.result as IDBDatabase
      resolve(dbInstance)
    }

    request.onerror = (event: any) => {
      reject(event.target.error)
    }
  })
}

// Generic Set Cache helper
export const saveToDb = async (storeName: 'cache' | 'offline_queue', key: string, value: any): Promise<void> => {
  const db = await initDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite')
    const store = tx.objectStore(storeName)
    const request = store.put(value, storeName === 'offline_queue' ? undefined : key)

    request.onsuccess = () => resolve()
    request.onerror = (e: any) => reject(e.target.error)
  })
}

// Generic Get Cache helper
export const getFromDb = async (storeName: 'cache' | 'offline_queue', key: string): Promise<any> => {
  const db = await initDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly')
    const store = tx.objectStore(storeName)
    const request = store.get(key)

    request.onsuccess = (event: any) => resolve(event.target.result)
    request.onerror = (e: any) => reject(e.target.error)
  })
}

// Generic Delete Cache helper
export const deleteFromDb = async (storeName: 'cache' | 'offline_queue', key: string): Promise<void> => {
  const db = await initDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite')
    const store = tx.objectStore(storeName)
    const request = store.delete(key)

    request.onsuccess = () => resolve()
    request.onerror = (e: any) => reject(e.target.error)
  })
}

// Get all offline queue requests
export const getAllFromDb = async (storeName: 'cache' | 'offline_queue'): Promise<any[]> => {
  const db = await initDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly')
    const store = tx.objectStore(storeName)
    const request = store.getAll()

    request.onsuccess = (event: any) => resolve(event.target.result)
    request.onerror = (e: any) => reject(e.target.error)
  })
}
