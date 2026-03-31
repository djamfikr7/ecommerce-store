'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home, Bug, ChevronDown, ChevronUp } from 'lucide-react'

function ErrorParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-1 w-1 rounded-full bg-red-500/40"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 0.8, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    console.error('[Global Error Boundary]', error)
  }, [error])

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden p-6"
      style={{
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
      }}
    >
      <ErrorParticles />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-lg"
      >
        <div className="neo-raised-lg relative overflow-hidden p-8 text-center sm:p-10">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-orange-500/5" />

          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 150, damping: 12 }}
            className="mb-8 flex justify-center"
          >
            <div className="relative">
              <div className="neo-pressed rounded-full bg-red-500/10 p-6">
                <AlertTriangle className="h-16 w-16 text-red-500" aria-hidden="true" />
              </div>
              <motion.div
                className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-red-500"
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="mb-3 text-3xl font-bold text-white sm:text-4xl">Something went wrong</h1>
            <p className="mb-2 text-base text-slate-400">
              {error.message || 'An unexpected error occurred.'}
            </p>
            {error.digest && <p className="text-xs text-slate-600">Error ID: {error.digest}</p>}
          </motion.div>

          {process.env.NODE_ENV === 'development' && error.stack && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-4"
            >
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 transition-colors hover:text-slate-300"
              >
                <Bug className="h-3.5 w-3.5" aria-hidden="true" />
                {showDetails ? 'Hide' : 'Show'} stack trace
                {showDetails ? (
                  <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                )}
              </button>
              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <pre className="mt-3 max-h-48 overflow-auto rounded-lg bg-black/30 p-3 text-left font-mono text-xs text-red-400/80">
                      {error.stack}
                    </pre>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4"
          >
            <motion.button
              onClick={reset}
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ y: 1, scale: 0.98 }}
              className="neo-raised-sm hover:neo-glow inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 text-base font-medium text-white transition-shadow duration-300"
            >
              <RefreshCw className="h-5 w-5" aria-hidden="true" />
              Try again
            </motion.button>
            <a href="/">
              <motion.div
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ y: 1, scale: 0.98 }}
                className="neo-raised-sm inline-flex items-center justify-center gap-2 rounded-lg bg-surface-elevated px-6 py-3 text-base font-medium text-white transition-colors duration-200 hover:bg-surface-overlay"
              >
                <Home className="h-5 w-5" aria-hidden="true" />
                Go home
              </motion.div>
            </a>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
