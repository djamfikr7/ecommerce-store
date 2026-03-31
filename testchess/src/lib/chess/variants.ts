import type { ChessVariantConfig, GameVariant, PlayerColor, Position, Move } from './types'

type BoardPiece = string | null

const VARIANTS: Record<GameVariant, ChessVariantConfig> = {
  standard: {
    name: 'Standard Chess',
    description: 'The classic chess game with standard rules.',
    startingFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  },
  chess960: {
    name: 'Chess960',
    description:
      'Also known as Fischer Random Chess. Starting position is randomized with bishops on opposite colors and king between rooks.',
    startingFen: undefined,
  },
  crazyhouse: {
    name: 'Crazyhouse',
    description:
      'Captured pieces can be dropped back on the board as your own. Drops are made instead of a move.',
    startingFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    rules: ['drop pieces as moves', 'pawns cannot be dropped on first rank'],
  },
  threecheck: {
    name: 'Three-Check',
    description: 'The game is won by checking the opponent three times. Each check is announced.',
    startingFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    rules: ['win by checking opponent 3 times'],
  },
  atomic: {
    name: 'Atomic',
    description:
      'Captured pieces (and surrounding pieces) are removed. King cannot be captured but checkmates still apply.',
    startingFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    rules: ['explosions remove pieces', 'king cannot be captured'],
  },
  horde: {
    name: 'Horde',
    description:
      'White has only pawns and must defend against standard black pieces. Win by checkmating the black king.',
    startingFen: undefined,
    rules: ['white has 36 pawns', 'black has standard pieces'],
  },
  racingKings: {
    name: 'Racing Kings',
    description:
      'Kings race to the opposite side. No checking allowed - first king to reach the back rank wins.',
    startingFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    rules: ['no checking allowed', 'king cannot move into check'],
  },
  kingOfTheHill: {
    name: 'King of the Hill',
    description:
      "Win by advancing your king to the opponent's back rank (the 8th rank for white, 1st rank for black).",
    startingFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    rules: ['king reaching back rank wins', 'regular checkmate also wins'],
  },
  antichess: {
    name: 'Antichess',
    description:
      'You must capture if possible. Win by losing all pieces or leaving opponent in stalemate.',
    startingFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    rules: ['must capture when possible', 'win by losing all pieces or stalemating opponent'],
  },
}

function createEmptyBoard(): BoardPiece[][] {
  return [
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
  ]
}

export function generateChess960Position(): BoardPiece[][] {
  const board = createEmptyBoard()

  const darkSquares = [1, 3, 5, 7]
  const lightSquares = [0, 2, 4, 6]

  const darkBishopCol = darkSquares[Math.floor(Math.random() * darkSquares.length)] ?? 1
  const lightBishopCol = lightSquares[Math.floor(Math.random() * lightSquares.length)] ?? 0

  board[0]![darkBishopCol] = 'b'
  board[0]![lightBishopCol] = 'B'

  const remainingCols: number[] = []
  for (let c = 0; c < 8; c++) {
    if (c !== darkBishopCol && c !== lightBishopCol) {
      remainingCols.push(c)
    }
  }

  for (let i = remainingCols.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[remainingCols[i], remainingCols[j]] = [remainingCols[j]!, remainingCols[i]!]
  }

  const queenCol = remainingCols.shift() ?? 3
  board[0]![queenCol] = 'q'
  board[7]![queenCol] = 'Q'

  const n1Col = remainingCols.shift() ?? 1
  const n2Col = remainingCols.shift() ?? 2
  board[0]![n1Col] = 'n'
  board[7]![n1Col] = 'N'
  board[0]![n2Col] = 'n'
  board[7]![n2Col] = 'N'

  const rookCols = remainingCols
  const sortedRooks = [...rookCols].sort((a, b) => a - b)
  const kingCol = Math.min(...rookCols) + 1

  if (kingCol <= sortedRooks[0]! || kingCol >= sortedRooks[1]!) {
    const middleCol = Math.floor((sortedRooks[0]! + sortedRooks[1]!) / 2)
    board[0]![middleCol] = 'k'
    board[7]![middleCol] = 'K'
    const leftRook = sortedRooks[0]! < middleCol ? sortedRooks[0]! : sortedRooks[1]!
    const rightRook = sortedRooks[0]! > middleCol ? sortedRooks[0]! : sortedRooks[1]!
    board[0]![leftRook] = 'r'
    board[7]![leftRook] = 'R'
    board[0]![rightRook] = 'r'
    board[7]![rightRook] = 'R'
  } else {
    board[0]![kingCol] = 'k'
    board[7]![kingCol] = 'K'
    board[0]![sortedRooks[0]!] = 'r'
    board[7]![sortedRooks[0]!] = 'R'
    board[0]![sortedRooks[1]!] = 'r'
    board[7]![sortedRooks[1]!] = 'R'
  }

  for (let col = 0; col < 8; col++) {
    board[1]![col] = 'p'
    board[6]![col] = 'P'
  }

  return board
}

export function generateHordePosition(): BoardPiece[][] {
  const board = createEmptyBoard()

  for (let row = 1; row <= 4; row++) {
    for (let col = 0; col < 8; col++) {
      board[row]![col] = 'P'
    }
  }

  board[0]![4] = 'k'
  board[7]![4] = 'K'

  return board
}

export function getChess960Fen(): string {
  const board = generateChess960Position()
  let fen = ''

  for (let row = 0; row < 8; row++) {
    let empty = 0
    const boardRow = board[row]
    if (!boardRow) continue
    for (let col = 0; col < 8; col++) {
      const piece = boardRow[col]
      if (piece) {
        if (empty > 0) {
          fen += empty
          empty = 0
        }
        fen += piece
      } else {
        empty++
      }
    }
    if (empty > 0) fen += empty
    if (row < 7) fen += '/'
  }

  return fen + ' w KQkq - 0 1'
}

export function getVariantConfig(variant: GameVariant): ChessVariantConfig {
  return VARIANTS[variant]
}

export function getAllVariants(): GameVariant[] {
  return Object.keys(VARIANTS) as GameVariant[]
}

export function getStartingPosition(variant: GameVariant): BoardPiece[][] {
  switch (variant) {
    case 'chess960':
      return generateChess960Position()
    case 'horde':
      return generateHordePosition()
    default:
      return [
        ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
        ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
        ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
      ]
  }
}

export function applyAtomicExplosion(
  board: BoardPiece[][],
  row: number,
  col: number,
): BoardPiece[][] {
  const newBoard: BoardPiece[][] = board.map((r) => [...r])
  const boardRow = newBoard[row]
  if (boardRow) {
    boardRow[col] = null
  }

  const directions: [number, number][] = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ]

  for (const dir of directions) {
    const dr = dir[0]
    const dc = dir[1]
    if (dr === undefined || dc === undefined) continue
    const nr = row + dr
    const nc = col + dc
    if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
      const nrBoard = newBoard[nr]
      if (!nrBoard) continue
      const piece = nrBoard[nc]
      if (piece && piece.toLowerCase() !== 'k') {
        nrBoard[nc] = null
      }
    }
  }

  return newBoard
}

export function canDropPiece(piece: BoardPiece, row: number, color: PlayerColor): boolean {
  if (!piece) return false

  const pieceType = piece.toLowerCase()
  if (pieceType === 'p') {
    const startRow = color === 'white' ? 6 : 1
    const promotionRow = color === 'white' ? 0 : 7
    if (row === startRow || row === promotionRow) return false
  }

  return true
}

export class CrazyhouseState {
  private pockets: { white: BoardPiece[]; black: BoardPiece[] }

  constructor() {
    this.pockets = { white: [], black: [] }
  }

  addPiece(piece: BoardPiece): void {
    if (!piece) return
    const color = piece === piece.toUpperCase() ? 'white' : 'black'
    this.pockets[color].push(piece)
  }

  getPocket(color: PlayerColor): BoardPiece[] {
    return this.pockets[color]
  }

  removePiece(piece: BoardPiece): boolean {
    if (!piece) return false
    const color = piece === piece.toUpperCase() ? 'white' : 'black'
    const index = this.pockets[color].indexOf(piece)
    if (index !== -1) {
      this.pockets[color].splice(index, 1)
      return true
    }
    return false
  }
}

export class ThreeCheckState {
  private checkCount: { white: number; black: number }

  constructor() {
    this.checkCount = { white: 0, black: 0 }
  }

  recordCheck(color: PlayerColor): void {
    this.checkCount[color]++
  }

  getCheckCount(color: PlayerColor): number {
    return this.checkCount[color]
  }

  hasWon(color: PlayerColor): boolean {
    return this.checkCount[color] >= 3
  }

  reset(): void {
    this.checkCount = { white: 0, black: 0 }
  }
}

export class KingOfTheHillState {
  private kingReachedEnd: { white: boolean; black: boolean }

  constructor() {
    this.kingReachedEnd = { white: false, black: false }
  }

  checkKingPosition(board: BoardPiece[][], color: PlayerColor): boolean {
    const backRank = color === 'white' ? 0 : 7
    for (let col = 0; col < 8; col++) {
      const piece = board[backRank]?.[col]
      if (piece?.toLowerCase() === 'k' && (piece === piece.toUpperCase()) === (color === 'white')) {
        this.kingReachedEnd[color] = true
        return true
      }
    }
    return false
  }

  hasWon(color: PlayerColor): boolean {
    return this.kingReachedEnd[color]
  }

  reset(): void {
    this.kingReachedEnd = { white: false, black: false }
  }
}

export class AntichessState {
  private capturedPieces: { white: BoardPiece[]; black: BoardPiece[] }

  constructor() {
    this.capturedPieces = { white: [], black: [] }
  }

  addPiece(piece: BoardPiece): void {
    if (!piece) return
    const color = piece === piece.toUpperCase() ? 'white' : 'black'
    this.capturedPieces[color].push(piece)
  }

  getCapturedCount(color: PlayerColor): number {
    return this.capturedPieces[color].length
  }

  reset(): void {
    this.capturedPieces = { white: [], black: [] }
  }
}

export function validateCrazyhouseMove(
  _board: BoardPiece[][],
  move: { from?: Position; to?: Position; dropPiece?: string },
  color: PlayerColor,
  legalMoves: Move[],
): boolean {
  if (move.dropPiece) {
    return canDropPiece(move.dropPiece, move.to?.row ?? 0, color)
  }
  const { from, to } = move
  if (!from || !to) return false
  return legalMoves.some(
    (m) =>
      m.from.row === from.row &&
      m.from.col === from.col &&
      m.to.row === to.row &&
      m.to.col === to.col,
  )
}

export function validateAtomicMove(
  _board: BoardPiece[][],
  move: { from?: Position; to?: Position },
  _color: PlayerColor,
  legalMoves: Move[],
): boolean {
  const { from, to } = move
  if (!from || !to) return false
  return legalMoves.some(
    (m) =>
      m.from.row === from.row &&
      m.from.col === from.col &&
      m.to.row === to.row &&
      m.to.col === to.col,
  )
}

export function validateThreeCheckMove(
  _board: BoardPiece[][],
  move: { from?: Position; to?: Position },
  _color: PlayerColor,
  legalMoves: Move[],
): boolean {
  const { from, to } = move
  if (!from || !to) return false
  return legalMoves.some(
    (m) =>
      m.from.row === from.row &&
      m.from.col === from.col &&
      m.to.row === to.row &&
      m.to.col === to.col,
  )
}

export function validateKingOfTheHillMove(
  _board: BoardPiece[][],
  move: { from?: Position; to?: Position },
  _color: PlayerColor,
  legalMoves: Move[],
): boolean {
  const { from, to } = move
  if (!from || !to) return false
  return legalMoves.some(
    (m) =>
      m.from.row === from.row &&
      m.from.col === from.col &&
      m.to.row === to.row &&
      m.to.col === to.col,
  )
}

export function validateAntichessMove(
  _board: BoardPiece[][],
  move: { from?: Position; to?: Position },
  _color: PlayerColor,
  legalMoves: Move[],
): { valid: boolean; mustCapture: boolean } {
  const captures = legalMoves.filter((m) => m.capture || m.enPassant)
  const { from, to } = move
  if (captures.length > 0) {
    if (!from || !to) return { valid: false, mustCapture: true }
    const isCapture = captures.some(
      (m) =>
        m.from.row === from.row &&
        m.from.col === from.col &&
        m.to.row === to.row &&
        m.to.col === to.col,
    )
    return { valid: !!isCapture, mustCapture: true }
  }
  if (!from || !to) return { valid: false, mustCapture: false }
  return {
    valid: legalMoves.some(
      (m) =>
        m.from.row === from.row &&
        m.from.col === from.col &&
        m.to.row === to.row &&
        m.to.col === to.col,
    ),
    mustCapture: false,
  }
}

export const ChessVariants = {
  getVariantConfig,
  getAllVariants,
  getStartingPosition,
  generateChess960Position,
  generateHordePosition,
  getChess960Fen,
  applyAtomicExplosion,
  canDropPiece,
  CrazyhouseState,
  ThreeCheckState,
  KingOfTheHillState,
  AntichessState,
  validateCrazyhouseMove,
  validateAtomicMove,
  validateThreeCheckMove,
  validateKingOfTheHillMove,
  validateAntichessMove,
}

export default ChessVariants
