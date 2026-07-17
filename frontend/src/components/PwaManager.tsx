import React, { useState, useEffect } from 'react'
import {
  Download,
  Wifi,
  WifiOff,
  AlertCircle,
  RefreshCw,
  X
} from 'lucide-react'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { useToastStore } from '../stores/toastStore'
import { getAllFromDb, deleteFromDb } from '../lib/indexed-db'

export const PwaManager: React.FC = () => {
  const { addToast } = useToastStore()

  // Install prompt deferred event
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)

  // SW Update Available State
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  // Register PWA Install Event & SW Update triggers
  useEffect(() => {
    // 1. Install Prompt interception
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    // 2. Browser Online/Offline status listeners
    const handleOnline = () => {
      setIsOnline(true)
      addToast('System is back online. Syncing offline tasks queue...', 'success')
      replayOfflineQueue()
    }

    const handleOffline = () => {
      setIsOnline(false)
      addToast('System is running offline. Active configs are loaded from cache.', 'warning')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // 3. Service Worker Update checks
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        // Check for updates
        reg.addEventListener('updatefound', () => {
          const installingWorker = reg.installing
          if (installingWorker) {
            installingWorker.addEventListener('statechange', () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true)
              }
            })
          }
        })
      })
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [addToast])

  // Replay Offline request queues
  const replayOfflineQueue = async () => {
    try {
      const queue = await getAllFromDb('offline_queue')
      if (queue.length === 0) return

      addToast(`Syncing ${queue.length} pending offline operations...`, 'info')

      for (const req of queue) {
        try {
          const res = await fetch(req.url, {
            method: req.method,
            headers: req.headers,
            body: req.body
          })

          if (res.ok) {
            // Delete request from IndexedDB upon successful sync replay
            await deleteFromDb('offline_queue', req.id)
          }
        } catch {
          // Re-queue safeguard if API remains down
        }
      }

      addToast('Background sync completed!', 'success')
    } catch {
      // Safe check
    }
  }

  // Handle Install Action
  const handleInstallClick = async () => {
    if (!deferredPrompt) return
    setShowInstallPrompt(false)
    deferredPrompt.prompt()

    const choice = await deferredPrompt.userChoice
    if (choice.outcome === 'accepted') {
      addToast('Thank you for installing Solo Life OS!', 'success')
    }
    setDeferredPrompt(null)
  }

  // Handle SW Update reload
  const handleUpdateClick = () => {
    setUpdateAvailable(false)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' })
          }
        }
      })
    }
    // Force reload tab
    setTimeout(() => {
      window.location.reload()
    }, 300)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4 max-w-sm w-full px-4 sm:px-0">
      {/* Install App Prompt */}
      {showInstallPrompt && (
        <Card variant="glass" className="p-4 border border-sky-200/20 shadow-lg relative flex items-center justify-between gap-4 animate-bounce">
          <div className="flex items-center gap-3">
            <Download className="text-sky-500 shrink-0" size={20} />
            <div className="space-y-0.5">
              <h4 className="font-extrabold text-slate-800 text-xs">Install Solo Life OS</h4>
              <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">Add app shortcut to your desktop screen.</p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button onClick={handleInstallClick} size="sm" className="text-[10px] py-1">
              Install
            </Button>
            <button
              onClick={() => setShowInstallPrompt(false)}
              className="p-1 text-slate-350 hover:text-slate-550 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        </Card>
      )}

      {/* SW Update available */}
      {updateAvailable && (
        <Card variant="glass-pink" className="p-4 border border-pink-200/40 shadow-lg flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <RefreshCw className="text-pink-500 shrink-0 animate-spin" size={20} />
            <div className="space-y-0.5">
              <h4 className="font-extrabold text-slate-800 text-xs">Update Available</h4>
              <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">A new version of Solo Life OS is ready.</p>
            </div>
          </div>
          <Button onClick={handleUpdateClick} size="sm" className="text-[10px] py-1 shrink-0">
            Reload
          </Button>
        </Card>
      )}

      {/* Online/Offline Badge Indicators */}
      {!isOnline && (
        <Card variant="glass" className="p-3 border border-amber-200/20 shadow-xs flex items-center gap-3 bg-amber-50/90">
          <WifiOff className="text-amber-600 shrink-0 animate-pulse" size={16} />
          <div className="space-y-0.5">
            <h4 className="font-bold text-amber-800 text-[10px] uppercase tracking-wider flex items-center gap-1">
              <AlertCircle size={10} /> Running Offline Mode
            </h4>
            <p className="text-[9px] text-amber-700/80 font-semibold leading-relaxed">Pending requests are queued locally.</p>
          </div>
        </Card>
      )}

      {isOnline && (
        <div className="hidden">
          <Wifi size={16} />
        </div>
      )}
    </div>
  )
}
export default PwaManager
