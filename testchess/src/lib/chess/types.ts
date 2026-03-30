export interface Position {
  row: number
  col: number
}

export type PieceColor = 'white' | 'black'
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k'
export type PlayerColor = 'white' | 'black'

export interface Piece {
  type: PieceType
  color: PlayerColor
  symbol: string
}

export interface Move {
  from: Position
  to: Position
  notation?: string
  capture?: string
  promotion?: string
  enPassant?: boolean
  castling?: 'kingside' | 'queenside'
}

export interface MoveResult extends Move {
  valid: boolean
  reason?: string
}

export interface CastlingRights {
  whiteKingSide: boolean
  whiteQueenSide: boolean
  blackKingSide: boolean
  blackQueenSide: boolean
}

export interface EnPassantSquare {
  row: number
  col: number
}

export interface GameState {
  board: (string | null)[][]
  currentTurn: PlayerColor
  selectedSquare: Position | null
  legalMoves: Move[]
  moveHistory: Move[]
  gameOver: boolean
  result: string | null
  castlingRights: CastlingRights
  enPassantSquare: EnPassantSquare | null
  halfMoveClock: number
  fullMoveNumber: number
  isCheck: boolean
  isCheckmate: boolean
  isStalemate: boolean
}

export type GameResult =
  | { type: 'checkmate'; winner: PlayerColor }
  | { type: 'stalemate' }
  | { type: 'draw'; reason: string }
  | { type: 'resignation'; winner: PlayerColor }
  | { type: 'timeout'; winner: PlayerColor }
  | null

export interface AICalculation {
  depth: number
  score: number
  nodesEvaluated: number
  timeMs: number
  bestMove: Move | null
}

export type GameVariant =
  | 'standard'
  | 'chess960'
  | 'crazyhouse'
  | 'threecheck'
  | 'atomic'
  | 'horde'
  | 'racingKings'
  | 'kingOfTheHill'
  | 'antichess'

export interface ChessVariantConfig {
  name: string
  description: string
  startingFen?: string
  rules?: string[]
}

export interface PositionHistory {
  board: (string | null)[][]
  castling: CastlingRights
  enPassant: EnPassantSquare | null
  hash: string
}
