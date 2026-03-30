import { create } from 'zustand'
import { game, ChessEngine, Position } from './engine'
import type { PlayerColor, GameState } from './types'

interface ChessStore extends GameState {
  selectSquare: (pos: Position) => void
  makeMove: (from: Position, to: Position, promotion?: string) => boolean
  undoMove: () => void
  resetGame: () => void
  loadFEN: (fen: string) => boolean
  getEngine: () => ChessEngine
}

const INITIAL_BOARD: (string | null)[][] = [
  ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
  ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
  ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
]

export const useChessStore = create<ChessStore>((set, get) => ({
  board: INITIAL_BOARD,
  currentTurn: 'white' as PlayerColor,
  selectedSquare: null,
  legalMoves: [],
  moveHistory: [],
  gameOver: false,
  result: null,
  castlingRights: {
    whiteKingSide: true,
    whiteQueenSide: true,
    blackKingSide: true,
    blackQueenSide: true,
  },
  enPassantSquare: null,
  halfMoveClock: 0,
  fullMoveNumber: 1,
  isCheck: false,
  isCheckmate: false,
  isStalemate: false,

  getEngine: () => game,

  selectSquare: (pos: Position) => {
    const state = get()
    if (state.gameOver) return

    const { selectedSquare, board, currentTurn } = state

    if (selectedSquare) {
      const from = selectedSquare
      const to = pos

      const moves = game.getLegalMoves(from)
      const validMove = moves.find((m) => m.to.row === to.row && m.to.col === to.col)

      if (validMove) {
        const promotion = validMove.promotion ? 'q' : undefined
        get().makeMove(from, to, promotion)
        return
      }
    }

    const pieceRow = board[pos.row]
    const piece = pieceRow ? pieceRow[pos.col] : null
    if (piece) {
      const pieceColor = piece === piece.toUpperCase() ? 'white' : 'black'
      if (pieceColor === currentTurn) {
        const legalMoves = game.getLegalMoves(pos)
        set({
          selectedSquare: pos,
          legalMoves: legalMoves.map((m) => ({
            from: m.from,
            to: m.to,
            notation: '',
            capture: m.capture,
            promotion: m.promotion,
            enPassant: m.enPassant,
            castling: m.castling,
          })),
        })
        return
      }
    }

    set({
      selectedSquare: null,
      legalMoves: [],
    })
  },

  makeMove: (from: Position, to: Position, promotion?: string): boolean => {
    const result = game.makeMove(from, to, promotion)

    if (result) {
      const engine = get().getEngine()

      set({
        board: engine.getBoard(),
        currentTurn: engine.getCurrentTurn(),
        selectedSquare: null,
        legalMoves: [],
        moveHistory: [
          ...get().moveHistory,
          {
            from: result.from,
            to: result.to,
            notation: '',
            capture: result.capture,
            promotion: result.promotion,
            enPassant: result.enPassant,
            castling: result.castling,
          },
        ],
        gameOver: engine.isGameOver(),
        result: engine.getResult(),
        isCheck: engine.isCheck(),
        isCheckmate: engine.isCheckmate(),
        isStalemate: engine.isStalemate(),
        castlingRights: engine.getCastlingRights(),
        enPassantSquare: engine.getEnPassantSquare(),
      })

      return true
    }

    return false
  },

  undoMove: () => {
    const result = game.undoMove()

    if (result) {
      const engine = get().getEngine()

      set({
        board: engine.getBoard(),
        currentTurn: engine.getCurrentTurn(),
        selectedSquare: null,
        legalMoves: [],
        moveHistory: get().moveHistory.slice(0, -1),
        gameOver: engine.isGameOver(),
        result: engine.getResult(),
        isCheck: engine.isCheck(),
        isCheckmate: engine.isCheckmate(),
        isStalemate: engine.isStalemate(),
        castlingRights: engine.getCastlingRights(),
        enPassantSquare: engine.getEnPassantSquare(),
      })
    }
  },

  resetGame: () => {
    game.reset()

    set({
      board: INITIAL_BOARD.map((row) => [...row]),
      currentTurn: 'white' as PlayerColor,
      selectedSquare: null,
      legalMoves: [],
      moveHistory: [],
      gameOver: false,
      result: null,
      isCheck: false,
      isCheckmate: false,
      isStalemate: false,
      castlingRights: {
        whiteKingSide: true,
        whiteQueenSide: true,
        blackKingSide: true,
        blackQueenSide: true,
      },
      enPassantSquare: null,
      halfMoveClock: 0,
      fullMoveNumber: 1,
    })
  },

  loadFEN: (fen: string): boolean => {
    const success = game.loadFEN(fen)

    if (success) {
      const engine = get().getEngine()

      set({
        board: engine.getBoard(),
        currentTurn: engine.getCurrentTurn(),
        selectedSquare: null,
        legalMoves: [],
        moveHistory: [],
        gameOver: engine.isGameOver(),
        result: engine.getResult(),
        isCheck: engine.isCheck(),
        isCheckmate: engine.isCheckmate(),
        isStalemate: engine.isStalemate(),
        castlingRights: engine.getCastlingRights(),
        enPassantSquare: engine.getEnPassantSquare(),
      })
    }

    return success
  },
}))

export type { ChessStore }
