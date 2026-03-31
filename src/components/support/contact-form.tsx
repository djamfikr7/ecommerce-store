'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, CheckCircle, AlertCircle, User, Mail, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { contactFormSchema, type ContactFormInput } from '@/lib/validators/support'

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormInput>({
    resolver: zodResolver(contactFormSchema),
  })

  const onSubmit = async (data: ContactFormInput) => {
    setStatus('loading')
    setErrorMessage('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to send message')
      }

      setStatus('success')
      reset()
      setTimeout(() => setStatus('idle'), 5000)
    } catch (error) {
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong')
      setTimeout(() => setStatus('idle'), 5000)
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6 lg:p-8">
        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
              >
                <CheckCircle className="h-16 w-16 text-accent-success" />
              </motion.div>
              <h3 className="mt-4 text-xl font-semibold text-slate-100">Message Sent!</h3>
              <p className="mt-2 text-slate-400">
                Thank you for reaching out. We&apos;ll get back to you within 24 hours.
              </p>
              <Button variant="outline" className="mt-6" onClick={() => setStatus('idle')}>
                Send Another Message
              </Button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-300">
                    Full Name
                  </label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    leftIcon={<User className="h-4 w-4" />}
                    error={errors.name?.message}
                    {...register('name')}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-300">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    leftIcon={<Mail className="h-4 w-4" />}
                    error={errors.email?.message}
                    {...register('email')}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="mb-2 block text-sm font-medium text-slate-300">
                  Subject
                </label>
                <Input
                  id="subject"
                  placeholder="How can we help?"
                  leftIcon={<MessageSquare className="h-4 w-4" />}
                  error={errors.subject?.message}
                  {...register('subject')}
                />
              </div>

              <div>
                <label htmlFor="message" className="mb-2 block text-sm font-medium text-slate-300">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={6}
                  placeholder="Tell us more about your inquiry..."
                  className={`neo-inset focus:ring-accent-primary/50 flex w-full resize-none rounded-lg bg-surface-base px-4 py-3 text-base text-slate-100 transition-all duration-200 placeholder:text-slate-500 focus:border-accent-primary focus:outline-none focus:ring-2 ${
                    errors.message ? 'focus:ring-accent-danger/50 border-accent-danger' : ''
                  }`}
                  {...register('message')}
                />
                {errors.message && (
                  <p className="mt-1.5 text-sm text-accent-danger" role="alert">
                    {errors.message.message}
                  </p>
                )}
              </div>

              <AnimatePresence>
                {status === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-accent-danger/10 flex items-center gap-2 rounded-lg px-4 py-3 text-sm text-accent-danger"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {errorMessage}
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                type="submit"
                size="lg"
                loading={status === 'loading'}
                className="w-full sm:w-auto"
              >
                <Send className="mr-2 h-4 w-4" />
                Send Message
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
