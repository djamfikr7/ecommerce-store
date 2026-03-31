'use client'

import { motion } from 'framer-motion'

interface EvaluationGraphProps {
  evaluation: number
}

export default function EvaluationGraph({ evaluation }: EvaluationGraphProps) {
  const clampedEval = Math.max(-10, Math.min(10, evaluation))
  const percentage = ((clampedEval + 10) / 20) * 100

  const getEvalText = () => {
    if (clampedEval >= 5) return 'Winning'
    if (clampedEval <= -5) return 'Losing'
    if (clampedEval > 0) return `+${clampedEval.toFixed(1)}`
    if (clampedEval < 0) return clampedEval.toFixed(1)
    return '0.0'
  }

  const isWinning = clampedEval > 0

  return (
    <div className="relative flex flex-col items-center gap-2">
      <motion.div
        className="shadow-neomorphic-inset relative h-64 w-8 overflow-hidden rounded-lg border border-gray-800/50 bg-gray-900"
        animate={{
          boxShadow:
            clampedEval > 3 || clampedEval < -3 ? '0 0 20px rgba(59, 130, 246, 0.3)' : 'none',
        }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="absolute bottom-0 left-0 right-0 origin-bottom"
          style={{
            height: `${percentage}%`,
          }}
          animate={{
            height: `${percentage}%`,
            background: isWinning
              ? 'linear-gradient(to top, #10b981, #34d399, #6ee7b7)'
              : 'linear-gradient(to top, #6b7280, #9ca3af, #d1d5db)',
          }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className="text-xs font-bold"
            style={{
              color: isWinning ? '#10b981' : '#9ca3af',
              transform: 'rotate(-90deg)',
              whiteSpace: 'nowrap',
            }}
            animate={{ opacity: 1 }}
          >
            {getEvalText()}
          </motion.span>
        </div>
      </motion.div>
      <div className="flex flex-col gap-1 text-xs">
        <span className="text-gray-500">White</span>
        <div className="shadow-neomorphic h-6 w-6 rounded border border-gray-300 bg-gray-200" />
        <span className="text-gray-500">Black</span>
        <div className="shadow-neomorphic h-6 w-6 rounded border border-gray-600 bg-gray-800" />
      </div>
    </div>
  )
}
