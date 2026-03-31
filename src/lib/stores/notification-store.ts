import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type NotificationType = 'order' | 'promotion' | 'system'
export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  createdAt: Date
  link?: string
}

export interface Toast {
  id: string
  type: ToastType
  title: string
  message: string
  duration?: number
}

interface NotificationStore {
  notifications: Notification[]
  toasts: Toast[]
  unreadCount: number

  // Notification actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void
  markAsRead: (id: string) => void
  markAsUnread: (id: string) => void
  markAllAsRead: () => void
  deleteNotification: (id: string) => void
  clearAllNotifications: () => void

  // Toast actions
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void

  // Polling
  lastPolled: Date | null
  setLastPolled: (date: Date) => void
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      toasts: [],
      unreadCount: 0,
      lastPolled: null,

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          read: false,
        }

        set((state) => ({
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }))
      },

      markAsRead: (id) => {
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id)
          if (!notification || notification.read) return state

          return {
            notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
            unreadCount: Math.max(0, state.unreadCount - 1),
          }
        })
      },

      markAsUnread: (id) => {
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id)
          if (!notification || !notification.read) return state

          return {
            notifications: state.notifications.map((n) =>
              n.id === id ? { ...n, read: false } : n,
            ),
            unreadCount: state.unreadCount + 1,
          }
        })
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        }))
      },

      deleteNotification: (id) => {
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id)
          const wasUnread = notification && !notification.read

          return {
            notifications: state.notifications.filter((n) => n.id !== id),
            unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
          }
        })
      },

      clearAllNotifications: () => {
        set({ notifications: [], unreadCount: 0 })
      },

      addToast: (toast) => {
        const newToast: Toast = {
          ...toast,
          id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          duration: toast.duration ?? 5000,
        }

        set((state) => ({
          toasts: [...state.toasts, newToast],
        }))

        // Auto-dismiss
        if (newToast.duration > 0) {
          setTimeout(() => {
            get().removeToast(newToast.id)
          }, newToast.duration)
        }
      },

      removeToast: (id) => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }))
      },

      setLastPolled: (date) => {
        set({ lastPolled: date })
      },
    }),
    {
      name: 'notification-storage',
      partialize: (state) => ({
        notifications: state.notifications,
        unreadCount: state.unreadCount,
        lastPolled: state.lastPolled,
      }),
    },
  ),
)
