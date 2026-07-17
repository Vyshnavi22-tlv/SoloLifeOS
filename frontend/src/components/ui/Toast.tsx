import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'
import { useToastStore } from '../../stores/toastStore'

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore()

  const icons = {
    success: <CheckCircle className="text-emerald-500 w-5 h-5" />,
    error: <XCircle className="text-rose-500 w-5 h-5" />,
    warning: <AlertCircle className="text-amber-500 w-5 h-5" />,
    info: <Info className="text-sky-500 w-5 h-5" />
  }

  const bgColors = {
    success: 'bg-emerald-50/95 border-emerald-100',
    error: 'bg-rose-50/95 border-rose-100',
    warning: 'bg-amber-50/95 border-amber-100',
    info: 'bg-sky-50/95 border-sky-100'
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className={`flex items-center gap-3 p-4 border rounded-2xl shadow-md ${bgColors[toast.type]} backdrop-blur-xs`}
          >
            <div className="shrink-0">{icons[toast.type]}</div>
            <p className="flex-1 text-sm font-semibold text-slate-800 leading-tight">
              {toast.message}
            </p>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-all cursor-pointer"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
