'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Camera, User, Mail, Phone, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { FormError } from '@/components/auth/form-error'
import { cn } from '@/lib/utils'

export default function ProfilePage() {
  const t = useTranslations()
  const { data: session, update } = useSession()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const user = session?.user

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      image: user?.image || '',
      phone: '',
    },
  })

  const onSubmit = async (data: any) => {
    if (!session) {
      router.push('/login?callbackUrl=/profile')
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Update session
      await update({
        ...session,
        user: {
          ...session.user,
          name: data.name || session.user.name,
          image: data.image || session.user.image,
        },
      })

      setSuccess(true)
    } catch (err) {
      setError(t('errors.generic'))
    } finally {
      setIsSubmitting(false)
    }
  }

  // Redirect to login if not authenticated
  if (!session && typeof window !== 'undefined') {
    router.push('/login?callbackUrl=/profile')
    return null
  }

  return (
    <div className="container-neo py-8 max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text">{t('profile.title')}</h1>
          <p className="text-slate-400 mt-1">{t('profile.subtitle')}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('profile.infoTitle')}</CardTitle>
            <CardDescription>
              {t('profile.infoDesc')}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar
                    src={user?.image}
                    alt={user?.name || 'User'}
                    fallback={user?.name || user?.email || 'U'}
                    size="xl"
                  />
                  <button
                    type="button"
                    className={cn(
                      'absolute bottom-0 right-0 p-2',
                      'neo-raised rounded-full',
                      'bg-accent-primary text-white',
                      'hover:bg-accent-primary-hover',
                      'transition-colors cursor-pointer'
                    )}
                    aria-label="Upload avatar"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">{t('profile.photoLabel')}</p>
                  <p className="text-xs text-slate-500">
                    {t('profile.photoNote')}
                  </p>
                </div>
              </div>

              {/* Error/Success Messages */}
              {error && <FormError message={error} onDismiss={() => setError(null)} />}

              {success && (
                <div className="neo-inset px-4 py-3 rounded-lg bg-accent-success/10 border border-accent-success/30 text-accent-success text-sm">
                  {t('profile.success')}
                </div>
              )}

              {/* Form Fields */}
              <div className="grid gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-slate-300">
                    {t('profile.nameLabel')}
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
                    {t('profile.emailLabel')}
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    leftIcon={<Mail className="h-4 w-4" />}
                    disabled
                    className="opacity-60 cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-500">
                    {t('profile.emailNote')}
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium text-slate-300">
                    {t('profile.phoneLabel')}
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
              </div>

              <CardFooter className="px-0">
                <Button
                  type="submit"
                  loading={isSubmitting}
                  disabled={isSubmitting || !isDirty}
                  className="ml-auto"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {t('common.save')}
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
