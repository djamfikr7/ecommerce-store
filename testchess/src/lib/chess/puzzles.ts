import type { Position } from './engine'

export interface Puzzle {
  id: string
  fen: string
  moves: string[]
  rating: number
}

export interface PuzzleStats {
  total: number
  solved: number
  accuracy: number
  streak: number
  bestStreak: number
}

export interface PuzzleAttempt {
  puzzleId: string
  correct: boolean
  timestamp: number
}

export class PuzzleSystem {
  private puzzles: Puzzle[]
  private currentPuzzleIndex: number = 0
  private currentMoveIndex: number = 0
  private streak: number = 0
  private bestStreak: number = 0
  private attempts: PuzzleAttempt[] = []
  private isPuzzleMode: boolean = false

  constructor() {
    this.puzzles = this.getBuiltInPuzzles()
  }

  private getBuiltInPuzzles(): Puzzle[] {
    return [
      {
        id: 'p001',
        fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq -',
        moves: ['Nxe5', 'd6', 'Nf7'],
        rating: 800,
      },
      {
        id: 'p002',
        fen: 'rnbqkbnr/ppp2ppp/4p3/3pP3/3P4/8/PPP2PPP/RNBQKBNR w KQkq d6',
        moves: ['exd6'],
        rating: 600,
      },
      {
        id: 'p003',
        fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq -',
        moves: ['Bxf7+', 'Kf8', 'Ng5'],
        rating: 1000,
      },
      {
        id: 'p004',
        fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -',
        moves: ['Nxe5'],
        rating: 400,
      },
      {
        id: 'p005',
        fen: 'r1bqk2r/ppppnppp/2n5/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq -',
        moves: ['Bxf7+', 'Kf8', 'Bg5'],
        rating: 1100,
      },
      {
        id: 'p006',
        fen: 'rnbqkbnr/ppp2ppp/4p3/3pP3/2PP4/8/PP3PPP/RNBQKBNR w KQkq d6',
        moves: ['cxd5', 'exd5', 'Bxb5+'],
        rating: 900,
      },
      {
        id: 'p007',
        fen: 'r1bqk2r/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq -',
        moves: ['Bxf7+', 'Kxf7', 'Ng5+'],
        rating: 1200,
      },
      {
        id: 'p008',
        fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P2Q/8/PPPP1PPP/RNB1K1NR w KQkq -',
        moves: ['Qxf7#'],
        rating: 500,
      },
      {
        id: 'p009',
        fen: 'r2qkbnr/ppp2ppp/2np4/4p3/2B1P1b1/5N1P/PPPP1PP1/RNBQK2R w KQkq -',
        moves: ['Bxf7+', 'Kf8', 'Ng5'],
        rating: 1300,
      },
      {
        id: 'p010',
        fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -',
        moves: ['Nxe5', 'd6', 'Nf7'],
        rating: 700,
      },
      {
        id: 'p011',
        fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq -',
        moves: ['Bxf7+', 'Kxf7', 'Ng5+', 'Kg8', 'Nf7'],
        rating: 1400,
      },
      {
        id: 'p012',
        fen: 'rnbqk1nr/pppp1ppp/4p3/8/1bPP4/2N5/PP3PPP/R1BQKBNR w KQkq -',
        moves: ['c3', 'Bg4', 'Qh5+'],
        rating: 850,
      },
      {
        id: 'p013',
        fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P2q/8/PPPP1PPP/RNBQK1NR w KQkq -',
        moves: ['Qxf7#'],
        rating: 450,
      },
      {
        id: 'p014',
        fen: 'r2qkb1r/ppp2ppp/2n1bn2/3pp3/2B1P1b1/2NP1N2/PPP2PPP/R1BQK2R w KQkq -',
        moves: ['Bxe6', 'fxe6', 'Ng5'],
        rating: 1150,
      },
      {
        id: 'p015',
        fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq -',
        moves: ['Bg5'],
        rating: 950,
      },
      {
        id: 'p016',
        fen: 'r1bqk2r/ppp2ppp/2n5/3pp3/1bP1P2b/2NP1N2/PP3PPP/R1BQKB1R w KQkq -',
        moves: ['Bxb5+'],
        rating: 750,
      },
      {
        id: 'p017',
        fen: 'r1bqk2r/ppppnppp/2n5/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq -',
        moves: ['Bxf7+', 'Kf8', 'Bg5'],
        rating: 1050,
      },
      {
        id: 'p018',
        fen: 'r1b1kbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -',
        moves: ['Nxe5', 'd6', 'Nf7'],
        rating: 650,
      },
    ]
  }

  loadPuzzle(index?: number): Puzzle | null {
    if (this.puzzles.length === 0) return null

    if (index !== undefined && index >= 0 && index < this.puzzles.length) {
      this.currentPuzzleIndex = index
    } else {
      this.currentPuzzleIndex = Math.floor(Math.random() * this.puzzles.length)
    }

    this.currentMoveIndex = 0
    this.isPuzzleMode = true

    return this.puzzles[this.currentPuzzleIndex] ?? null
  }

  loadNextPuzzle(): Puzzle | null {
    this.currentPuzzleIndex = (this.currentPuzzleIndex + 1) % this.puzzles.length
    this.currentMoveIndex = 0
    this.isPuzzleMode = true

    return this.puzzles[this.currentPuzzleIndex] ?? null
  }

  getCurrentPuzzle(): Puzzle | null {
    if (!this.isPuzzleMode) return null
    return this.puzzles[this.currentPuzzleIndex] || null
  }

  getCurrentMoveIndex(): number {
    return this.currentMoveIndex
  }

  getExpectedMove(): string | null {
    const puzzle = this.getCurrentPuzzle()
    if (!puzzle) return null
    return puzzle.moves[this.currentMoveIndex] || null
  }

  validateMove(moveUCI: string): boolean {
    const expected = this.getExpectedMove()
    if (!expected) return false
    return moveUCI === expected
  }

  validateMoveFromPositions(from: Position, to: Position): boolean {
    const fromSquare = this.positionToSquare(from)
    const toSquare = this.positionToSquare(to)
    const moveUCI = fromSquare + toSquare

    return this.validateMove(moveUCI)
  }

  private positionToSquare(pos: Position): string {
    const file = String.fromCharCode(97 + pos.col)
    const rank = 8 - pos.row
    return file + rank
  }

  private squareToPosition(square: string): Position {
    const file = square.charCodeAt(0) - 97
    const rankChar = square[1]
    const rank = rankChar ? 8 - parseInt(rankChar) : 0
    return { row: rank, col: file }
  }

  advanceToNextMove(): boolean {
    const puzzle = this.getCurrentPuzzle()
    if (!puzzle) return false

    this.currentMoveIndex++

    if (this.currentMoveIndex >= puzzle.moves.length) {
      return true
    }
    return false
  }

  getOpponentMove(): { from: Position; to: Position } | null {
    const puzzle = this.getCurrentPuzzle()
    if (!puzzle) return null

    const opponentMoveIndex = this.currentMoveIndex
    if (opponentMoveIndex >= puzzle.moves.length) return null

    const moveUCI = puzzle.moves[opponentMoveIndex]
    if (!moveUCI || moveUCI.length !== 4) return null

    const from = this.squareToPosition(moveUCI.substring(0, 2))
    const to = this.squareToPosition(moveUCI.substring(2, 4))

    return { from, to }
  }

  recordAttempt(correct: boolean): void {
    const puzzle = this.getCurrentPuzzle()
    if (!puzzle) return

    this.attempts.push({
      puzzleId: puzzle.id,
      correct,
      timestamp: Date.now(),
    })

    if (correct) {
      this.streak++
      if (this.streak > this.bestStreak) {
        this.bestStreak = this.streak
      }
    } else {
      this.streak = 0
    }
  }

  getStats(): PuzzleStats {
    const total = this.attempts.length
    const solved = this.attempts.filter((a) => a.correct).length

    return {
      total,
      solved,
      accuracy: total > 0 ? Math.round((solved / total) * 100) : 0,
      streak: this.streak,
      bestStreak: this.bestStreak,
    }
  }

  getPuzzleCount(): number {
    return this.puzzles.length
  }

  getPuzzleById(id: string): Puzzle | null {
    return this.puzzles.find((p) => p.id === id) || null
  }

  reset(): void {
    this.currentPuzzleIndex = 0
    this.currentMoveIndex = 0
    this.streak = 0
    this.bestStreak = 0
    this.attempts = []
    this.isPuzzleMode = false
  }

  isInPuzzleMode(): boolean {
    return this.isPuzzleMode
  }

  exitPuzzleMode(): void {
    this.isPuzzleMode = false
  }

  getPuzzleRating(): number {
    const puzzle = this.getCurrentPuzzle()
    return puzzle?.rating || 0
  }

  getThemes(): string[] {
    const themes = new Set<string>()
    this.puzzles.forEach((p) => {
      if (p.moves.length === 1) themes.add('mate-in-1')
      if (p.moves.length === 2) themes.add('mate-in-2')
      if (p.moves.length === 3) themes.add('mate-in-3')
      if (p.rating < 800) themes.add('beginner')
      else if (p.rating < 1100) themes.add('intermediate')
      else themes.add('advanced')
    })
    return Array.from(themes)
  }
}

export const puzzleSystem = new PuzzleSystem()
