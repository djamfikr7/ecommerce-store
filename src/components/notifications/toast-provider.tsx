'use client'

import { AnimatePresence } from 'framer-motion'
import { useNotificationStore } from '@/lib/stores/notification-store'
import { Toast } from './toast'

export function ToastProvider() {
  const toasts = useNotificationStore((state) => state.toasts)
  const removeToast = useNotificationStore((state) => state.removeToast)

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-3">
      <div className="pointer-events-auto">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <div key={toast.id} className="mb-3">
              <Toast toast={toast} onClose={removeToast} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
