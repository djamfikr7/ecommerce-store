'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { User, Mail, Lock, Check } from 'lucide-react'
import { registerSchema, type RegisterInput } from '@/lib/validators/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { SocialLoginButton, PasswordInput, FormError, PasswordStrength } from '@/components/auth/auth-forms'
import { cn } from '@/lib/utils'

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [password, setPassword] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  const watchedPassword = watch('password', '')

  const onSubmit = async (data: RegisterInput) => {
    if (!termsAccepted) {
      setError('Please accept the terms and conditions')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // TODO: Integrate with NextAuth register
      console.log('Register data:', data)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Redirect on success
      router.push('/login?registered=true')
    } catch (err) {
      setError('Registration failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full max-w-md mx-auto"
    >
      <motion.div
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
      >
        <Card className="p-8">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl gradient-text">Create Account</CardTitle>
            <CardDescription>
              Join us to start shopping
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Social Login */}
            <div className="grid grid-cols-2 gap-3">
              <SocialLoginButton provider="google" />
              <SocialLoginButton provider="github" />
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border-default" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-surface-elevated px-2 text-slate-500">
                  or create with email
                </span>
              </div>
            </div>

            {/* Error Message */}
            <FormError message={error} onDismiss={() => setError(null)} />

            {/* Register Form */}
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
                  placeholder="you@example.com"
                  leftIcon={<Mail className="h-4 w-4" />}
                  error={errors.email?.message}
                  {...register('email')}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-slate-300">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                  leftIcon={<Lock className="h-4 w-4" />}
                  error={errors.password?.message}
                  {...register('password')}
                />
                <PasswordStrength password={watchedPassword} />
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => setTermsAccepted(!termsAccepted)}
                  className={cn(
                    'mt-0.5 h-5 w-5 rounded border-2 flex items-center justify-center transition-all',
                    termsAccepted
                      ? 'bg-accent-primary border-accent-primary'
                      : 'border-slate-500 hover:border-slate-400'
                  )}
                  aria-pressed={termsAccepted}
                >
                  {termsAccepted && <Check className="h-3 w-3 text-white" />}
                </button>
                <label className="text-sm text-slate-400 cursor-pointer">
                  I agree to the{' '}
                  <Link href="/terms" className="text-accent-primary hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-accent-primary hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center">
            <p className="text-sm text-slate-400">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-accent-primary hover:text-accent-primary-hover font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  )
}
