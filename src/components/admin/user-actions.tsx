'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, UserCog, Trash2, Ban, Unlock, AlertTriangle, Key, ChevronDown } from 'lucide-react'

type UserRole = 'USER' | 'ADMIN' | 'SUPERADMIN'

interface UserActionsProps {
  userId: string
  userName: string
  currentRole: UserRole
  isDeleted: boolean
  onRoleChange: (userId: string, role: UserRole) => Promise<void>
  onDelete: (userId: string) => Promise<void>
  onRestore: (userId: string) => Promise<void>
  onResetPassword: (userId: string) => Promise<void>
}

const roleColors: Record<UserRole, string> = {
  USER: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  ADMIN: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  SUPERADMIN: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
}

export function UserActions({
  userId,
  userName,
  currentRole,
  isDeleted,
  onRoleChange,
  onDelete,
  onRestore,
  onResetPassword,
}: UserActionsProps) {
  const [showRoleMenu, setShowRoleMenu] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{
    type: 'delete' | 'reset' | UserRole
    label: string
    description: string
    variant: 'danger' | 'warning' | 'default'
  } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConfirm = async () => {
    if (!confirmAction) return
    setIsSubmitting(true)
    try {
      if (confirmAction.type === 'delete') {
        await onDelete(userId)
      } else if (confirmAction.type === 'reset') {
        await onResetPassword(userId)
      } else {
        await onRoleChange(userId, confirmAction.type as UserRole)
      }
    } finally {
      setIsSubmitting(false)
      setConfirmAction(null)
    }
  }

  const roles: { value: UserRole; label: string }[] = [
    { value: 'USER', label: 'User' },
    { value: 'ADMIN', label: 'Admin' },
    { value: 'SUPERADMIN', label: 'Super Admin' },
  ]

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
        <div className="border-b border-slate-700/50 p-6">
          <h2 className="text-lg font-semibold text-white">Account Actions</h2>
        </div>
        <div className="space-y-3 p-6">
          {/* Change Role */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex w-full items-center justify-between gap-3 rounded-xl bg-slate-900/50 px-4 py-3 text-slate-300 transition-colors hover:bg-slate-800"
            >
              <div className="flex items-center gap-3">
                <Shield size={18} />
                <span>Change Role</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${roleColors[currentRole]}`}
                >
                  {currentRole === 'SUPERADMIN'
                    ? 'Super Admin'
                    : currentRole.charAt(0) + currentRole.slice(1).toLowerCase()}
                </span>
                <ChevronDown
                  size={16}
                  className={`text-slate-400 transition-transform ${showRoleMenu ? 'rotate-180' : ''}`}
                />
              </div>
            </button>

            <AnimatePresence>
              {showRoleMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute left-0 right-0 top-full z-10 mt-2 overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl"
                >
                  {roles.map((role) => (
                    <button
                      key={role.value}
                      onClick={() => {
                        setShowRoleMenu(false)
                        if (role.value !== currentRole) {
                          setConfirmAction({
                            type: role.value,
                            label: `Change role to ${role.label}`,
                            description: `Change ${userName}'s role from ${currentRole === 'SUPERADMIN' ? 'Super Admin' : currentRole.charAt(0) + currentRole.slice(1).toLowerCase()} to ${role.label}?`,
                            variant: role.value === 'SUPERADMIN' ? 'warning' : 'default',
                          })
                        }
                      }}
                      className={`flex w-full items-center justify-between px-4 py-3 text-left transition-colors ${
                        role.value === currentRole
                          ? 'bg-cyan-500/10 text-cyan-400'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${roleColors[role.value]}`}
                      >
                        {role.label}
                      </span>
                      {role.value === currentRole && (
                        <span className="text-xs text-cyan-400">Current</span>
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Reset Password */}
          <button
            onClick={() =>
              setConfirmAction({
                type: 'reset',
                label: 'Reset Password',
                description: `Send a password reset email to ${userName}? They will receive a link to set a new password.`,
                variant: 'default',
              })
            }
            className="flex w-full items-center gap-3 rounded-xl bg-slate-900/50 px-4 py-3 text-slate-300 transition-colors hover:bg-slate-800"
          >
            <Key size={18} />
            Reset Password
          </button>

          {/* Delete / Restore */}
          {isDeleted ? (
            <button
              onClick={() => onRestore(userId)}
              className="flex w-full items-center gap-3 rounded-xl bg-emerald-500/10 px-4 py-3 text-emerald-400 transition-colors hover:bg-emerald-500/20"
            >
              <Unlock size={18} />
              Restore Account
            </button>
          ) : (
            <button
              onClick={() =>
                setConfirmAction({
                  type: 'delete',
                  label: 'Delete Account',
                  description: `Soft-delete ${userName}'s account? Their data will be preserved but the account will be deactivated. This can be restored later.`,
                  variant: 'danger',
                })
              }
              className="flex w-full items-center gap-3 rounded-xl bg-red-500/10 px-4 py-3 text-red-400 transition-colors hover:bg-red-500/20"
            >
              <Trash2 size={18} />
              Delete Account
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmAction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setConfirmAction(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="mx-4 w-full max-w-md rounded-2xl border border-slate-700/50 bg-slate-900 p-6 shadow-2xl"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${
                    confirmAction.variant === 'danger'
                      ? 'bg-red-500/20'
                      : confirmAction.variant === 'warning'
                        ? 'bg-amber-500/20'
                        : 'bg-cyan-500/20'
                  }`}
                >
                  {confirmAction.variant === 'danger' ? (
                    <AlertTriangle className="text-red-400" size={24} />
                  ) : confirmAction.variant === 'warning' ? (
                    <AlertTriangle className="text-amber-400" size={24} />
                  ) : (
                    <Shield className="text-cyan-400" size={24} />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{confirmAction.label}</h3>
                  <p className="text-sm text-slate-400">{confirmAction.description}</p>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setConfirmAction(null)}
                  disabled={isSubmitting}
                  className="rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2 font-medium text-slate-300 transition-colors hover:bg-slate-700/50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isSubmitting}
                  className={`rounded-xl px-4 py-2 font-medium text-white transition-colors disabled:opacity-50 ${
                    confirmAction.variant === 'danger'
                      ? 'bg-red-500 hover:bg-red-600'
                      : confirmAction.variant === 'warning'
                        ? 'bg-amber-500 hover:bg-amber-600'
                        : 'bg-cyan-500 hover:bg-cyan-600'
                  }`}
                >
                  {isSubmitting ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
