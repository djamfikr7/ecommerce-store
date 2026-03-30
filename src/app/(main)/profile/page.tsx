'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Mail, Phone, Lock, Camera, Check, AlertCircle } from 'lucide-react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { FormError } from '@/components/auth/form-error'
import { updateProfileAction, updatePasswordAction, getSessionAction } from '@/lib/actions/auth'
import { cn } from '@/lib/utils'

// Validation schemas
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

type ProfileFormData = z.infer<typeof profileSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

interface UserData {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  phone?: string | null
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false)
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false)

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  })

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  // Load user data
  useEffect(() => {
    async function loadUser() {
      try {
        const session = await getSessionAction()
        if (!session?.user) {
          router.push('/login')
          return
        }
        setUser(session.user as UserData)
        resetProfile({
          name: session.user.name || '',
          phone: (session.user as UserData).phone || '',
          image: session.user.image || '',
        })
      } catch (error) {
        setProfileError('Failed to load user data')
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [router, resetProfile])

  // Handle profile update
  const onSubmitProfile = async (data: ProfileFormData) => {
    if (!user) return

    setIsSubmittingProfile(true)
    setProfileError(null)
    setProfileSuccess(null)

    try {
      const formData = new FormData()
      if (data.name) formData.append('name', data.name)
      if (data.phone) formData.append('phone', data.phone)
      if (data.image) formData.append('image', data.image)

      const result = await updateProfileAction(user.id, formData)

      if (!result.success) {
        setProfileError(result.error || 'Failed to update profile')
        return
      }

      setProfileSuccess('Profile updated successfully')
      setUser(result.user as UserData)

      // Clear success message after 3 seconds
      setTimeout(() => setProfileSuccess(null), 3000)
    } catch (error) {
      setProfileError('Failed to update profile. Please try again.')
    } finally {
      setIsSubmittingProfile(false)
    }
  }

  // Handle password update
  const onSubmitPassword = async (data: PasswordFormData) => {
    if (!user) return

    setIsSubmittingPassword(true)
    setPasswordError(null)
    setPasswordSuccess(null)

    try {
      const result = await updatePasswordAction(user.id, data.currentPassword, data.newPassword)

      if (!result.success) {
        setPasswordError(result.error || 'Failed to update password')
        return
      }

      setPasswordSuccess('Password updated successfully')
      resetPassword()

      // Clear success message after 3 seconds
      setTimeout(() => setPasswordSuccess(null), 3000)
    } catch (error) {
      setPasswordError('Failed to update password. Please try again.')
    } finally {
      setIsSubmittingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-accent-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mx-auto w-full max-w-4xl space-y-6"
    >
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-6"
      >
        <Avatar
          src={user.image || null}
          alt={user.name || 'User'}
          fallback={user.name || user.email || 'U'}
          size="xl"
        />
        <div>
          <h1 className="gradient-text text-3xl font-bold">{user.name || 'User'}</h1>
          <p className="mt-1 text-slate-400">{user.email}</p>
        </div>
      </motion.div>

      {/* Profile Information Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-6">
          <CardHeader>
            <CardTitle className="text-xl">Profile Information</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Success Message */}
            <AnimatePresence mode="wait">
              {profileSuccess && (
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
                  <span>{profileSuccess}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            <FormError message={profileError} onDismiss={() => setProfileError(null)} />

            {/* Profile Form */}
            <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-slate-300">
                  Full Name
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  leftIcon={<User className="h-4 w-4" />}
                  error={profileErrors.name?.message}
                  {...registerProfile('name')}
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
                  error={profileErrors.phone?.message}
                  {...registerProfile('phone')}
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
                  error={profileErrors.image?.message}
                  {...registerProfile('image')}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                loading={isSubmittingProfile}
                disabled={isSubmittingProfile}
              >
                {isSubmittingProfile ? 'Updating...' : 'Update Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Change Password Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-6">
          <CardHeader>
            <CardTitle className="text-xl">Change Password</CardTitle>
            <CardDescription>Update your password to keep your account secure</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Success Message */}
            <AnimatePresence mode="wait">
              {passwordSuccess && (
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
                  <span>{passwordSuccess}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            <FormError message={passwordError} onDismiss={() => setPasswordError(null)} />

            {/* Password Form */}
            <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="currentPassword" className="text-sm font-medium text-slate-300">
                  Current Password
                </label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="Enter your current password"
                  leftIcon={<Lock className="h-4 w-4" />}
                  error={passwordErrors.currentPassword?.message}
                  {...registerPassword('currentPassword')}
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
                  error={passwordErrors.newPassword?.message}
                  {...registerPassword('newPassword')}
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
                  error={passwordErrors.confirmPassword?.message}
                  {...registerPassword('confirmPassword')}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                loading={isSubmittingPassword}
                disabled={isSubmittingPassword}
              >
                {isSubmittingPassword ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
