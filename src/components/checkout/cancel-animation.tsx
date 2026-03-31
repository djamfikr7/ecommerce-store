'use client'

import { motion } from 'framer-motion'

export function CancelAnimation() {
  const circleVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  }

  const faceVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.4, delay: 0.3 },
    },
  }

  const eyeBlink = {
    hidden: { scaleY: 1 },
    visible: {
      scaleY: [1, 0.1, 1],
      transition: {
        duration: 0.15,
        delay: 1.2,
        repeat: Infinity,
        repeatDelay: 3,
      },
    },
  }

  const mouthVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: { duration: 0.5, delay: 0.5, ease: 'easeOut' },
    },
  }

  const shakeVariants = {
    hidden: { rotate: 0 },
    visible: {
      rotate: [0, -3, 3, -3, 2, 0],
      transition: {
        duration: 0.6,
        delay: 0.8,
        ease: 'easeInOut',
      },
    },
  }

  const glowVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: [0, 0.4, 0.2],
      scale: [0.8, 1.15, 1.05],
      transition: { duration: 1.2, delay: 0.3, ease: 'easeOut' },
    },
  }

  return (
    <div className="relative mx-auto flex h-32 w-32 items-center justify-center">
      {/* Outer glow */}
      <motion.div
        variants={glowVariants}
        initial="hidden"
        animate="visible"
        className="absolute inset-0 rounded-full bg-orange-500/15 blur-xl"
      />

      {/* Main circle with shake */}
      <motion.div variants={shakeVariants} initial="hidden" animate="visible" className="relative">
        <motion.div
          variants={circleVariants}
          initial="hidden"
          animate="visible"
          className="relative flex h-28 w-28 items-center justify-center rounded-full"
          style={{
            background: 'linear-gradient(145deg, #2e1a1a, #1f0f0f)',
            boxShadow: `
              8px 8px 16px rgba(0, 0, 0, 0.5),
              -8px -8px 16px rgba(100, 50, 50, 0.08),
              inset 2px 2px 4px rgba(100, 50, 50, 0.1),
              inset -2px -2px 4px rgba(0, 0, 0, 0.3)
            `,
          }}
        >
          {/* Inner ring */}
          <div
            className="absolute inset-2 rounded-full"
            style={{
              background: 'linear-gradient(145deg, #1f0f0f, #2e1a1a)',
              boxShadow:
                'inset 3px 3px 6px rgba(0,0,0,0.4), inset -3px -3px 6px rgba(100,50,50,0.06)',
            }}
          />

          {/* Sad face SVG */}
          <motion.div
            variants={faceVariants}
            initial="hidden"
            animate="visible"
            className="relative z-10"
          >
            <svg
              viewBox="0 0 52 52"
              className="h-16 w-16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Left eye */}
              <motion.g variants={eyeBlink} initial="hidden" animate="visible">
                <circle cx="19" cy="20" r="3" fill="#f97316" />
              </motion.g>

              {/* Right eye */}
              <motion.g variants={eyeBlink} initial="hidden" animate="visible">
                <circle cx="33" cy="20" r="3" fill="#f97316" />
              </motion.g>

              {/* Sad mouth - arc curving downward */}
              <motion.path
                variants={mouthVariants}
                initial="hidden"
                animate="visible"
                d="M17 36 Q25 30 35 36"
                stroke="#f97316"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
