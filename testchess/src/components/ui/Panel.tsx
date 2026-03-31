'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface PanelProps {
  title?: string
  children: ReactNode
  className?: string
  delay?: number
}

export default function Panel({ title, children, className = '', delay = 0 }: PanelProps) {
  return (
    <motion.div
      className={`bg-dark-gradient shadow-neomorphic relative rounded-2xl border border-gray-800/50 p-4 before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-white/5 before:to-transparent ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      whileHover={{
        boxShadow: '8px 8px 16px #0a0a0f, -8px -8px 16px #1a1a2e',
        borderColor: 'rgba(59, 130, 246, 0.3)',
      }}
    >
      {title && (
        <motion.h3
          className="mb-3 border-b border-gray-700/50 pb-2 text-sm font-bold uppercase tracking-wider text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.1 }}
        >
          {title}
        </motion.h3>
      )}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.15 }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}
