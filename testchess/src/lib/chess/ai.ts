import type { Position, Move, PlayerColor } from './types'

const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
}

const PAWN_TABLE = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5, 5, 10, 25, 25, 10, 5, 5],
  [0, 0, 0, 20, 20, 0, 0, 0],
  [5, -5, -10, 0, 0, -10, -5, 5],
  [5, 10, 10, -20, -20, 10, 10, 5],
  [0, 0, 0, 0, 0, 0, 0, 0],
]

const KNIGHT_TABLE = [
  [-50, -40, -30, -30, -30, -30, -40, -50],
  [-40, -20, 0, 0, 0, 0, -20, -40],
  [-30, 0, 10, 15, 15, 10, 0, -30],
  [-30, 5, 15, 20, 20, 15, 5, -30],
  [-30, 0, 15, 20, 20, 15, 0, -30],
  [-30, 5, 10, 15, 15, 10, 5, -30],
  [-40, -20, 0, 5, 5, 0, -20, -40],
  [-50, -40, -30, -30, -30, -30, -40, -50],
]

const BISHOP_TABLE = [
  [-20, -10, -10, -10, -10, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 5, 10, 10, 5, 0, -10],
  [-10, 5, 5, 10, 10, 5, 5, -10],
  [-10, 0, 10, 10, 10, 10, 0, -10],
  [-10, 10, 10, 10, 10, 10, 10, -10],
  [-10, 5, 0, 0, 0, 0, 5, -10],
  [-20, -10, -10, -10, -10, -10, -10, -20],
]

const ROOK_TABLE = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [5, 10, 10, 10, 10, 10, 10, 5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [0, 0, 0, 5, 5, 0, 0, 0],
]

const QUEEN_TABLE = [
  [-20, -10, -10, -5, -5, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 5, 5, 5, 5, 0, -10],
  [-5, 0, 5, 5, 5, 5, 0, -5],
  [-5, 0, 5, 5, 5, 5, 0, -5],
  [-10, 0, 5, 5, 5, 5, 0, -10],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-20, -10, -10, -5, -5, -10, -10, -20],
]

const KING_TABLE = [
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-20, -30, -30, -40, -40, -30, -30, -20],
  [-10, -20, -20, -20, -20, -20, -20, -10],
  [20, 20, 0, 0, 0, 0, 20, 20],
  [20, 30, 10, 0, 0, 10, 30, 20],
]

type BoardPiece = string | null

export class ChessAI {
  private depth: number
  private nodesEvaluated: number
  private transpositionTable: Map<string, { score: number; depth: number }>
  private killerMoves: Move[]
  private historyTable: Record<string, number>

  constructor(depth: number = 3) {
    this.depth = depth
    this.nodesEvaluated = 0
    this.transpositionTable = new Map()
    this.killerMoves = []
    this.historyTable = {}
  }

  setDepth(depth: number): void {
    this.depth = Math.max(1, Math.min(5, depth))
  }

  getDepth(): number {
    return this.depth
  }

  private getBoardHash(board: BoardPiece[][]): string {
    return JSON.stringify(board)
  }

  private isValidPosition(row: number, col: number): boolean {
    return row >= 0 && row < 8 && col >= 0 && col < 8
  }

  private getPieceAt(board: BoardPiece[][], row: number, col: number): BoardPiece {
    if (!this.isValidPosition(row, col)) return null
    const boardRow = board[row]
    if (!boardRow) return null
    return boardRow[col] ?? null
  }

  private getPieceColor(piece: BoardPiece): PlayerColor | null {
    if (!piece) return null
    return piece === piece.toUpperCase() ? 'white' : 'black'
  }

  private getOppositeColor(color: PlayerColor): PlayerColor {
    return color === 'white' ? 'black' : 'white'
  }

  private getPieceValue(piece: BoardPiece): number {
    if (!piece) return 0
    return PIECE_VALUES[piece.toLowerCase()] || 0
  }

  private findKing(board: BoardPiece[][], color: PlayerColor): Position | null {
    const kingChar = color === 'white' ? 'K' : 'k'
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (this.getPieceAt(board, row, col) === kingChar) {
          return { row, col }
        }
      }
    }
    return null
  }

  private isSquareAttacked(
    board: BoardPiece[][],
    row: number,
    col: number,
    byColor: PlayerColor,
  ): boolean {
    const pawnDir = byColor === 'white' ? 1 : -1
    const pawnChar = byColor === 'white' ? 'P' : 'p'
    for (const dc of [-1, 1]) {
      const pr = row + pawnDir
      const pc = col + dc
      if (this.getPieceAt(board, pr, pc) === pawnChar) {
        return true
      }
    }

    const knightChar = byColor === 'white' ? 'N' : 'n'
    const knightMoves = [
      [-2, -1],
      [-2, 1],
      [-1, -2],
      [-1, 2],
      [1, -2],
      [1, 2],
      [2, -1],
      [2, 1],
    ]
    for (const move of knightMoves) {
      const dr = move[0]
      const dc = move[1]
      if (dr === undefined || dc === undefined) continue
      const nr = row + dr
      const nc = col + dc
      if (this.getPieceAt(board, nr, nc) === knightChar) {
        return true
      }
    }

    const kingChar = byColor === 'white' ? 'K' : 'k'
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue
        const kr = row + dr
        const kc = col + dc
        if (this.getPieceAt(board, kr, kc) === kingChar) {
          return true
        }
      }
    }

    const rookChar = byColor === 'white' ? 'R' : 'r'
    const bishopChar = byColor === 'white' ? 'B' : 'b'
    const queenChar = byColor === 'white' ? 'Q' : 'q'

    const rookDirs: [number, number][] = [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ]
    for (const dir of rookDirs) {
      const dr = dir[0]
      const dc = dir[1]
      if (dr === undefined || dc === undefined) continue
      let r = row + dr
      let c = col + dc
      while (this.isValidPosition(r, c)) {
        const piece = this.getPieceAt(board, r, c)
        if (piece) {
          if (piece === rookChar || piece === queenChar) {
            return true
          }
          break
        }
        r += dr
        c += dc
      }
    }

    const bishopDirs: [number, number][] = [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ]
    for (const dir of bishopDirs) {
      const dr = dir[0]
      const dc = dir[1]
      if (dr === undefined || dc === undefined) continue
      let r = row + dr
      let c = col + dc
      while (this.isValidPosition(r, c)) {
        const piece = this.getPieceAt(board, r, c)
        if (piece) {
          if (piece === bishopChar || piece === queenChar) {
            return true
          }
          break
        }
        r += dr
        c += dc
      }
    }

    return false
  }

  private isInCheck(board: BoardPiece[][], color: PlayerColor): boolean {
    const kingPos = this.findKing(board, color)
    if (!kingPos) return false
    return this.isSquareAttacked(board, kingPos.row, kingPos.col, this.getOppositeColor(color))
  }

  private cloneBoard(board: BoardPiece[][]): BoardPiece[][] {
    return board.map((row) => [...row])
  }

  private makeMove(board: BoardPiece[][], move: Move): BoardPiece[][] {
    const newBoard = this.cloneBoard(board)
    const piece = this.getPieceAt(board, move.from.row, move.from.col)

    const row = move.from.row
    const toRow = move.to.row
    const toCol = move.to.col

    newBoard[toRow] = newBoard[toRow] || []
    newBoard[toRow][toCol] = move.promotion ? (move.promotion as BoardPiece) : piece
    newBoard[row] = newBoard[row] || []
    newBoard[row][move.from.col] = null

    if (move.enPassant) {
      newBoard[row] = newBoard[row] || []
      newBoard[row][toCol] = null
    }

    if (move.castling) {
      const castleRow = move.from.row
      const castleBoardRow = (newBoard[castleRow] = newBoard[castleRow] || Array(8).fill(null))
      if (move.castling === 'kingside') {
        castleBoardRow[5] = castleBoardRow[7] ?? null
        castleBoardRow[7] = null
      } else {
        castleBoardRow[3] = castleBoardRow[0] ?? null
        castleBoardRow[0] = null
      }
    }

    return newBoard
  }

  private getPositionValue(
    piece: BoardPiece,
    row: number,
    col: number,
    _isEndgame: boolean,
  ): number {
    if (!piece) return 0
    const color = this.getPieceColor(piece)
    const pieceType = piece.toLowerCase()

    let table
    switch (pieceType) {
      case 'p':
        table = PAWN_TABLE
        break
      case 'n':
        table = KNIGHT_TABLE
        break
      case 'b':
        table = BISHOP_TABLE
        break
      case 'r':
        table = ROOK_TABLE
        break
      case 'q':
        table = QUEEN_TABLE
        break
      case 'k':
        table = KING_TABLE
        break
      default:
        return 0
    }

    const r = color === 'white' ? row : 7 - row
    return table[r]?.[col] ?? 0
  }

  private evaluateBoard(board: BoardPiece[][]): number {
    let score = 0
    let whiteMaterial = 0
    let blackMaterial = 0

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.getPieceAt(board, row, col)
        if (!piece) continue

        const value = this.getPieceValue(piece)
        const color = this.getPieceColor(piece)

        if (color === 'white') {
          whiteMaterial += value
        } else {
          blackMaterial += value
        }

        const isEndgame = whiteMaterial + blackMaterial < 2600
        const posValue = this.getPositionValue(piece, row, col, isEndgame)

        if (color === 'white') {
          score += value + posValue
        } else {
          score -= value + posValue
        }
      }
    }

    return score
  }

  private orderMoves(moves: Move[], board: BoardPiece[][], color: PlayerColor): Move[] {
    const scored = moves.map((move) => {
      let score = 0

      if (move.capture) {
        const victimValue = this.getPieceValue(move.capture as BoardPiece)
        const attackerValue = this.getPieceValue(
          this.getPieceAt(board, move.from.row, move.from.col),
        )
        score += 10000 + victimValue - attackerValue / 10
      }

      if (move.promotion) {
        score += 9000 + this.getPieceValue(move.promotion as BoardPiece)
      }

      if (move.castling) {
        score += 500
      }

      if (this.killerMoves.includes(move)) {
        score += 1000
      }

      const key = `${move.from.row},${move.from.col}-${move.to.row},${move.to.col}`
      score += this.historyTable[key] || 0

      const newBoard = this.makeMove(board, move)
      if (this.isInCheck(newBoard, this.getOppositeColor(color))) {
        score += 500
      }

      return { move, score }
    })

    scored.sort((a, b) => b.score - a.score)
    return scored.map((s) => s.move)
  }

  private generatePseudoLegalMoves(
    board: BoardPiece[][],
    color: PlayerColor,
    castlingRights: {
      whiteKingSide: boolean
      whiteQueenSide: boolean
      blackKingSide: boolean
      blackQueenSide: boolean
    },
    enPassantSquare: Position | null,
  ): Move[] {
    const moves: Move[] = []

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.getPieceAt(board, row, col)
        if (!piece || this.getPieceColor(piece) !== color) continue

        const pieceType = piece.toLowerCase()
        const direction = color === 'white' ? -1 : 1
        const startRow = color === 'white' ? 6 : 1
        const promotionRow = color === 'white' ? 0 : 7

        if (pieceType === 'p') {
          const newRow = row + direction
          if (this.isValidPosition(newRow, col) && !this.getPieceAt(board, newRow, col)) {
            if (newRow === promotionRow) {
              for (const promo of ['q', 'r', 'b', 'n']) {
                moves.push({
                  from: { row, col },
                  to: { row: newRow, col },
                  promotion: color === 'white' ? promo.toUpperCase() : promo,
                })
              }
            } else {
              moves.push({
                from: { row, col },
                to: { row: newRow, col },
              })
            }

            if (row === startRow) {
              const doubleRow = row + 2 * direction
              if (!this.getPieceAt(board, doubleRow, col)) {
                moves.push({
                  from: { row, col },
                  to: { row: doubleRow, col },
                })
              }
            }
          }

          for (const dc of [-1, 1]) {
            const newCol = col + dc
            if (this.isValidPosition(newRow, newCol)) {
              const target = this.getPieceAt(board, newRow, newCol)
              if (target && this.getPieceColor(target) !== color) {
                if (newRow === promotionRow) {
                  for (const promo of ['q', 'r', 'b', 'n']) {
                    moves.push({
                      from: { row, col },
                      to: { row: newRow, col: newCol },
                      capture: target,
                      promotion: color === 'white' ? promo.toUpperCase() : promo,
                    })
                  }
                } else {
                  moves.push({
                    from: { row, col },
                    to: { row: newRow, col: newCol },
                    capture: target,
                  })
                }
              }

              if (
                enPassantSquare &&
                enPassantSquare.row === newRow &&
                enPassantSquare.col === newCol
              ) {
                moves.push({
                  from: { row, col },
                  to: { row: newRow, col: newCol },
                  enPassant: true,
                })
              }
            }
          }
        } else if (pieceType === 'n') {
          const offsets: [number, number][] = [
            [-2, -1],
            [-2, 1],
            [-1, -2],
            [-1, 2],
            [1, -2],
            [1, 2],
            [2, -1],
            [2, 1],
          ]
          for (const offset of offsets) {
            const dr = offset[0]
            const dc = offset[1]
            if (dr === undefined || dc === undefined) continue
            const nr = row + dr
            const nc = col + dc
            if (this.isValidPosition(nr, nc)) {
              const target = this.getPieceAt(board, nr, nc)
              if (!target || this.getPieceColor(target) !== color) {
                moves.push({
                  from: { row, col },
                  to: { row: nr, col: nc },
                  capture: target || undefined,
                })
              }
            }
          }
        } else if (pieceType === 'b' || pieceType === 'r' || pieceType === 'q') {
          const directions: [number, number][] =
            pieceType === 'b'
              ? [
                  [1, 1],
                  [1, -1],
                  [-1, 1],
                  [-1, -1],
                ]
              : pieceType === 'r'
                ? [
                    [0, 1],
                    [0, -1],
                    [1, 0],
                    [-1, 0],
                  ]
                : [
                    [0, 1],
                    [0, -1],
                    [1, 0],
                    [-1, 0],
                    [1, 1],
                    [1, -1],
                    [-1, 1],
                    [-1, -1],
                  ]

          for (const dir of directions) {
            const dr = dir[0]
            const dc = dir[1]
            if (dr === undefined || dc === undefined) continue
            let nr = row + dr
            let nc = col + dc
            while (this.isValidPosition(nr, nc)) {
              const target = this.getPieceAt(board, nr, nc)
              if (!target) {
                moves.push({ from: { row, col }, to: { row: nr, col: nc } })
              } else {
                if (this.getPieceColor(target) !== color) {
                  moves.push({
                    from: { row, col },
                    to: { row: nr, col: nc },
                    capture: target,
                  })
                }
                break
              }
              nr += dr
              nc += dc
            }
          }
        } else if (pieceType === 'k') {
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              if (dr === 0 && dc === 0) continue
              const nr = row + dr
              const nc = col + dc
              if (this.isValidPosition(nr, nc)) {
                const target = this.getPieceAt(board, nr, nc)
                if (!target || this.getPieceColor(target) !== color) {
                  moves.push({
                    from: { row, col },
                    to: { row: nr, col: nc },
                    capture: target || undefined,
                  })
                }
              }
            }
          }

          if (color === 'white' && row === 7 && col === 4) {
            if (
              castlingRights.whiteKingSide &&
              !this.getPieceAt(board, 7, 5) &&
              !this.getPieceAt(board, 7, 6) &&
              !this.isSquareAttacked(board, 7, 4, 'black') &&
              !this.isSquareAttacked(board, 7, 5, 'black') &&
              !this.isSquareAttacked(board, 7, 6, 'black')
            ) {
              moves.push({
                from: { row, col },
                to: { row: 7, col: 6 },
                castling: 'kingside',
              })
            }
            if (
              castlingRights.whiteQueenSide &&
              !this.getPieceAt(board, 7, 1) &&
              !this.getPieceAt(board, 7, 2) &&
              !this.getPieceAt(board, 7, 3) &&
              !this.isSquareAttacked(board, 7, 4, 'black') &&
              !this.isSquareAttacked(board, 7, 3, 'black') &&
              !this.isSquareAttacked(board, 7, 2, 'black')
            ) {
              moves.push({
                from: { row, col },
                to: { row: 7, col: 2 },
                castling: 'queenside',
              })
            }
          } else if (color === 'black' && row === 0 && col === 4) {
            if (
              castlingRights.blackKingSide &&
              !this.getPieceAt(board, 0, 5) &&
              !this.getPieceAt(board, 0, 6) &&
              !this.isSquareAttacked(board, 0, 4, 'white') &&
              !this.isSquareAttacked(board, 0, 5, 'white') &&
              !this.isSquareAttacked(board, 0, 6, 'white')
            ) {
              moves.push({
                from: { row, col },
                to: { row: 0, col: 6 },
                castling: 'kingside',
              })
            }
            if (
              castlingRights.blackQueenSide &&
              !this.getPieceAt(board, 0, 1) &&
              !this.getPieceAt(board, 0, 2) &&
              !this.getPieceAt(board, 0, 3) &&
              !this.isSquareAttacked(board, 0, 4, 'white') &&
              !this.isSquareAttacked(board, 0, 3, 'white') &&
              !this.isSquareAttacked(board, 0, 2, 'white')
            ) {
              moves.push({
                from: { row, col },
                to: { row: 0, col: 2 },
                castling: 'queenside',
              })
            }
          }
        }
      }
    }

    return moves
  }

  private generateLegalMoves(
    board: BoardPiece[][],
    color: PlayerColor,
    castlingRights: {
      whiteKingSide: boolean
      whiteQueenSide: boolean
      blackKingSide: boolean
      blackQueenSide: boolean
    },
    enPassantSquare: Position | null,
  ): Move[] {
    const pseudoMoves = this.generatePseudoLegalMoves(board, color, castlingRights, enPassantSquare)

    return pseudoMoves.filter((move) => {
      const newBoard = this.makeMove(board, move)
      return !this.isInCheck(newBoard, color)
    })
  }

  private minimax(
    board: BoardPiece[][],
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean,
    color: PlayerColor,
    castlingRights: {
      whiteKingSide: boolean
      whiteQueenSide: boolean
      blackKingSide: boolean
      blackQueenSide: boolean
    },
    enPassantSquare: Position | null,
  ): number {
    this.nodesEvaluated++

    const hash = this.getBoardHash(board)
    const cached = this.transpositionTable.get(hash)
    if (cached && cached.depth >= depth) {
      return cached.score
    }

    if (depth === 0) {
      return this.evaluateBoard(board)
    }

    const moves = this.generateLegalMoves(board, color, castlingRights, enPassantSquare)

    if (moves.length === 0) {
      if (this.isInCheck(board, color)) {
        return isMaximizing ? -20000 + (this.depth - depth) : 20000 - (this.depth - depth)
      }
      return 0
    }

    const orderedMoves = this.orderMoves(moves, board, color)

    if (isMaximizing) {
      let maxScore = -Infinity

      for (const move of orderedMoves) {
        const newBoard = this.makeMove(board, move)
        const newCastling = { ...castlingRights }

        if (color === 'white' && move.from.row === 7 && move.from.col === 4) {
          newCastling.whiteKingSide = false
          newCastling.whiteQueenSide = false
        }
        if (color === 'black' && move.from.row === 0 && move.from.col === 4) {
          newCastling.blackKingSide = false
          newCastling.blackQueenSide = false
        }

        let newEnPassant: Position | null = null
        if (move.enPassant) {
          newEnPassant = {
            row: move.from.row,
            col: move.to.col,
          }
        }

        const score = this.minimax(
          newBoard,
          depth - 1,
          alpha,
          beta,
          false,
          this.getOppositeColor(color),
          newCastling,
          newEnPassant,
        )

        maxScore = Math.max(maxScore, score)
        alpha = Math.max(alpha, score)

        if (beta <= alpha) {
          this.killerMoves[depth] = move
          break
        }
      }

      this.transpositionTable.set(hash, { score: maxScore, depth })
      return maxScore
    } else {
      let minScore = Infinity

      for (const move of orderedMoves) {
        const newBoard = this.makeMove(board, move)
        const newCastling = { ...castlingRights }

        if (color === 'white' && move.from.row === 7 && move.from.col === 4) {
          newCastling.whiteKingSide = false
          newCastling.whiteQueenSide = false
        }
        if (color === 'black' && move.from.row === 0 && move.from.col === 4) {
          newCastling.blackKingSide = false
          newCastling.blackQueenSide = false
        }

        let newEnPassant: Position | null = null
        if (move.enPassant) {
          newEnPassant = {
            row: move.from.row,
            col: move.to.col,
          }
        }

        const score = this.minimax(
          newBoard,
          depth - 1,
          alpha,
          beta,
          true,
          this.getOppositeColor(color),
          newCastling,
          newEnPassant,
        )

        minScore = Math.min(minScore, score)
        beta = Math.min(beta, score)

        if (beta <= alpha) {
          this.killerMoves[depth] = move
          break
        }
      }

      this.transpositionTable.set(hash, { score: minScore, depth })
      return minScore
    }
  }

  getBestMove(
    board: BoardPiece[][],
    color: PlayerColor,
    castlingRights: {
      whiteKingSide: boolean
      whiteQueenSide: boolean
      blackKingSide: boolean
      blackQueenSide: boolean
    },
    enPassantSquare: Position | null,
  ): Move | null {
    this.nodesEvaluated = 0
    this.transpositionTable.clear()
    this.killerMoves = []

    const moves = this.generateLegalMoves(board, color, castlingRights, enPassantSquare)

    if (moves.length === 0) return null
    if (moves.length === 1) return moves[0] ?? null

    if (this.depth === 1) {
      const idx = Math.floor(Math.random() * moves.length)
      return moves[idx] ?? null
    }

    const orderedMoves = this.orderMoves(moves, board, color)

    let bestMove: Move | null = null
    let bestScore = color === 'white' ? -Infinity : Infinity

    for (const move of orderedMoves) {
      const newBoard = this.makeMove(board, move)
      const newCastling = { ...castlingRights }

      if (color === 'white' && move.from.row === 7 && move.from.col === 4) {
        newCastling.whiteKingSide = false
        newCastling.whiteQueenSide = false
      }
      if (color === 'black' && move.from.row === 0 && move.from.col === 4) {
        newCastling.blackKingSide = false
        newCastling.blackQueenSide = false
      }

      let newEnPassant: Position | null = null
      if (move.enPassant) {
        newEnPassant = {
          row: move.from.row,
          col: move.to.col,
        }
      }

      const score = this.minimax(
        newBoard,
        this.depth - 1,
        -Infinity,
        Infinity,
        color === 'white' ? false : true,
        this.getOppositeColor(color),
        newCastling,
        newEnPassant,
      )

      if (color === 'white') {
        if (score > bestScore) {
          bestScore = score
          bestMove = move
        }
      } else {
        if (score < bestScore) {
          bestScore = score
          bestMove = move
        }
      }
    }

    if (bestMove) {
      const key = `${bestMove.from.row},${bestMove.from.col}-${bestMove.to.row},${bestMove.to.col}`
      this.historyTable[key] = (this.historyTable[key] || 0) + this.depth
    }

    return bestMove
  }

  getNodesEvaluated(): number {
    return this.nodesEvaluated
  }
}

export const createAI = (depth: number = 3): ChessAI => {
  return new ChessAI(depth)
}
