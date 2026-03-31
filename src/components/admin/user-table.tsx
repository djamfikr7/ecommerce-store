'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Mail,
  UserCog,
  Download,
  X,
  Trash2,
  AlertTriangle,
  Users,
  ArrowUpDown,
  Shield,
  Clock,
} from 'lucide-react'

type UserRole = 'USER' | 'ADMIN' | 'SUPERADMIN'

export interface UserListItem {
  id: string
  email: string
  name: string | null
  image: string | null
  role: UserRole
  orderCount: number
  totalSpent: number
  createdAt: string
}

interface UserTableProps {
  users: UserListItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  onSearch: (query: string) => void
  onRoleFilter: (role: string) => void
  onSort: (field: string, order: 'asc' | 'desc') => void
  onPageChange: (page: number) => void
  onRoleChange: (ids: string[], role: UserRole) => void
  onDelete: (ids: string[]) => void
  onExport: (ids: string[]) => void
  currentSearch: string
  currentRole: string
  currentSort: string
  currentOrder: 'asc' | 'desc'
  isLoading?: boolean
}

const roleOptions = [
  { value: 'all', label: 'All Roles' },
  { value: 'USER', label: 'User' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'SUPERADMIN', label: 'Super Admin' },
]

const roleColors: Record<UserRole, string> = {
  USER: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  ADMIN: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  SUPERADMIN: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
}

const roleIcons: Record<UserRole, React.ReactNode> = {
  USER: <Users size={12} />,
  ADMIN: <Shield size={12} />,
  SUPERADMIN: <Shield size={12} />,
}

export function UserTable({
  users,
  total,
  page,
  pageSize,
  totalPages,
  onSearch,
  onRoleFilter,
  onSort,
  onPageChange,
  onRoleChange,
  onDelete,
  onExport,
  currentSearch,
  currentRole,
  currentSort,
  currentOrder,
  isLoading,
}: UserTableProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [searchInput, setSearchInput] = useState(currentSearch)
  const [deleteConfirm, setDeleteConfirm] = useState<string[] | null>(null)
  const [roleChangeUser, setRoleChangeUser] = useState<{
    id: string
    name: string
    currentRole: UserRole
  } | null>(null)

  const toggleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(users.map((u) => u.id))
    }
  }

  const toggleSelectUser = (id: string) => {
    setSelectedUsers((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const handleSort = (field: string) => {
    const newOrder = currentSort === field && currentOrder === 'desc' ? 'asc' : 'desc'
    onSort(field, newOrder)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchInput)
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
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-4 backdrop-blur-sm">
        <div className="flex flex-col gap-4 lg:flex-row">
          {/* Search */}
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/50 py-2.5 pl-10 pr-4 text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('')
                  onSearch('')
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </form>

          {/* Role Filter */}
          <div className="relative">
            <select
              value={currentRole}
              onChange={(e) => onRoleFilter(e.target.value)}
              className="cursor-pointer appearance-none rounded-xl border border-slate-700 bg-slate-900/50 py-2.5 pl-4 pr-10 text-slate-200 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Filter
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
          </div>
        </div>

        {/* Bulk Actions */}
        <AnimatePresence>
          {selectedUsers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 overflow-hidden"
            >
              <div className="flex items-center gap-4 rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3">
                <span className="text-sm text-slate-300">
                  {selectedUsers.length} user
                  {selectedUsers.length > 1 ? 's' : ''} selected
                </span>
                <div className="flex-1" />
                <button
                  onClick={() => onExport(selectedUsers)}
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-cyan-400 transition-colors hover:bg-cyan-500/20"
                >
                  <Download size={16} />
                  Export
                </button>
                <button
                  onClick={() => setDeleteConfirm(selectedUsers)}
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-red-400 transition-colors hover:bg-red-500/20"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
                <button
                  onClick={() => setSelectedUsers([])}
                  className="text-slate-500 transition-colors hover:text-slate-300"
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-4 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500/50"
                  />
                </th>
                <th className="px-4 py-4 text-left">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 transition-colors hover:text-white"
                  >
                    User
                    <ArrowUpDown size={14} />
                  </button>
                </th>
                <th className="px-4 py-4 text-left">
                  <button
                    onClick={() => handleSort('role')}
                    className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 transition-colors hover:text-white"
                  >
                    Role
                    <ArrowUpDown size={14} />
                  </button>
                </th>
                <th className="px-4 py-4 text-left">
                  <button
                    onClick={() => handleSort('orderCount')}
                    className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 transition-colors hover:text-white"
                  >
                    Orders
                    <ArrowUpDown size={14} />
                  </button>
                </th>
                <th className="px-4 py-4 text-left">
                  <button
                    onClick={() => handleSort('totalSpent')}
                    className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 transition-colors hover:text-white"
                  >
                    Total Spent
                    <ArrowUpDown size={14} />
                  </button>
                </th>
                <th className="px-4 py-4 text-left">
                  <button
                    onClick={() => handleSort('createdAt')}
                    className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 transition-colors hover:text-white"
                  >
                    Joined
                    <ArrowUpDown size={14} />
                  </button>
                </th>
                <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-4 py-4">
                      <div className="flex gap-4">
                        <div className="h-4 w-4 animate-pulse rounded bg-slate-700/50" />
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 animate-pulse rounded-full bg-slate-700/50" />
                          <div className="space-y-2">
                            <div className="h-4 w-32 animate-pulse rounded bg-slate-700/50" />
                            <div className="h-3 w-40 animate-pulse rounded bg-slate-700/50" />
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Users className="mx-auto mb-4 text-slate-500" size={48} />
                    <p className="text-slate-400">No users found</p>
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className={`transition-colors hover:bg-slate-700/20 ${
                      index % 2 === 0 ? 'bg-slate-800/20' : ''
                    } ${selectedUsers.includes(user.id) ? 'bg-cyan-500/5' : ''}`}
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleSelectUser(user.id)}
                        className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500/50"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={user.name || user.email}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 text-sm font-medium text-white">
                            {getInitials(user.name, user.email)}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-slate-200">{user.name || 'Unnamed'}</p>
                          <p className="text-sm text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${roleColors[user.role]}`}
                      >
                        {roleIcons[user.role]}
                        {user.role === 'SUPERADMIN'
                          ? 'Super Admin'
                          : user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-300">{user.orderCount}</td>
                    <td className="px-4 py-4 font-medium text-slate-300">
                      ${(user.totalSpent / 100).toFixed(2)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Clock size={14} />
                        {formatDate(user.createdAt)}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-700/50 hover:text-white"
                          title="View details"
                        >
                          <Eye size={16} />
                        </Link>
                        <a
                          href={`mailto:${user.email}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-700/50 hover:text-white"
                          title="Send email"
                        >
                          <Mail size={16} />
                        </a>
                        <button
                          onClick={() =>
                            setRoleChangeUser({
                              id: user.id,
                              name: user.name || user.email,
                              currentRole: user.role,
                            })
                          }
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-700/50 hover:text-white"
                          title="Change role"
                        >
                          <UserCog size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-700/50 px-6 py-4 sm:flex-row">
            <p className="text-sm text-slate-400">
              Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total}{' '}
              users
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                className="rounded-lg bg-slate-800/50 p-2 text-slate-400 transition-colors hover:bg-slate-700/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft size={20} />
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNum: number
                if (totalPages <= 7) {
                  pageNum = i + 1
                } else if (page <= 4) {
                  pageNum = i + 1
                } else if (page >= totalPages - 3) {
                  pageNum = totalPages - 6 + i
                } else {
                  pageNum = page - 3 + i
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`h-10 w-10 rounded-lg text-sm font-medium transition-colors ${
                      pageNum === page
                        ? 'border border-cyan-500/30 bg-cyan-500/20 text-cyan-400'
                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              <button
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages}
                className="rounded-lg bg-slate-800/50 p-2 text-slate-400 transition-colors hover:bg-slate-700/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="mx-4 w-full max-w-md rounded-2xl border border-slate-700/50 bg-slate-900 p-6 shadow-2xl"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
                  <AlertTriangle className="text-red-400" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Delete User{deleteConfirm.length > 1 ? 's' : ''}
                  </h3>
                  <p className="text-sm text-slate-400">
                    Are you sure you want to delete {deleteConfirm.length} user
                    {deleteConfirm.length > 1 ? 's' : ''}? This will soft-delete their accounts.
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2 font-medium text-slate-300 transition-colors hover:bg-slate-700/50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onDelete(deleteConfirm)
                    setSelectedUsers([])
                    setDeleteConfirm(null)
                  }}
                  className="rounded-xl bg-red-500 px-4 py-2 font-medium text-white transition-colors hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Role Change Modal */}
      <AnimatePresence>
        {roleChangeUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setRoleChangeUser(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="mx-4 w-full max-w-md rounded-2xl border border-slate-700/50 bg-slate-900 p-6 shadow-2xl"
            >
              <h3 className="mb-1 text-lg font-semibold text-white">Change User Role</h3>
              <p className="mb-6 text-sm text-slate-400">
                Change role for <span className="text-slate-200">{roleChangeUser.name}</span>
              </p>
              <div className="space-y-2">
                {(['USER', 'ADMIN', 'SUPERADMIN'] as UserRole[]).map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      onRoleChange([roleChangeUser.id], role)
                      setRoleChangeUser(null)
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                      roleChangeUser.currentRole === role
                        ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400'
                        : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                    }`}
                  >
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${roleColors[role]}`}
                    >
                      {roleIcons[role]}
                      {role === 'SUPERADMIN'
                        ? 'Super Admin'
                        : role.charAt(0) + role.slice(1).toLowerCase()}
                    </span>
                    {roleChangeUser.currentRole === role && (
                      <span className="ml-auto text-xs text-cyan-400">Current</span>
                    )}
                  </button>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setRoleChangeUser(null)}
                  className="rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2 font-medium text-slate-300 transition-colors hover:bg-slate-700/50"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
