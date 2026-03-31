'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingCart,
  DollarSign,
  Clock,
  UserCog,
  Activity,
} from 'lucide-react'
import { UserActions } from '@/components/admin/user-actions'

type UserRole = 'USER' | 'ADMIN' | 'SUPERADMIN'
type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'

interface Address {
  id: string
  type: string
  firstName: string
  lastName: string
  addressLine1: string
  addressLine2?: string
  city: string
  state?: string
  postalCode: string
  country: string
  isDefault: boolean
}

interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  total: number
  createdAt: string
}

interface AuditLog {
  id: string
  action: string
  entityType: string
  entityId: string
  oldValue: Record<string, unknown> | null
  newValue: Record<string, unknown> | null
  createdAt: string
}

interface UserDetail {
  id: string
  email: string
  name: string | null
  image: string | null
  role: UserRole
  phone: string | null
  createdAt: string
  updatedAt: string
  addresses: Address[]
  orders: Order[]
  ordersCount: number
  totalSpent: number
  lastOrderAt: string | null
}

const roleColors: Record<UserRole, string> = {
  USER: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  ADMIN: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  SUPERADMIN: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
}

const statusColors: Record<OrderStatus, string> = {
  PENDING: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  CONFIRMED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  PROCESSING: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  SHIPPED: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  DELIVERED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
  REFUNDED: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
}

const actionLabels: Record<string, string> = {
  UPDATE_USER_ROLE: 'Role changed',
  BAN_USER: 'Account banned',
  UNBAN_USER: 'Account unbanned',
  DELETE_USER: 'Account deleted',
  RESTORE_USER: 'Account restored',
  RESET_PASSWORD: 'Password reset requested',
}

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  const [user, setUser] = useState<UserDetail | null>(null)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'orders' | 'activity'>('orders')

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`)
      const data = await res.json()
      if (data.success) {
        setUser(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  const fetchAuditLogs = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/audit-logs?entityType=User&entityId=${userId}&limit=20`)
      const data = await res.json()
      if (data.success) {
        setAuditLogs(data.data.logs || [])
      }
    } catch {
      // Audit logs may not exist yet
    }
  }, [userId])

  useEffect(() => {
    fetchUser()
    fetchAuditLogs()
  }, [fetchUser, fetchAuditLogs])

  const handleRoleChange = async (id: string, role: UserRole) => {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    })
    if (res.ok) {
      fetchUser()
      fetchAuditLogs()
    }
  }

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      fetchUser()
      fetchAuditLogs()
    }
  }

  const handleRestore = async (id: string) => {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restore: true }),
    })
    if (res.ok) {
      fetchUser()
      fetchAuditLogs()
    }
  }

  const handleResetPassword = async (id: string) => {
    await fetch(`/api/admin/users/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset-password' }),
    })
    fetchAuditLogs()
  }

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return email.slice(0, 2).toUpperCase()
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-700/50" />
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 animate-pulse rounded-full bg-slate-700/50" />
            <div className="space-y-2">
              <div className="h-6 w-40 animate-pulse rounded bg-slate-700/50" />
              <div className="h-4 w-24 animate-pulse rounded bg-slate-700/50" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6">
              <div className="h-16 w-full animate-pulse rounded bg-slate-700/50" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-lg text-slate-400">User not found</p>
        <Link href="/admin/users" className="mt-4 text-cyan-400 hover:text-cyan-300">
          Back to users
        </Link>
      </div>
    )
  }

  const isDeleted = false // Would come from user data in real implementation

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="rounded-xl bg-slate-800/50 p-2 text-slate-400 transition-colors hover:bg-slate-700/50 hover:text-white"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-4">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name || user.email}
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 text-xl font-bold text-white">
                {getInitials(user.name, user.email)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white lg:text-3xl">
                  {user.name || 'Unnamed User'}
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${roleColors[user.role]}`}
                >
                  {user.role === 'SUPERADMIN'
                    ? 'Super Admin'
                    : user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                </span>
              </div>
              <p className="mt-1 text-slate-400">Member since {formatDate(user.createdAt)}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <a
            href={`mailto:${user.email}`}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2 font-medium text-slate-300 transition-colors hover:bg-slate-700/50"
          >
            <Mail size={18} />
            Send Email
          </a>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-cyan-500/20 p-3">
              <ShoppingCart className="text-cyan-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-400">Total Orders</p>
              <p className="text-2xl font-bold text-white">{user.ordersCount}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-500/20 p-3">
              <DollarSign className="text-emerald-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-400">Total Spent</p>
              <p className="text-2xl font-bold text-white">${(user.totalSpent / 100).toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-purple-500/20 p-3">
              <Calendar className="text-purple-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-400">Average Order</p>
              <p className="text-2xl font-bold text-white">
                $
                {user.ordersCount > 0
                  ? (user.totalSpent / 100 / user.ordersCount).toFixed(2)
                  : '0.00'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Tabs */}
          <div className="flex gap-1 rounded-xl border border-slate-700/50 bg-slate-800/30 p-1">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === 'orders'
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShoppingCart size={16} />
              Orders ({user.ordersCount})
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === 'activity'
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity size={16} />
              Activity Log
            </button>
          </div>

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Order
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Status
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {user.orders.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                          No orders yet
                        </td>
                      </tr>
                    ) : (
                      user.orders.map((order, index) => (
                        <motion.tr
                          key={order.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className={`transition-colors hover:bg-slate-700/20 ${
                            index % 2 === 0 ? 'bg-slate-800/20' : ''
                          }`}
                        >
                          <td className="px-6 py-4">
                            <Link
                              href={`/admin/orders/${order.id}`}
                              className="font-medium text-cyan-400 hover:text-cyan-300"
                            >
                              {order.orderNumber}
                            </Link>
                          </td>
                          <td className="px-6 py-4 text-slate-400">
                            {formatDateTime(order.createdAt)}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${statusColors[order.status]}`}
                            >
                              {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-medium text-slate-200">
                            ${(order.total / 100).toFixed(2)}
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
              <div className="p-6">
                {auditLogs.length === 0 ? (
                  <p className="py-8 text-center text-slate-400">No activity recorded yet</p>
                ) : (
                  <div className="space-y-4">
                    {auditLogs.map((log, index) => (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-start gap-4 rounded-xl border border-slate-700 bg-slate-900/50 p-4"
                      >
                        <div className="rounded-lg bg-slate-700/50 p-2">
                          <Clock size={16} className="text-slate-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-slate-200">
                            {actionLabels[log.action] || log.action}
                          </p>
                          {log.oldValue && log.newValue && (
                            <p className="mt-1 text-sm text-slate-400">
                              {log.action === 'UPDATE_USER_ROLE' && (
                                <>
                                  Role:{' '}
                                  <span className="text-slate-300">
                                    {(log.oldValue as Record<string, string>).role || 'N/A'}
                                  </span>{' '}
                                  →{' '}
                                  <span className="text-cyan-400">
                                    {(log.newValue as Record<string, string>).role || 'N/A'}
                                  </span>
                                </>
                              )}
                            </p>
                          )}
                          <p className="mt-1 text-xs text-slate-500">
                            {formatDateTime(log.createdAt)}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Info */}
          <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
            <div className="border-b border-slate-700/50 p-6">
              <h2 className="text-lg font-semibold text-white">Contact Information</h2>
            </div>
            <div className="space-y-4 p-6">
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-slate-400" />
                <a
                  href={`mailto:${user.email}`}
                  className="text-slate-200 transition-colors hover:text-cyan-400"
                >
                  {user.email}
                </a>
              </div>
              {user.phone && (
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-slate-400" />
                  <a
                    href={`tel:${user.phone}`}
                    className="text-slate-200 transition-colors hover:text-cyan-400"
                  >
                    {user.phone}
                  </a>
                </div>
              )}
              {!user.phone && (
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-slate-500" />
                  <span className="text-sm text-slate-500">No phone on file</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-slate-400" />
                <span className="text-sm text-slate-400">Joined {formatDate(user.createdAt)}</span>
              </div>
              {user.lastOrderAt && (
                <div className="flex items-center gap-3">
                  <ShoppingCart size={18} className="text-slate-400" />
                  <span className="text-sm text-slate-400">
                    Last order {formatDate(user.lastOrderAt)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Addresses */}
          {user.addresses.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
              <div className="border-b border-slate-700/50 p-6">
                <h2 className="text-lg font-semibold text-white">Saved Addresses</h2>
              </div>
              <div className="space-y-4 p-6">
                {user.addresses.map((address) => (
                  <div
                    key={address.id}
                    className="rounded-xl border border-slate-700 bg-slate-900/50 p-4"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-medium text-slate-200">
                        {address.firstName} {address.lastName}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-slate-700/50 px-2 py-0.5 text-xs text-slate-500">
                          {address.type}
                        </span>
                        {address.isDefault && (
                          <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-xs text-cyan-400">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="mt-0.5 text-slate-500" />
                      <div className="text-sm text-slate-400">
                        <p>{address.addressLine1}</p>
                        {address.addressLine2 && <p>{address.addressLine2}</p>}
                        <p>
                          {address.city}
                          {address.state && `, ${address.state}`} {address.postalCode}
                        </p>
                        <p>{address.country}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Account Actions */}
          <UserActions
            userId={user.id}
            userName={user.name || user.email}
            currentRole={user.role}
            isDeleted={isDeleted}
            onRoleChange={handleRoleChange}
            onDelete={handleDelete}
            onRestore={handleRestore}
            onResetPassword={handleResetPassword}
          />
        </div>
      </div>
    </div>
  )
}
