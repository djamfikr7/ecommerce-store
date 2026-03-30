export { Chess } from 'chess.js'
export type { Square } from 'chess.js'
export { ChessEngine, game } from './engine'
export type { Position, MoveResult, CastlingRights } from './engine'
export { useChessStore } from './store'
export type { ChessStore } from './store'
export { PuzzleSystem, puzzleSystem } from './puzzles'
export type { Puzzle, PuzzleStats, PuzzleAttempt } from './puzzles'
export type {
  Position as ChessPosition,
  PieceColor,
  PieceType,
  PlayerColor,
  Piece,
  Move,
  MoveResult as GameMoveResult,
  CastlingRights as ChessCastlingRights,
  EnPassantSquare,
  GameState,
  GameResult,
  AICalculation,
  GameVariant,
  ChessVariantConfig,
  PositionHistory,
} from './types'
export { ChessAI, createAI } from './ai'
export {
  ChessVariants,
  generateChess960Position,
  generateHordePosition,
  getChess960Fen,
  getVariantConfig,
  getAllVariants,
  getStartingPosition,
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
} from './variants'
