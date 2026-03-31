'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useChessStore } from '../../lib/chess/store'

const PIECE_UNICODE: Record<string, string> = {
  K: '♔',
  Q: '♕',
  R: '♖',
  B: '♗',
  N: '♘',
  P: '♙',
  k: '♚',
  q: '♛',
  r: '♜',
  b: '♝',
  n: '♞',
  p: '♟',
}

interface Board3DProps {
  isFlipped?: boolean
}

export function Board3D({ isFlipped = false }: Board3DProps) {
  const board = useChessStore((state) => state.board)
  const selectedSquare = useChessStore((state) => state.selectedSquare)
  const legalMoves = useChessStore((state) => state.legalMoves)
  const moveHistory = useChessStore((state) => state.moveHistory)
  const selectSquare = useChessStore((state) => state.selectSquare)

  const lastMove = moveHistory[moveHistory.length - 1]

  const cells = useMemo(() => {
    const result = []
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const displayRow = isFlipped ? row : 7 - row
        const displayCol = isFlipped ? 7 - col : col
        const piece = board[displayRow]?.[displayCol]
        const isLight = (row + col) % 2 === 0
        const isSelected = selectedSquare?.row === displayRow && selectedSquare?.col === displayCol
        const isLegalTarget = legalMoves.some(
          (m) => m.to.row === displayRow && m.to.col === displayCol,
        )
        const isLastMove =
          lastMove &&
          ((lastMove.from.row === displayRow && lastMove.from.col === displayCol) ||
            (lastMove.to.row === displayRow && lastMove.to.col === displayCol))
        result.push({
          displayRow,
          displayCol,
          piece,
          isLight,
          isSelected,
          isLegalTarget,
          isLastMove,
        })
      }
    }
    return result
  }, [board, isFlipped, selectedSquare, legalMoves, lastMove])

  return (
    <div className="perspective-[1200px] flex w-full items-center justify-center">
      <div
        className="relative w-full max-w-[520px] transition-transform duration-700"
        style={{
          transform: 'rotateX(35deg) rotateZ(-5deg)',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Board shadow */}
        <div
          className="absolute inset-3 rounded-xl bg-black/60 blur-2xl"
          style={{ transform: 'translateZ(-20px)' }}
        />

        {/* Board surface */}
        <div
          className="relative overflow-hidden rounded-xl border-2 border-gray-600/50"
          style={{
            transformStyle: 'preserve-3d',
            boxShadow: '0 25px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          <div className="grid grid-cols-8 gap-0">
            {cells.map(
              ({
                displayRow,
                displayCol,
                piece,
                isLight,
                isSelected,
                isLegalTarget,
                isLastMove,
              }) => (
                <motion.button
                  key={`${displayRow}-${displayCol}`}
                  onClick={() => selectSquare({ row: displayRow, col: displayCol })}
                  className="relative flex aspect-square items-center justify-center transition-all duration-150"
                  style={{
                    background: isSelected
                      ? 'linear-gradient(135deg, #3b82f6, #6366f1)'
                      : isLastMove
                        ? isLight
                          ? '#c8a84e'
                          : '#b08930'
                        : isLight
                          ? 'linear-gradient(135deg, #e8d5b0, #d4be8e)'
                          : 'linear-gradient(135deg, #6b4226, #543318)',
                    transformStyle: 'preserve-3d',
                    boxShadow: isSelected
                      ? 'inset 0 0 15px rgba(59,130,246,0.6), 0 0 10px rgba(59,130,246,0.3)'
                      : 'inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.15)',
                  }}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Legal move indicator */}
                  {isLegalTarget && !piece && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center">
                      <div className="h-3 w-3 rounded-full bg-emerald-400/70 shadow-lg shadow-emerald-400/50" />
                    </div>
                  )}
                  {isLegalTarget && piece && (
                    <div className="absolute inset-1 z-10 rounded-full border-[3px] border-emerald-400/70" />
                  )}

                  {/* Piece */}
                  {piece && (
                    <span
                      className="relative z-20 select-none text-3xl sm:text-4xl"
                      style={{
                        filter:
                          piece === piece.toUpperCase()
                            ? 'drop-shadow(0 3px 4px rgba(0,0,0,0.7))'
                            : 'drop-shadow(0 2px 2px rgba(0,0,0,0.4))',
                        transform: 'translateZ(8px) scale(1.1)',
                        textShadow:
                          piece === piece.toUpperCase()
                            ? '0 1px 3px rgba(0,0,0,0.8)'
                            : '0 1px 2px rgba(255,255,255,0.3)',
                      }}
                    >
                      {PIECE_UNICODE[piece] || piece}
                    </span>
                  )}
                </motion.button>
              ),
            )}
          </div>
        </div>

        {/* Board edge glow */}
        <div
          className="pointer-events-none absolute -inset-1 rounded-xl bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10"
          style={{ transform: 'translateZ(-5px)' }}
        />
      </div>
    </div>
  )
}
