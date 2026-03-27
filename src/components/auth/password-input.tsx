'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import type { InputProps } from '@/components/ui/input'

interface PasswordInputProps extends Omit<InputProps, 'type' | 'rightIcon'> {
  showStrength?: boolean
  onStrengthChange?: (strength: number) => void
}

export function PasswordInput({
  className,
  onStrengthChange,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)
    if (onStrengthChange) {
      onStrengthChange(calculateStrength(value))
    }
    props.onChange?.(e)
  }

  const calculateStrength = (pwd: string): number => {
    if (!pwd) return 0

    let strength = 0
    if (pwd.length >= 8) strength++
    if (/[A-Z]/.test(pwd)) strength++
    if (/[a-z]/.test(pwd)) strength++
    if (/[0-9]/.test(pwd)) strength++
    if (/[^A-Za-z0-9]/.test(pwd)) strength++

    return strength
  }

  return (
    <Input
      type={showPassword ? 'text' : 'password'}
      rightIcon={
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="p-1 hover:bg-surface-overlay rounded transition-colors"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-slate-400" />
          ) : (
            <Eye className="h-4 w-4 text-slate-400" />
          )}
        </button>
      }
      className={className}
      {...props}
      onChange={handleChange}
      value={password}
    />
  )
}

interface ConfirmPasswordInputProps extends Omit<InputProps, 'type' | 'rightIcon'> {
  passwordMatch?: boolean
}

export function ConfirmPasswordInput({
  className,
  passwordMatch,
  ...props
}: ConfirmPasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <Input
      type={showPassword ? 'text' : 'password'}
      rightIcon={
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="p-1 hover:bg-surface-overlay rounded transition-colors"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-slate-400" />
          ) : (
            <Eye className="h-4 w-4 text-slate-400" />
          )}
        </button>
      }
      className={className}
      {...props}
    />
  )
}
