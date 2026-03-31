'use client'

import { motion } from 'framer-motion'
import { ShoppingBag, Tag, Bell, Trash2, Circle } from 'lucide-react'
import { Notification, NotificationType } from '@/lib/stores/notification-store'
import { formatDistanceToNow } from 'date-fns'

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: (id: string) => void
  onMarkAsUnread: (id: string) => void
  onDelete: (id: string) => void
}

const notificationIcons: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  order: ShoppingBag,
  promotion: Tag,
  system: Bell,
}

const notificationColors: Record<NotificationType, string> = {
  order: 'text-blue-400',
  promotion: 'text-purple-400',
  system: 'text-gray-400',
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onMarkAsUnread,
  onDelete,
}: NotificationItemProps) {
  const Icon = notificationIcons[notification.type]
  const iconColor = notificationColors[notification.type]

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id)
    }
    if (notification.link) {
      window.location.href = notification.link
    }
  }

  const handleToggleRead = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (notification.read) {
      onMarkAsUnread(notification.id)
    } else {
      onMarkAsRead(notification.id)
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(notification.id)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.2 }}
      onClick={handleClick}
      className={`group relative rounded-xl border p-4 backdrop-blur-xl ${
        notification.read
          ? 'border-gray-700/30 bg-gradient-to-br from-gray-800/40 to-gray-900/40'
          : 'border-gray-600/40 bg-gradient-to-br from-gray-800/60 to-gray-900/60'
      } shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] transition-all duration-200 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_4px_16px_rgba(0,0,0,0.3)] ${notification.link ? 'cursor-pointer' : ''} `}
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-start justify-between gap-2">
            <h4
              className={`text-sm font-semibold ${notification.read ? 'text-gray-300' : 'text-white'}`}
            >
              {notification.title}
            </h4>
            {!notification.read && (
              <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
            )}
          </div>

          <p
            className={`mb-2 text-xs leading-relaxed ${notification.read ? 'text-gray-500' : 'text-gray-400'}`}
          >
            {notification.message}
          </p>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            </span>

            <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={handleToggleRead}
                className="rounded-lg p-1.5 text-gray-500 transition-all duration-200 hover:bg-white/10 hover:text-white"
                aria-label={notification.read ? 'Mark as unread' : 'Mark as read'}
              >
                <Circle
                  className="h-3.5 w-3.5"
                  fill={notification.read ? 'none' : 'currentColor'}
                />
              </button>

              <button
                onClick={handleDelete}
                className="rounded-lg p-1.5 text-gray-500 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400"
                aria-label="Delete notification"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
