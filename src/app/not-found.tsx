'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Search, ArrowLeft, Sparkles, ShoppingBag } from 'lucide-react'

function FloatingOrb({ delay, x, y, size }: { delay: number; x: string; y: string; size: string }) {
  return (
    <motion.div
      className="pointer-events-none absolute rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-2xl"
      style={{ left: x, top: y, width: size, height: size }}
      animate={{
        scale: [1, 1.3, 1],
        opacity: [0.3, 0.6, 0.3],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
    />
  )
}

function GlitchText({ children }: { children: string }) {
  const chars = children.split('')
  return (
    <span className="inline-flex" aria-label={children}>
      {chars.map((char, i) => (
        <motion.span
          key={i}
          className="inline-block"
          animate={{
            y: [0, -2, 0],
            color: ['#f1f5f9', '#a855f7', '#ec4899'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.08,
            ease: 'easeInOut',
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </span>
  )
}

export default function GlobalNotFound() {
  const [query, setQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-6">
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
        }}
      />

      <FloatingOrb delay={0} x="10%" y="20%" size="300px" />
      <FloatingOrb delay={1.3} x="70%" y="10%" size="250px" />
      <FloatingOrb delay={2.6} x="50%" y="70%" size="350px" />
      <FloatingOrb delay={0.7} x="80%" y="80%" size="200px" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-2xl"
      >
        <div className="neo-raised-lg relative overflow-hidden p-8 text-center sm:p-12">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5" />

          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 150, damping: 12 }}
            className="relative mb-8"
          >
            <h1 className="text-[8rem] font-black leading-none tracking-tighter sm:text-[10rem]">
              <span className="gradient-text">404</span>
            </h1>
            <motion.div
              className="absolute -right-2 -top-4 sm:-right-4"
              animate={{ rotate: [0, 10, -10, 0], y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Sparkles className="h-8 w-8 text-purple-400" aria-hidden="true" />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <h2 className="mb-3 text-2xl font-bold text-white sm:text-3xl">
              <GlitchText>Lost in the void?</GlitchText>
            </h2>
            <p className="mx-auto max-w-md text-base text-slate-400 sm:text-lg">
              The page you&apos;re looking for doesn&apos;t exist or has been moved to another
              dimension.
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onSubmit={handleSearch}
            className="mb-8"
          >
            <div
              className={`neo-inset relative flex items-center gap-3 px-4 py-3 transition-all duration-300 ${searchFocused ? 'ring-2 ring-purple-500/50' : ''}`}
            >
              <Search className="h-5 w-5 shrink-0 text-slate-500" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search for products..."
                className="w-full bg-transparent text-base text-white placeholder-slate-500 outline-none"
                aria-label="Search products"
              />
              <AnimatePresence>
                {query && (
                  <motion.button
                    type="submit"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="neo-raised-sm shrink-0 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1.5 text-sm font-medium text-white"
                  >
                    Go
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.form>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4"
          >
            <Link href="/" className="group">
              <motion.div
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ y: 1, scale: 0.98 }}
                className="neo-raised-sm hover:neo-glow inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 text-base font-medium text-white transition-shadow duration-300"
              >
                <Home className="h-5 w-5" aria-hidden="true" />
                Back to Home
              </motion.div>
            </Link>
            <Link href="/shop" className="group">
              <motion.div
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ y: 1, scale: 0.98 }}
                className="neo-raised-sm inline-flex items-center justify-center gap-2 rounded-lg bg-surface-elevated px-6 py-3 text-base font-medium text-white transition-colors duration-200 hover:bg-surface-overlay"
              >
                <ShoppingBag className="h-5 w-5" aria-hidden="true" />
                Browse Shop
              </motion.div>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 border-t border-white/5 pt-6"
          >
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-300"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Or go back to previous page
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
