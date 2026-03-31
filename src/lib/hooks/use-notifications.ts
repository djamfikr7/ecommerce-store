import { useEffect } from 'react'
import { useNotificationStore, NotificationType } from '@/lib/stores/notification-store'

const POLLING_INTERVAL = 30000 // 30 seconds

export function useNotifications() {
  const {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    lastPolled,
    setLastPolled,
  } = useNotificationStore()

  // Simulate polling for new notifications
  useEffect(() => {
    const pollNotifications = async () => {
      try {
        // In a real app, this would be an API call
        // const response = await fetch('/api/notifications');
        // const newNotifications = await response.json();

        setLastPolled(new Date())

        // For demo purposes, we'll just update the last polled time
        // In production, you'd process new notifications here
      } catch (error) {
        console.error('Failed to poll notifications:', error)
      }
    }

    // Initial poll
    pollNotifications()

    // Set up polling interval
    const intervalId = setInterval(pollNotifications, POLLING_INTERVAL)

    return () => clearInterval(intervalId)
  }, [setLastPolled])

  const addOrderNotification = (title: string, message: string, link?: string) => {
    addNotification({ type: 'order', title, message, link })
  }

  const addPromotionNotification = (title: string, message: string, link?: string) => {
    addNotification({ type: 'promotion', title, message, link })
  }

  const addSystemNotification = (title: string, message: string, link?: string) => {
    addNotification({ type: 'system', title, message, link })
  }

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    addOrderNotification,
    addPromotionNotification,
    addSystemNotification,
    lastPolled,
  }
}
