'use client'

import { ReactNode, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, X, Loader2, AlertCircle, CheckCircle } from 'lucide-react'

interface SettingsFormProps {
  title: string
  description: string
  children: ReactNode
  onSave: () => Promise<void>
  onReset?: () => void
  isSaving?: boolean
  hasChanges?: boolean
  errors?: Record<string, string>
}

export function SettingsForm({
  title,
  description,
  children,
  onSave,
  onReset,
  isSaving = false,
  hasChanges = false,
  errors = {},
}: SettingsFormProps) {
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSave = async () => {
    await onSave()
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const hasErrors = Object.keys(errors).length > 0

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
      {/* Header */}
      <div className="border-b border-slate-700/50 px-6 py-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <p className="mt-1 text-sm text-slate-400">{description}</p>
          </div>
          {hasChanges && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/20 px-2.5 py-1 text-xs font-medium text-amber-400">
              Unsaved changes
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="space-y-6 p-6">{children}</div>

      {/* Validation Errors */}
      <AnimatePresence>
        {hasErrors && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-6"
          >
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
              <div className="mb-2 flex items-center gap-2 text-red-400">
                <AlertCircle size={16} />
                <span className="text-sm font-medium">Please fix the following errors:</span>
              </div>
              <ul className="list-inside list-disc space-y-1">
                {Object.entries(errors).map(([key, msg]) => (
                  <li key={key} className="text-xs text-red-300">
                    {msg}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mx-6 mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4"
          >
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle size={18} />
              <span className="text-sm font-medium">Settings saved successfully</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Actions */}
      <div className="flex items-center justify-between border-t border-slate-700/50 bg-slate-900/30 px-6 py-4">
        <div>
          {onReset && (
            <button
              onClick={onReset}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2 font-medium text-slate-300 transition-colors hover:bg-slate-700/50 disabled:opacity-50"
            >
              <X size={16} />
              Reset
            </button>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 px-5 py-2.5 font-medium text-white shadow-[0_4px_20px_rgba(6,182,212,0.3)] transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={16} />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  )
}

interface SettingsFieldProps {
  label: string
  description?: string
  error?: string | undefined
  children: ReactNode
}

export function SettingsField({ label, description, error, children }: SettingsFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-300">{label}</label>
      {description && <p className="text-xs text-slate-500">{description}</p>}
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex items-center gap-1 text-xs text-red-400"
          >
            <AlertCircle size={12} />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

interface SettingsInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export function SettingsInput({ error, className, ...props }: SettingsInputProps) {
  return (
    <input
      className={`w-full rounded-xl border bg-slate-900/50 px-4 py-2.5 text-slate-200 transition-colors placeholder:text-slate-500 focus:border-transparent focus:outline-none focus:ring-2 ${
        error
          ? 'border-red-500/50 focus:ring-red-500/50'
          : 'border-slate-700 focus:ring-cyan-500/50'
      } ${className || ''}`}
      {...props}
    />
  )
}

interface SettingsTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export function SettingsTextarea({ error, className, ...props }: SettingsTextareaProps) {
  return (
    <textarea
      className={`w-full resize-none rounded-xl border bg-slate-900/50 px-4 py-2.5 text-slate-200 transition-colors placeholder:text-slate-500 focus:border-transparent focus:outline-none focus:ring-2 ${
        error
          ? 'border-red-500/50 focus:ring-red-500/50'
          : 'border-slate-700 focus:ring-cyan-500/50'
      } ${className || ''}`}
      {...props}
    />
  )
}

interface SettingsToggleProps {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export function SettingsToggle({ label, description, checked, onChange }: SettingsToggleProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-700/50 bg-slate-900/30 p-4">
      <div>
        <span className="text-sm font-medium text-slate-300">{label}</span>
        {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          checked ? 'bg-cyan-500' : 'bg-slate-700'
        }`}
      >
        <motion.div
          animate={{ x: checked ? 20 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute left-0 top-1 h-4 w-4 rounded-full bg-white shadow-md"
        />
      </button>
    </div>
  )
}
