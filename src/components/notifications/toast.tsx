'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'
import { Toast as ToastType } from '@/lib/stores/notification-store'

interface ToastProps {
  toast: ToastType
  onClose: (id: string) => void
}

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

const toastColors = {
  success: 'from-green-500/20 to-green-600/20 border-green-500/30',
  error: 'from-red-500/20 to-red-600/20 border-red-500/30',
  warning: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30',
  info: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
}

const iconColors = {
  success: 'text-green-400',
  error: 'text-red-400',
  warning: 'text-yellow-400',
  info: 'text-blue-400',
}

export function Toast({ toast, onClose }: ToastProps) {
  const Icon = toastIcons[toast.type]

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`relative w-full max-w-sm rounded-2xl border bg-gradient-to-br p-4 backdrop-blur-xl ${toastColors[toast.type]} shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_8px_32px_rgba(0,0,0,0.4)]`}
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${iconColors[toast.type]}`}>
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="mb-1 text-sm font-semibold text-white">{toast.title}</h4>
          <p className="text-xs leading-relaxed text-gray-300">{toast.message}</p>
        </div>

        <button
          onClick={() => onClose(toast.id)}
          className="flex-shrink-0 rounded-lg p-1 text-gray-400 transition-all duration-200 hover:bg-white/10 hover:text-white"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  )
}
