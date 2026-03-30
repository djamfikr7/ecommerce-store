import { useNotificationStore, ToastType } from '@/lib/stores/notification-store'

export function useToast() {
  const addToast = useNotificationStore((state) => state.addToast)

  const toast = {
    success: (title: string, message: string, duration?: number) => {
      addToast({ type: 'success', title, message, duration })
    },
    error: (title: string, message: string, duration?: number) => {
      addToast({ type: 'error', title, message, duration })
    },
    warning: (title: string, message: string, duration?: number) => {
      addToast({ type: 'warning', title, message, duration })
    },
    info: (title: string, message: string, duration?: number) => {
      addToast({ type: 'info', title, message, duration })
    },
    custom: (type: ToastType, title: string, message: string, duration?: number) => {
      addToast({ type, title, message, duration })
    },
  }

  return toast
}
