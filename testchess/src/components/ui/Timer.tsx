'use client'

import { motion, useAnimation } from 'framer-motion'
import { useEffect, useState } from 'react'

interface TimerProps {
  timeSeconds: number
  increment?: number
  isRunning: boolean
  onTimeUp?: () => void
}

export default function Timer({ timeSeconds, increment = 0, isRunning, onTimeUp }: TimerProps) {
  const [time, setTime] = useState(timeSeconds)
  const controls = useAnimation()

  useEffect(() => {
    setTime(timeSeconds)
  }, [timeSeconds])

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setTime((prev) => {
        if (prev <= 1) {
          onTimeUp?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, onTimeUp])

  useEffect(() => {
    if (time <= 10 && time > 0) {
      controls.start({
        scale: [1, 1.05, 1],
        transition: { duration: 0.5 },
      })
    }
  }, [time, controls])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const isLowTime = time <= 10

  return (
    <motion.div
      animate={controls}
      className={`shadow-neomorphic-inset rounded-xl border border-gray-700/50 bg-gray-900/80 px-4 py-2 font-mono text-2xl ${isLowTime ? 'text-red-400' : 'text-white'} `}
    >
      {formatTime(time)}
      {increment > 0 && <span className="ml-1 text-xs text-gray-500">+{increment}</span>}
    </motion.div>
  )
}
