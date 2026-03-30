'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Check, Trash2 } from 'lucide-react'
import { useNotifications } from '@/lib/hooks/use-notifications'
import { NotificationItem } from './notification-item'

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useNotifications()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-xl border border-gray-700/50 bg-gradient-to-br from-gray-800/60 to-gray-900/60 p-2.5 text-gray-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_2px_8px_rgba(0,0,0,0.3)] transition-all duration-200 hover:text-white hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_4px_16px_rgba(0,0,0,0.4)] active:shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)]"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />

        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border border-red-400/30 bg-gradient-to-br from-red-500 to-red-600 px-1 text-[10px] font-bold text-white shadow-lg"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.div>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 z-50 mt-2 max-h-[600px] w-96 overflow-hidden rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-800/95 to-gray-900/95 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl"
          >
            {/* Header */}
            <div className="border-b border-gray-700/50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-xs text-gray-400">{unreadCount} unread</span>
                )}
              </div>

              {notifications.length > 0 && (
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-gradient-to-br from-blue-500/20 to-blue-600/20 px-3 py-1.5 text-xs font-medium text-blue-400 transition-all duration-200 hover:text-blue-300 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Mark all read
                    </button>
                  )}

                  <button
                    onClick={clearAllNotifications}
                    className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-gradient-to-br from-red-500/20 to-red-600/20 px-3 py-1.5 text-xs font-medium text-red-400 transition-all duration-200 hover:text-red-300 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Notifications List */}
            <div className="custom-scrollbar max-h-[480px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="mx-auto mb-3 h-12 w-12 text-gray-600" />
                  <p className="text-sm text-gray-500">No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-2 p-3">
                  <AnimatePresence mode="popLayout">
                    {notifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={markAsRead}
                        onMarkAsUnread={markAsUnread}
                        onDelete={deleteNotification}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  )
}
