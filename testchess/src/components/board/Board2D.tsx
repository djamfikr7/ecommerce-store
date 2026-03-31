'use client'

import { useMemo } from 'react'
import { useChessStore } from '../../lib/chess/store'

interface Board2DProps {
  isFlipped?: boolean
}

export function Board2D({ isFlipped = false }: Board2DProps) {
  const board = useChessStore((state) => state.board)
  const selectedSquare = useChessStore((state) => state.selectedSquare)
  const legalMoves = useChessStore((state) => state.legalMoves)
  const moveHistory = useChessStore((state) => state.moveHistory)
  const selectSquare = useChessStore((state) => state.selectSquare)

  const lastMove = moveHistory[moveHistory.length - 1]

  const pieceSymbols: Record<string, string> = {
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

  const squares = useMemo(() => {
    const result = []
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const displayRow = isFlipped ? row : 7 - row
        const displayCol = isFlipped ? 7 - col : col
        const piece = board[displayRow]?.[displayCol]
        const isLight = (row + col) % 2 === 0
        const isSelected = selectedSquare?.row === displayRow && selectedSquare?.col === displayCol
        const isLegalMove = legalMoves.some(
          (m) => m.to.row === displayRow && m.to.col === displayCol,
        )
        const isLastMove =
          lastMove &&
          ((lastMove.from.row === displayRow && lastMove.from.col === displayCol) ||
            (lastMove.to.row === displayRow && lastMove.to.col === displayCol))

        result.push({
          row: displayRow,
          col: displayCol,
          piece,
          isLight,
          isSelected,
          isLegalMove,
          isLastMove,
        })
      }
    }
    return result
  }, [board, isFlipped, selectedSquare, legalMoves, lastMove])

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[600px]">
      <div className="grid grid-cols-8 gap-0 overflow-hidden rounded-xl border-4 border-gray-700 shadow-2xl">
        {squares.map(({ row, col, piece, isLight, isSelected, isLegalMove, isLastMove }) => (
          <button
            key={`${row}-${col}`}
            onClick={() => selectSquare({ row, col })}
            className={`relative flex aspect-square items-center justify-center text-4xl transition-all duration-200 sm:text-5xl md:text-6xl ${isLight ? 'bg-amber-100' : 'bg-amber-800'} ${isSelected ? 'scale-95 ring-4 ring-inset ring-blue-500' : ''} ${isLastMove ? 'bg-yellow-400/50' : ''} ${isLegalMove ? 'cursor-pointer' : ''} hover:brightness-110`}
          >
            {piece && (
              <span
                className={` ${piece === piece.toUpperCase() ? 'text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]' : 'text-gray-900 drop-shadow-[0_1px_1px_rgba(255,255,255,0.3)]'} ${isSelected ? 'scale-110' : ''} transition-transform duration-200`}
              >
                {pieceSymbols[piece] || piece}
              </span>
            )}
            {isLegalMove && !piece && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-green-500/60" />
              </div>
            )}
            {isLegalMove && piece && (
              <div className="absolute inset-0 rounded-full border-4 border-green-500/60" />
            )}
          </button>
        ))}
      </div>

      {/* Coordinates */}
      <div className="absolute -left-6 top-0 flex h-full flex-col justify-around text-xs text-gray-400">
        {[8, 7, 6, 5, 4, 3, 2, 1].map((n) => (
          <div key={n}>{isFlipped ? 9 - n : n}</div>
        ))}
      </div>
      <div className="absolute -bottom-6 left-0 flex w-full justify-around text-xs text-gray-400">
        {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((l, i) => (
          <div key={l}>{isFlipped ? String.fromCharCode(104 - i) : l}</div>
        ))}
      </div>
    </div>
  )
}
