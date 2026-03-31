'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Check } from 'lucide-react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { FormError } from '@/components/auth/form-error'
import { updatePasswordAction } from '@/lib/actions/auth'
import { useNotificationStore } from '@/lib/stores/notification-store'
import { cn } from '@/lib/utils'

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[A-Z])(?=.*\d).{8,}$/,
        'Password must contain at least 1 uppercase letter and 1 number',
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type PasswordFormData = z.infer<typeof passwordSchema>

interface PasswordChangeProps {
  userId: string
}

export function PasswordChange({ userId }: PasswordChangeProps) {
  const addToast = useNotificationStore((state) => state.addToast)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  const onSubmit = async (data: PasswordFormData) => {
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await updatePasswordAction(userId, data.currentPassword, data.newPassword)

      if (!result.success) {
        setError(result.error || 'Failed to update password')
        addToast({
          type: 'error',
          title: 'Error',
          message: result.error || 'Failed to update password',
        })
        return
      }

      setSuccess('Password updated successfully')
      reset()
      addToast({
        type: 'success',
        title: 'Password Updated',
        message: 'Your password has been changed successfully',
      })
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError('Failed to update password. Please try again.')
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update password. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="p-6">
      <CardHeader>
        <CardTitle className="text-xl">Change Password</CardTitle>
        <CardDescription>Update your password to keep your account secure</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <AnimatePresence mode="wait">
          {success && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className={cn(
                'neo-inset flex items-center gap-2 rounded-lg px-4 py-3',
                'bg-accent-success/10 border-accent-success/30 border',
                'text-sm text-accent-success',
              )}
            >
              <Check className="h-4 w-4 flex-shrink-0" />
              <span>{success}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <FormError message={error} onDismiss={() => setError(null)} />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="currentPassword" className="text-sm font-medium text-slate-300">
              Current Password
            </label>
            <Input
              id="currentPassword"
              type="password"
              placeholder="Enter your current password"
              leftIcon={<Lock className="h-4 w-4" />}
              error={errors.currentPassword?.message}
              {...register('currentPassword')}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="newPassword" className="text-sm font-medium text-slate-300">
              New Password
            </label>
            <Input
              id="newPassword"
              type="password"
              placeholder="Enter your new password"
              leftIcon={<Lock className="h-4 w-4" />}
              error={errors.newPassword?.message}
              {...register('newPassword')}
            />
            <p className="text-xs text-slate-500">
              Must be at least 8 characters with 1 uppercase letter and 1 number
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-300">
              Confirm New Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your new password"
              leftIcon={<Lock className="h-4 w-4" />}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating...' : 'Update Password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
