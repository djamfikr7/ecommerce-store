'use client'

import { type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

type TransitionType = 'fade' | 'slide-up' | 'slide-right' | 'scale' | 'blur'

interface PageTransitionProps {
  children: ReactNode
  className?: string
  type?: TransitionType
  duration?: number
  delay?: number
}

const transitions: Record<
  TransitionType,
  {
    initial: Record<string, number>
    animate: Record<string, number>
    exit: Record<string, number>
  }
> = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  'slide-up': {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  'slide-right': {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.96 },
  },
  blur: {
    initial: { opacity: 0, filter: 8 },
    animate: { opacity: 1, filter: 0 },
    exit: { opacity: 0, filter: 8 },
  },
}

export function PageTransition({
  children,
  className,
  type = 'slide-up',
  duration = 0.3,
  delay = 0,
}: PageTransitionProps) {
  const t = transitions[type]
  return (
    <motion.div
      initial={t.initial}
      animate={t.animate}
      exit={t.exit}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
      {...(type === 'blur' ? { style: { filter: `blur(${t.initial.filter}px)` } } : {})}
    >
      {children}
    </motion.div>
  )
}

interface PageTransitionWrapperProps {
  children: ReactNode
  className?: string
  type?: TransitionType
  duration?: number
}

export function PageTransitionWrapper({
  children,
  className,
  type = 'fade',
  duration = 0.25,
}: PageTransitionWrapperProps) {
  const pathname = usePathname()
  const t = transitions[type]

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={t.initial}
        animate={t.animate}
        exit={t.exit}
        transition={{ duration, ease: 'easeOut' }}
        className={cn('w-full', className)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

interface StaggerContainerProps {
  children: ReactNode
  className?: string
  staggerDelay?: number
  delay?: number
}

export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.06,
  delay = 0,
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: delay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.35, ease: 'easeOut' },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
