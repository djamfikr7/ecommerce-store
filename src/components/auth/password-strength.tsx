'use client'

import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PasswordStrengthProps {
  password: string
  className?: string
}

const strengthLabels = ['Weak', 'Medium', 'Strong', 'Very Strong']

const strengthColors = {
  0: 'bg-slate-600',
  1: 'bg-accent-danger',
  2: 'bg-accent-warning',
  3: 'bg-accent-success',
  4: 'bg-accent-success',
}

const strengthProgressColors = {
  0: 'bg-slate-600',
  1: 'bg-accent-danger',
  2: 'bg-accent-warning',
  3: 'bg-accent-success',
  4: 'bg-gradient-to-r from-accent-warning to-accent-success',
}

interface CriteriaItemProps {
  met: boolean
  label: string
}

function CriteriaItem({ met, label }: CriteriaItemProps) {
  return (
    <li className="flex items-center gap-2 text-sm">
      {met ? (
        <Check className="h-4 w-4 text-accent-success" />
      ) : (
        <X className="h-4 w-4 text-slate-500" />
      )}
      <span className={met ? 'text-slate-300' : 'text-slate-500'}>
        {label}
      </span>
    </li>
  )
}

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const criteria = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }

  const metCount = Object.values(criteria).filter(Boolean).length
  const strength = metCount === 0 ? 0 : metCount

  if (!password) return null

  return (
    <div className={cn('space-y-3', className)}>
      {/* Strength bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400">Password Strength</span>
          <span
            className={cn(
              'text-xs font-medium',
              strength === 0 && 'text-slate-500',
              strength === 1 && 'text-accent-danger',
              strength === 2 && 'text-accent-warning',
              strength >= 3 && 'text-accent-success'
            )}
          >
            {strength > 0 ? strengthLabels[strength - 1] : 'Too short'}
          </span>
        </div>
        <div className="neo-inset h-2 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(strength / 4) * 100}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={cn(
              'h-full rounded-full transition-colors',
              strengthProgressColors[strength]
            )}
          />
        </div>
      </div>

      {/* Criteria checklist */}
      <ul className="grid grid-cols-2 gap-1">
        <CriteriaItem met={criteria.length} label="8+ characters" />
        <CriteriaItem met={criteria.uppercase} label="Uppercase letter" />
        <CriteriaItem met={criteria.number} label="Number" />
        <CriteriaItem met={criteria.special} label="Special character" />
      </ul>
    </div>
  )
}
