'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  const [verificationCode, setVerificationCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  // Auto-verify if token is in URL
  useEffect(() => {
    if (token) {
      verifyWithToken(token)
    }
  }, [token])

  const verifyWithToken = async (verificationToken: string) => {
    setIsVerifying(true)
    setStatus('idle')

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verificationToken }),
      })

      const result = await response.json()

      if (result.success) {
        setStatus('success')
        setMessage('Email verified successfully! Redirecting to login...')
        setTimeout(() => {
          router.push('/login?verified=true')
        }, 2000)
      } else {
        setStatus('error')
        setMessage(result.error || 'Verification failed. Please try again.')
      }
    } catch (error) {
      setStatus('error')
      setMessage('An error occurred. Please try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!verificationCode.trim()) {
      setStatus('error')
      setMessage('Please enter the verification code')
      return
    }

    setIsVerifying(true)
    setStatus('idle')

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verificationCode }),
      })

      const result = await response.json()

      if (result.success) {
        setStatus('success')
        setMessage('Email verified successfully! Redirecting to login...')
        setTimeout(() => {
          router.push('/login?verified=true')
        }, 2000)
      } else {
        setStatus('error')
        setMessage(result.error || 'Invalid verification code. Please try again.')
      }
    } catch (error) {
      setStatus('error')
      setMessage('An error occurred. Please try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendEmail = async () => {
    if (!email) {
      setStatus('error')
      setMessage('Email address not found. Please register again.')
      return
    }

    setIsResending(true)
    setStatus('idle')

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()

      if (result.success) {
        setStatus('success')
        setMessage('Verification email sent! Please check your inbox.')
      } else {
        setStatus('error')
        setMessage(result.error || 'Failed to resend email. Please try again.')
      }
    } catch (error) {
      setStatus('error')
      setMessage('An error occurred. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mx-auto w-full max-w-md"
    >
      <Card className="p-8">
        <CardHeader className="text-center">
          <div className="bg-accent-primary/20 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            {status === 'success' ? (
              <CheckCircle className="h-8 w-8 text-green-500" />
            ) : status === 'error' ? (
              <XCircle className="h-8 w-8 text-red-500" />
            ) : isVerifying ? (
              <Loader2 className="h-8 w-8 animate-spin text-accent-primary" />
            ) : (
              <Mail className="h-8 w-8 text-accent-primary" />
            )}
          </div>
          <CardTitle className="gradient-text text-2xl">
            {status === 'success' ? 'Email Verified!' : 'Verify Your Email'}
          </CardTitle>
          <CardDescription>
            {status === 'success'
              ? 'Your email has been successfully verified'
              : token
                ? 'Verifying your email address...'
                : 'Enter the verification code sent to your email'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Status Message */}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-lg border p-4 text-center text-sm ${
                status === 'success'
                  ? 'border-green-500/30 bg-green-500/10 text-green-400'
                  : status === 'error'
                    ? 'border-red-500/30 bg-red-500/10 text-red-400'
                    : 'border-slate-500/30 bg-slate-500/10 text-slate-400'
              }`}
            >
              {message}
            </motion.div>
          )}

          {/* Verification Form - Only show if no token in URL and not verified */}
          {!token && status !== 'success' && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="code" className="text-sm font-medium text-slate-300">
                  Verification Code
                </label>
                <Input
                  id="code"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                  disabled={isVerifying}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                loading={isVerifying}
                disabled={isVerifying || !verificationCode.trim()}
              >
                {isVerifying ? 'Verifying...' : 'Verify Email'}
              </Button>
            </form>
          )}

          {/* Resend Email */}
          {status !== 'success' && email && (
            <div className="text-center">
              <p className="mb-3 text-sm text-slate-400">Did not receive the email?</p>
              <Button
                variant="outline"
                onClick={handleResendEmail}
                disabled={isResending}
                loading={isResending}
              >
                {isResending ? 'Sending...' : 'Resend Verification Email'}
              </Button>
            </div>
          )}

          {/* Back to Login */}
          {status === 'error' && (
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => router.push('/login')}
                className="text-accent-primary hover:text-accent-primary-hover"
              >
                Back to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
