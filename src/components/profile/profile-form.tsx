'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Mail, Phone, Camera, Check } from 'lucide-react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { FormError } from '@/components/auth/form-error'
import { updateProfileAction } from '@/lib/actions/auth'
import { useNotificationStore } from '@/lib/stores/notification-store'
import { cn } from '@/lib/utils'

const profileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim()
    .optional()
    .nullable(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional()
    .nullable()
    .or(z.literal('')),
  image: z.string().url('Invalid URL format').optional().nullable().or(z.literal('')),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface UserData {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  phone?: string | null
}

interface ProfileFormProps {
  user: UserData
  onUserUpdate: (user: UserData) => void
}

export function ProfileForm({ user, onUserUpdate }: ProfileFormProps) {
  const addToast = useNotificationStore((state) => state.addToast)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || '',
      phone: user.phone || '',
      image: user.image || '',
    },
  })

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const formData = new FormData()
      if (data.name) formData.append('name', data.name)
      if (data.phone) formData.append('phone', data.phone)
      if (data.image) formData.append('image', data.image)

      const result = await updateProfileAction(user.id, formData)

      if (!result.success) {
        setError(result.error || 'Failed to update profile')
        addToast({
          type: 'error',
          title: 'Error',
          message: result.error || 'Failed to update profile',
        })
        return
      }

      setSuccess('Profile updated successfully')
      onUserUpdate(result.user as UserData)
      addToast({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile has been updated successfully',
      })
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError('Failed to update profile. Please try again.')
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update profile. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="p-6">
      <CardHeader>
        <CardTitle className="text-xl">Profile Information</CardTitle>
        <CardDescription>Update your personal information</CardDescription>
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
            <label htmlFor="name" className="text-sm font-medium text-slate-300">
              Full Name
            </label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              leftIcon={<User className="h-4 w-4" />}
              error={errors.name?.message}
              {...register('name')}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-300">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={user.email || ''}
              disabled
              leftIcon={<Mail className="h-4 w-4" />}
              className="cursor-not-allowed opacity-60"
            />
            <p className="text-xs text-slate-500">Email cannot be changed</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium text-slate-300">
              Phone Number
            </label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1234567890"
              leftIcon={<Phone className="h-4 w-4" />}
              error={errors.phone?.message}
              {...register('phone')}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="image" className="text-sm font-medium text-slate-300">
              Profile Image URL
            </label>
            <Input
              id="image"
              type="url"
              placeholder="https://example.com/avatar.jpg"
              leftIcon={<Camera className="h-4 w-4" />}
              error={errors.image?.message}
              {...register('image')}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating...' : 'Update Profile'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
