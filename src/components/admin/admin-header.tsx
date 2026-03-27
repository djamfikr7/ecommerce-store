"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Search, LogOut, User, Settings, ChevronDown } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "order" | "alert" | "user";
}

// Mock notifications
const mockNotifications: Notification[] = [
  { id: "1", title: "New Order", message: "Order #ORD-015 has been placed", time: "5 min ago", read: false, type: "order" },
  { id: "2", title: "Low Stock Alert", message: "Wireless Headphones Pro is running low", time: "1 hour ago", read: false, type: "alert" },
  { id: "3", title: "New User", message: "Jessica Garcia just registered", time: "2 hours ago", read: true, type: "user" },
  { id: "4", title: "Order Shipped", message: "Order #ORD-012 has been shipped", time: "3 hours ago", read: true, type: "order" },
];

const adminUser = {
  name: "Admin User",
  email: "admin@store.com",
  role: "Administrator",
};

export function AdminHeader() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);

  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="relative hidden md:block w-96">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search orders, products, users..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
          />
        </div>

        <div className="flex items-center gap-4 ml-auto">
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
              aria-label="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold text-white bg-red-500 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-80 bg-slate-800/95 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-xl overflow-hidden"
                >
                  <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
                    <h3 className="text-white font-semibold">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-cyan-400 hover:text-cyan-300"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => markAsRead(notification.id)}
                        className={`p-4 border-b border-slate-700/30 cursor-pointer hover:bg-slate-700/30 transition-colors ${
                          !notification.read ? "bg-slate-700/20" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {!notification.read && (
                            <span className="w-2 h-2 mt-2 rounded-full bg-cyan-400 flex-shrink-0" />
                          )}
                          <div className={!notification.read ? "" : "ml-5"}>
                            <p className="text-slate-200 font-medium text-sm">
                              {notification.title}
                            </p>
                            <p className="text-slate-400 text-sm mt-0.5">
                              {notification.message}
                            </p>
                            <p className="text-slate-500 text-xs mt-1">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-slate-700/50">
                    <button className="w-full text-center text-sm text-cyan-400 hover:text-cyan-300 font-medium">
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
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-700/50 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white font-medium text-sm">
                AU
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-white text-sm font-medium">{adminUser.name}</p>
                <p className="text-slate-400 text-xs">{adminUser.role}</p>
              </div>
              <ChevronDown
                size={16}
                className={`hidden lg:block text-slate-400 transition-transform ${
                  showProfile ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-56 bg-slate-800/95 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-xl overflow-hidden"
                >
                  <div className="p-4 border-b border-slate-700/50">
                    <p className="text-white font-medium">{adminUser.name}</p>
                    <p className="text-slate-400 text-sm">{adminUser.email}</p>
                  </div>
                  <div className="p-2">
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors">
                      <User size={18} />
                      Profile
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors">
                      <Settings size={18} />
                      Settings
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors">
                      <LogOut size={18} />
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
  );
}
