'use client'

import { motion, AnimatePresence } from 'framer-motion'

export interface Move {
  san: string
  fen?: string
}

interface MoveHistoryProps {
  moves: Move[]
  currentMoveIndex?: number
  onMoveClick?: (index: number) => void
}

export default function MoveHistory({ moves, currentMoveIndex, onMoveClick }: MoveHistoryProps) {
  if (moves.length === 0) {
    return (
      <motion.div
        className="flex h-32 items-center justify-center text-sm text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        No moves yet
      </motion.div>
    )
  }

  const renderMoves = () => {
    const rows = []
    for (let i = 0; i < moves.length; i += 2) {
      const moveNumber = Math.floor(i / 2) + 1
      const whiteMove = moves[i]
      const blackMove = moves[i + 1]

      rows.push(
        <motion.div
          key={i}
          className="group grid grid-cols-3 gap-2 rounded px-2 py-1 transition-colors hover:bg-gray-800/30"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.2,
            delay: Math.min(i * 0.02, 0.3),
            ease: 'easeOut',
          }}
        >
          <span className="text-xs text-gray-500">{moveNumber}.</span>
          <motion.button
            onClick={() => onMoveClick?.(i)}
            className={`text-left font-mono text-sm transition-all ${
              currentMoveIndex === i
                ? 'shadow-glow rounded bg-blue-600/30 px-1 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {whiteMove?.san}
          </motion.button>
          <motion.button
            onClick={() => onMoveClick?.(i + 1)}
            className={`text-left font-mono text-sm transition-all ${
              currentMoveIndex === i + 1
                ? 'shadow-glow rounded bg-blue-600/30 px-1 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {blackMove?.san || ''}
          </motion.button>
        </motion.div>,
      )
    }
    return rows
  }

  return (
    <motion.div
      className="scrollbar-thin max-h-64 overflow-y-auto pr-1"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatePresence mode="popLayout">{renderMoves()}</AnimatePresence>
    </motion.div>
  )
}
