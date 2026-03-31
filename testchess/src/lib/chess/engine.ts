import { Chess, Square, Move } from 'chess.js'

export interface Position {
  row: number
  col: number
}

export interface MoveResult {
  from: Position
  to: Position
  promotion?: string
  capture?: string
  enPassant?: boolean
  castling?: 'kingside' | 'queenside'
}

export interface CastlingRights {
  whiteKingSide: boolean
  whiteQueenSide: boolean
  blackKingSide: boolean
  blackQueenSide: boolean
}

type BoardPiece = string | null

const INITIAL_POSITION: BoardPiece[][] = [
  ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
  ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
  ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
]

function algebraicToCoords(square: string): Position {
  const file = square.charCodeAt(0) - 97
  const rankChar = square[1]
  const rank = 8 - (rankChar ? parseInt(rankChar) : 0)
  return { row: rank, col: file }
}

function coordsToAlgebraic(row: number, col: number): string {
  const file = String.fromCharCode(97 + col)
  const rank = 8 - row
  return file + rank
}

function cloneBoard(board: BoardPiece[][]): BoardPiece[][] {
  return board.map((row) => [...row])
}

class ChessEngine {
  private chess: Chess
  private board: BoardPiece[][]
  private castlingRights: CastlingRights
  private enPassantSquare: Position | null
  private fullMoveNumber: number

  constructor() {
    this.chess = new Chess()
    this.board = cloneBoard(INITIAL_POSITION)
    this.castlingRights = {
      whiteKingSide: true,
      whiteQueenSide: true,
      blackKingSide: true,
      blackQueenSide: true,
    }
    this.enPassantSquare = null
    this.fullMoveNumber = 1
  }

  getBoard(): BoardPiece[][] {
    return cloneBoard(this.board)
  }

  getFEN(): string {
    return this.chess.fen()
  }

  loadFEN(fen: string): boolean {
    try {
      this.chess.load(fen)
      this.board = this.parseFEN(fen)
      return true
    } catch {
      return false
    }
  }

  private parseFEN(fen: string): string[][] {
    const board: string[][] = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null))
    const parts = fen.split(' ')
    const positionPart = parts[0]
    if (!positionPart) return board
    const rows = positionPart.split('/')

    for (let row = 0; row < 8; row++) {
      const boardRow = board[row]
      const rowStr = rows[row]
      if (!boardRow || !rowStr) continue
      let col = 0
      for (const char of rowStr) {
        if (char >= '1' && char <= '8') {
          col += parseInt(char)
        } else {
          boardRow[col] = char
          col++
        }
      }
    }

    return board
  }

  getCurrentTurn(): 'white' | 'black' {
    return this.chess.turn() === 'w' ? 'white' : 'black'
  }

  getLegalMoves(position?: Position): MoveResult[] {
    if (position) {
      const square = coordsToAlgebraic(position.row, position.col)
      const moves = this.chess.moves({ square: square as Square, verbose: true })
      return moves.map((m) => ({
        from: algebraicToCoords(m.from),
        to: algebraicToCoords(m.to),
        promotion: m.promotion,
        capture: m.captured,
        enPassant: m.flags.includes('e'),
        castling: m.flags.includes('k')
          ? 'kingside'
          : m.flags.includes('q')
            ? 'queenside'
            : undefined,
      }))
    }
    const moves = this.chess.moves({ verbose: true })
    return moves.map((m) => ({
      from: algebraicToCoords(m.from),
      to: algebraicToCoords(m.to),
      promotion: m.promotion,
      capture: m.captured,
      enPassant: m.flags.includes('e'),
      castling: m.flags.includes('k')
        ? 'kingside'
        : m.flags.includes('q')
          ? 'queenside'
          : undefined,
    }))
  }

  makeMove(from: Position, to: Position, promotion?: string): MoveResult | null {
    const fromSquare = coordsToAlgebraic(from.row, from.col)
    const toSquare = coordsToAlgebraic(to.row, to.col)

    try {
      const move = this.chess.move({
        from: fromSquare as Square,
        to: toSquare as Square,
        promotion,
      })

      if (move) {
        this.board = this.parseFEN(this.chess.fen())
        this.updateCastlingRights(move)
        this.updateEnPassant(move)

        if (this.chess.turn() === 'b') {
          this.fullMoveNumber++
        }

        return {
          from,
          to,
          promotion: move.promotion,
          capture: move.captured,
          enPassant: move.flags.includes('e'),
          castling: move.flags.includes('k')
            ? 'kingside'
            : move.flags.includes('q')
              ? 'queenside'
              : undefined,
        }
      }
    } catch {
      return null
    }
    return null
  }

  private updateCastlingRights(move: Move): void {
    if (move.from === 'e1') {
      this.castlingRights.whiteKingSide = false
      this.castlingRights.whiteQueenSide = false
    }
    if (move.from === 'e8') {
      this.castlingRights.blackKingSide = false
      this.castlingRights.blackQueenSide = false
    }
    if (move.from === 'a1') this.castlingRights.whiteQueenSide = false
    if (move.from === 'h1') this.castlingRights.whiteKingSide = false
    if (move.from === 'a8') this.castlingRights.blackQueenSide = false
    if (move.from === 'h8') this.castlingRights.blackKingSide = false

    if (move.to === 'a1') this.castlingRights.whiteQueenSide = false
    if (move.to === 'h1') this.castlingRights.whiteKingSide = false
    if (move.to === 'a8') this.castlingRights.blackQueenSide = false
    if (move.to === 'h8') this.castlingRights.blackKingSide = false
  }

  private updateEnPassant(move: Move): void {
    if (move.flags.includes('e')) {
      const toChar = move.to[1]
      this.enPassantSquare = {
        row: 8 - (toChar ? parseInt(toChar) : 0),
        col: move.to.charCodeAt(0) - 97,
      }
    } else {
      this.enPassantSquare = null
    }
  }

  undoMove(): MoveResult | null {
    const move = this.chess.undo()
    if (move) {
      this.board = this.parseFEN(this.chess.fen())
      return {
        from: algebraicToCoords(move.from),
        to: algebraicToCoords(move.to),
        promotion: move.promotion,
        capture: move.captured,
      }
    }
    return null
  }

  isGameOver(): boolean {
    return this.chess.isGameOver()
  }

  isCheck(): boolean {
    return this.chess.inCheck()
  }

  isCheckmate(): boolean {
    return this.chess.isCheckmate()
  }

  isStalemate(): boolean {
    return this.chess.isStalemate()
  }

  isDraw(): boolean {
    return this.chess.isDraw()
  }

  isThreefoldRepetition(): boolean {
    return this.chess.isThreefoldRepetition()
  }

  isInsufficientMaterial(): boolean {
    return this.chess.isInsufficientMaterial()
  }

  getResult(): string | null {
    if (!this.chess.isGameOver()) return null

    if (this.chess.isCheckmate()) {
      const winner = this.chess.turn() === 'w' ? 'black' : 'white'
      return `${winner} wins by checkmate`
    }
    if (this.chess.isStalemate()) return 'draw by stalemate'
    if (this.chess.isThreefoldRepetition()) return 'draw by threefold repetition'
    if (this.chess.isDraw()) return 'draw'
    return 'draw'
  }

  getMoveHistory(): { from: Position; to: Position; notation: string }[] {
    const history = this.chess.history({ verbose: true })
    return history.map((m) => ({
      from: algebraicToCoords(m.from),
      to: algebraicToCoords(m.to),
      notation: m.san,
    }))
  }

  reset(): void {
    this.chess = new Chess()
    this.board = cloneBoard(INITIAL_POSITION)
    this.castlingRights = {
      whiteKingSide: true,
      whiteQueenSide: true,
      blackKingSide: true,
      blackQueenSide: true,
    }
    this.enPassantSquare = null
    this.fullMoveNumber = 1
  }

  getCastlingRights(): CastlingRights {
    return { ...this.castlingRights }
  }

  getEnPassantSquare(): Position | null {
    return this.enPassantSquare
  }
}

export const game = new ChessEngine()
export { ChessEngine }
