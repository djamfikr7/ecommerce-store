'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  Search,
  LogOut,
  User,
  Settings,
  ChevronDown,
  Sun,
  Moon,
  Check,
  X,
} from 'lucide-react'

interface Notification {
  id: string
  title: string
  message: string
  time: string
  read: boolean
  type: 'order' | 'alert' | 'user'
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'New Order',
    message: 'Order #ORD-015 has been placed',
    time: '5 min ago',
    read: false,
    type: 'order',
  },
  {
    id: '2',
    title: 'Low Stock Alert',
    message: 'Wireless Headphones Pro is running low',
    time: '1 hour ago',
    read: false,
    type: 'alert',
  },
  {
    id: '3',
    title: 'New User',
    message: 'Jessica Garcia just registered',
    time: '2 hours ago',
    read: true,
    type: 'user',
  },
  {
    id: '4',
    title: 'Order Shipped',
    message: 'Order #ORD-012 has been shipped',
    time: '3 hours ago',
    read: true,
    type: 'order',
  },
]

const adminUser = {
  name: 'Admin User',
  email: 'admin@store.com',
  role: 'Administrator',
}

const dropdownVariants = {
  hidden: { opacity: 0, y: 8, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', damping: 25, stiffness: 400 },
  },
  exit: { opacity: 0, y: 8, scale: 0.96, transition: { duration: 0.15 } },
}

export function AdminHeader() {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [notifications, setNotifications] = useState(mockNotifications)
  const [searchQuery, setSearchQuery] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(true)

  const notificationRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
      setShowNotifications(false)
    }
    if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
      setShowProfile(false)
    }
  }, [])

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [handleClickOutside])

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const clearNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const typeColors: Record<Notification['type'], string> = {
    order: 'bg-cyan-500/20 text-cyan-400',
    alert: 'bg-amber-500/20 text-amber-400',
    user: 'bg-purple-500/20 text-purple-400',
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-700/50 bg-slate-900/95 px-6 py-4 backdrop-blur-md">
      <div className="flex items-center justify-between gap-4">
        {/* Search */}
        <div className="relative max-w-md flex-1">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            size={18}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search orders, products, users..."
            className="w-full rounded-xl border border-slate-700/50 bg-slate-800/50 py-2.5 pl-11 pr-4 text-slate-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] transition-all duration-200 placeholder:text-slate-500 focus:border-cyan-500/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-700/50 hover:text-slate-300"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="relative rounded-xl bg-slate-800/50 p-2.5 text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors hover:bg-slate-700/50 hover:text-white"
            aria-label="Toggle dark mode"
          >
            <AnimatePresence mode="wait">
              {isDarkMode ? (
                <motion.div
                  key="moon"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Moon size={20} />
                </motion.div>
              ) : (
                <motion.div
                  key="sun"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Sun size={20} />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications)
                setShowProfile(false)
              }}
              className="relative rounded-xl bg-slate-800/50 p-2.5 text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors hover:bg-slate-700/50 hover:text-white"
              aria-label="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                >
                  {unreadCount}
                </motion.span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/95 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-md"
                >
                  <div className="flex items-center justify-between border-b border-slate-700/50 p-4">
                    <h3 className="font-semibold text-white">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="flex items-center gap-1 text-xs text-cyan-400 transition-colors hover:text-cyan-300"
                      >
                        <Check size={12} />
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-sm text-slate-500">No notifications</div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => markAsRead(notification.id)}
                          className={`group cursor-pointer border-b border-slate-700/30 p-4 transition-colors hover:bg-slate-700/30 ${
                            !notification.read ? 'bg-slate-700/20' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-xs font-medium ${typeColors[notification.type]}`}
                            >
                              {notification.type === 'order'
                                ? 'ORD'
                                : notification.type === 'alert'
                                  ? '!'
                                  : 'USR'}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="truncate text-sm font-medium text-slate-200">
                                  {notification.title}
                                </p>
                                {!notification.read && (
                                  <span className="h-2 w-2 flex-shrink-0 rounded-full bg-cyan-400 shadow-[0_0_4px_rgba(34,211,238,0.5)]" />
                                )}
                              </div>
                              <p className="mt-0.5 line-clamp-1 text-sm text-slate-400">
                                {notification.message}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">{notification.time}</p>
                            </div>
                            <button
                              onClick={(e) => clearNotification(notification.id, e)}
                              className="rounded-md p-1 text-slate-500 opacity-0 transition-all hover:bg-slate-600/50 hover:text-slate-300 group-hover:opacity-100"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="border-t border-slate-700/50 p-3">
                    <button className="w-full rounded-xl py-2 text-center text-sm font-medium text-cyan-400 transition-colors hover:bg-slate-700/30 hover:text-cyan-300">
                      View All Notifications
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => {
                setShowProfile(!showProfile)
                setShowNotifications(false)
              }}
              className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-slate-700/50"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 text-sm font-medium text-white shadow-[0_2px_8px_rgba(34,211,238,0.3)]">
                AU
              </div>
              <div className="hidden text-left lg:block">
                <p className="text-sm font-medium text-white">{adminUser.name}</p>
                <p className="text-xs text-slate-400">{adminUser.role}</p>
              </div>
              <ChevronDown
                size={16}
                className={`hidden text-slate-400 transition-transform duration-200 lg:block ${
                  showProfile ? 'rotate-180' : ''
                }`}
              />
            </button>

            <AnimatePresence>
              {showProfile && (
                <motion.div
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/95 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-md"
                >
                  <div className="border-b border-slate-700/50 p-4">
                    <p className="font-medium text-white">{adminUser.name}</p>
                    <p className="text-sm text-slate-400">{adminUser.email}</p>
                  </div>
                  <div className="p-2">
                    <button className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-slate-300 transition-colors hover:bg-slate-700/50 hover:text-white">
                      <User size={16} />
                      Profile
                    </button>
                    <button className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-slate-300 transition-colors hover:bg-slate-700/50 hover:text-white">
                      <Settings size={16} />
                      Settings
                    </button>
                    <div className="my-1 border-t border-slate-700/50" />
                    <button className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-500/10">
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  )
}
