'use client'

import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Mail, Send, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Newsletter() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      // TODO: Implement newsletter subscription API
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setStatus('success')
      setMessage('Thanks for subscribing! Check your email for confirmation.')
      setEmail('')
    } catch (error) {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <section ref={ref} className="py-16 md:py-24">
      <div className="container-neo">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl"
        >
          <div className="neo-card relative overflow-hidden p-8 text-center md:p-12">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-10">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 90, 0],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="absolute right-0 top-0 h-64 w-64 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary blur-3xl"
              />
              <motion.div
                animate={{
                  scale: [1.2, 1, 1.2],
                  rotate: [90, 0, 90],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-gradient-to-br from-accent-secondary to-accent-info blur-3xl"
              />
            </div>

            {/* Content */}
            <div className="relative space-y-6">
              <div className="neo-raised-sm bg-accent-primary/20 mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full">
                <Mail className="h-8 w-8 text-accent-primary" />
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-bold md:text-4xl">Stay Updated</h2>
                <p className="mx-auto max-w-xl text-slate-400">
                  Subscribe to our newsletter and get exclusive deals, new arrivals, and special
                  offers delivered to your inbox.
                </p>
              </div>

              {status === 'success' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-4 py-4"
                >
                  <CheckCircle className="h-12 w-12 text-accent-success" />
                  <p className="font-medium text-accent-success">{message}</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="mx-auto max-w-md">
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="flex-1">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        className="neo-inset h-12 w-full rounded-lg bg-surface-base px-4 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                      />
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      loading={status === 'loading'}
                      disabled={status === 'loading'}
                    >
                      <Send className="mr-2 h-5 w-5" />
                      Subscribe
                    </Button>
                  </div>
                  {status === 'error' && (
                    <p className="mt-2 text-sm text-accent-danger">{message}</p>
                  )}
                </form>
              )}

              <p className="text-xs text-slate-500">
                By subscribing, you agree to our Privacy Policy and consent to receive updates from
                our company.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
