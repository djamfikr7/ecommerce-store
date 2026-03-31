'use client'

import { motion } from 'framer-motion'
import Button3D from '../ui/Button3D'

interface GameControlsProps {
  onNewGame: () => void
  onUndo: () => void
  onHint: () => void
  onFlipBoard: () => void
  onSettingsClick: () => void
  isThinking?: boolean
}

export default function GameControls({
  onNewGame,
  onUndo,
  onHint,
  onFlipBoard,
  onSettingsClick,
  isThinking = false,
}: GameControlsProps) {
  return (
    <motion.div
      className="bg-dark-gradient shadow-neomorphic flex items-center justify-center gap-3 rounded-2xl p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Button3D onClick={onNewGame} variant="primary">
        New
      </Button3D>

      <Button3D onClick={onUndo} variant="secondary" disabled={isThinking}>
        Undo
      </Button3D>

      <Button3D onClick={onHint} variant="secondary" disabled={isThinking}>
        Hint
      </Button3D>

      <motion.button
        onClick={onFlipBoard}
        className="shadow-neomorphic rounded-xl bg-gray-800 p-3 transition-all hover:shadow-[6px_6px_12px_#0a0a0f,-6px_-6px_12px_#1a1a2e]"
        whileHover={{ scale: 1.05, rotate: 180 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg
          className="h-5 w-5 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </motion.button>

      <motion.button
        onClick={onSettingsClick}
        className="shadow-neomorphic rounded-xl bg-gray-800 p-3 transition-all hover:shadow-[6px_6px_12px_#0a0a0f,-6px_-6px_12px_#1a1a2e]"
        whileHover={{ scale: 1.05, rotate: 90 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg
          className="h-5 w-5 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </motion.button>
    </motion.div>
  )
}
