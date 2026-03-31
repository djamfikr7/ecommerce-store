'use client'

import { motion } from 'framer-motion'

export function SuccessAnimation() {
  const circleVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  }

  const checkVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: { duration: 0.6, delay: 0.4, ease: 'easeOut' },
    },
  }

  const glowVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: [0, 0.6, 0.3],
      scale: [0.8, 1.2, 1.1],
      transition: { duration: 1.2, delay: 0.3, ease: 'easeOut' },
    },
  }

  const particleVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: (i: number) => ({
      opacity: [0, 1, 0],
      scale: [0, 1, 0.5],
      y: [0, -30 - i * 10, -50 - i * 15],
      x: [0, (i % 2 === 0 ? 1 : -1) * (10 + i * 8)],
      transition: {
        duration: 1.5,
        delay: 0.6 + i * 0.1,
        ease: 'easeOut',
      },
    }),
  }

  return (
    <div className="relative mx-auto flex h-32 w-32 items-center justify-center">
      {/* Outer glow ring */}
      <motion.div
        variants={glowVariants}
        initial="hidden"
        animate="visible"
        className="absolute inset-0 rounded-full bg-green-500/20 blur-xl"
      />

      {/* Particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          custom={i}
          variants={particleVariants}
          initial="hidden"
          animate="visible"
          className="absolute h-2 w-2 rounded-full bg-green-400"
          style={{
            top: '50%',
            left: '50%',
          }}
        />
      ))}

      {/* Main circle */}
      <motion.div
        variants={circleVariants}
        initial="hidden"
        animate="visible"
        className="relative flex h-28 w-28 items-center justify-center rounded-full"
        style={{
          background: 'linear-gradient(145deg, #1a2e1a, #0f1f0f)',
          boxShadow: `
            8px 8px 16px rgba(0, 0, 0, 0.5),
            -8px -8px 16px rgba(50, 100, 50, 0.08),
            inset 2px 2px 4px rgba(50, 100, 50, 0.1),
            inset -2px -2px 4px rgba(0, 0, 0, 0.3)
          `,
        }}
      >
        {/* Inner ring */}
        <div
          className="absolute inset-2 rounded-full"
          style={{
            background: 'linear-gradient(145deg, #0f1f0f, #1a2e1a)',
            boxShadow:
              'inset 3px 3px 6px rgba(0,0,0,0.4), inset -3px -3px 6px rgba(50,100,50,0.06)',
          }}
        />

        {/* SVG checkmark */}
        <svg
          viewBox="0 0 52 52"
          className="relative z-10 h-16 w-16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Checkmark path */}
          <motion.path
            variants={checkVariants}
            initial="hidden"
            animate="visible"
            d="M14 27 L22 35 L38 18"
            stroke="url(#checkGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <defs>
            <linearGradient id="checkGradient" x1="14" y1="27" x2="38" y2="18">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>
    </div>
  )
}
