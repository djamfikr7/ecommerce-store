'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import Board3D from '@/components/board/Board3DWrapper'
import { Board2D } from '@/components/board/Board2D'
import Panel from '@/components/ui/Panel'
import EvaluationGraph from '@/components/ui/EvaluationGraph'
import MoveHistory, { Move } from '@/components/ui/MoveHistory'
import Timer from '@/components/ui/Timer'
import Settings from '@/components/ui/Settings'
import GameControls from '@/components/game/GameControls'
import ClientOnly from '@/components/ClientOnly'

type GameMode = 'human-vs-ai' | 'ai-vs-ai' | 'human-vs-human'

interface CapturedPiece {
  type: string
  color: 'white' | 'black'
}

export default function ChessGamePage() {
  const [gameMode, setGameMode] = useState<GameMode>('human-vs-ai')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)
  const [is3DMode, setIs3DMode] = useState(false)
  const [evaluation, setEvaluation] = useState(0)
  const [moves, setMoves] = useState<Move[]>([])
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number | undefined>()
  const [capturedWhite, setCapturedWhite] = useState<CapturedPiece[]>([])
  const [capturedBlack, setCapturedBlack] = useState<CapturedPiece[]>([])
  const [settings, setSettings] = useState({
    difficulty: 3,
    timeControl: '5+0',
    boardTheme: 'brown',
    soundEnabled: true,
    flipBoard: false,
  })

  const [whiteTime, setWhiteTime] = useState(300)
  const [blackTime, setBlackTime] = useState(300)
  const [isWhiteTurn, setIsWhiteTurn] = useState(true)
  const [isThinking, setIsThinking] = useState(false)

  const handleNewGame = useCallback(() => {
    setMoves([])
    setCurrentMoveIndex(undefined)
    setEvaluation(0)
    setCapturedWhite([])
    setCapturedBlack([])
    setWhiteTime(300)
    setBlackTime(300)
    setIsWhiteTurn(true)
    setIsThinking(false)
  }, [])

  const handleUndo = useCallback(() => {
    if (moves.length > 0) {
      setMoves((prev) => prev.slice(0, -1))
      setCurrentMoveIndex(undefined)
    }
  }, [moves.length])

  const handleHint = useCallback(() => {
    console.log('Hint requested')
  }, [])

  const handleFlipBoard = useCallback(() => {
    setIsFlipped((prev) => !prev)
  }, [])

  const handleMoveClick = useCallback((index: number) => {
    setCurrentMoveIndex(index)
  }, [])

  const handleTimeUp = useCallback(() => {
    console.log("Time's up!")
  }, [])

  const handleDifficultyChange = useCallback((d: number) => {
    setSettings((prev) => ({ ...prev, difficulty: d }))
  }, [])

  const handleTimeControlChange = useCallback((t: string) => {
    setSettings((prev) => ({ ...prev, timeControl: t }))
    const parts = t.split('+')
    const mins = parseInt(parts[0] || '5', 10)
    setWhiteTime(mins * 60)
    setBlackTime(mins * 60)
  }, [])

  const handleBoardThemeChange = useCallback((t: string) => {
    setSettings((prev) => ({ ...prev, boardTheme: t }))
  }, [])

  const handleSoundToggle = useCallback(() => {
    setSettings((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
  }, [])

  const handleFlipBoardToggle = useCallback(() => {
    setSettings((prev) => ({ ...prev, flipBoard: !prev.flipBoard }))
    setIsFlipped((prev) => !prev)
  }, [])

  const renderGameModeSelector = () => (
    <motion.div
      className="mb-4 flex flex-wrap items-center justify-center gap-2"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      {[
        { value: 'human-vs-ai', label: 'Human vs AI' },
        { value: 'ai-vs-ai', label: 'AI vs AI' },
        { value: 'human-vs-human', label: 'Human vs Human' },
      ].map(({ value, label }, index) => (
        <motion.button
          key={value}
          onClick={() => setGameMode(value as GameMode)}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
            gameMode === value
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + index * 0.05 }}
        >
          {label}
        </motion.button>
      ))}
    </motion.div>
  )

  const renderCapturedPieces = (pieces: CapturedPiece[], color: 'white' | 'black') => (
    <motion.div className="flex flex-wrap gap-1" layout>
      {pieces.length === 0 ? (
        <span className="text-xs text-gray-600">None</span>
      ) : (
        pieces.map((piece, i) => (
          <motion.div
            key={i}
            className={`flex h-5 w-5 items-center justify-center rounded text-xs font-bold ${
              color === 'white' ? 'bg-gray-200 text-gray-800' : 'bg-gray-700 text-gray-200'
            }`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.05, type: 'spring', stiffness: 500, damping: 25 }}
          >
            {piece?.type?.[0]?.toUpperCase() ?? ''}
          </motion.div>
        ))
      )}
    </motion.div>
  )

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 20 },
    },
  }

  return (
    <motion.div
      className="bg-dark-gradient min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <header className="sticky top-0 z-50 border-b border-gray-800/50 bg-black/20 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <motion.div className="flex items-center gap-3" whileHover={{ scale: 1.02 }}>
            <motion.div
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg"
              whileHover={{ rotate: 90 }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-xl font-bold text-white">♔</span>
            </motion.div>
            <h1 className="text-xl font-bold text-white">3D Chess</h1>
          </motion.div>

          <div className="flex items-center gap-3">
            {/* 2D/3D Toggle */}
            <motion.div
              className="flex items-center gap-2 rounded-lg bg-gray-800 p-1"
              whileHover={{ scale: 1.02 }}
            >
              <button
                onClick={() => setIs3DMode(false)}
                className={`rounded px-3 py-1.5 text-xs font-medium transition-all ${
                  !is3DMode ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                }`}
              >
                2D
              </button>
              <button
                onClick={() => setIs3DMode(true)}
                className={`rounded px-3 py-1.5 text-xs font-medium transition-all ${
                  is3DMode ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                }`}
              >
                3D
              </button>
            </motion.div>

            <motion.button
              onClick={handleNewGame}
              className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-gray-700"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              New Game
            </motion.button>
            <motion.button
              onClick={() => setIsSettingsOpen(true)}
              className="rounded-lg bg-gray-800 p-2 text-gray-400 transition-all hover:bg-gray-700 hover:text-white"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </motion.button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {renderGameModeSelector()}

        <LayoutGroup>
          <motion.div
            className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr_220px] xl:grid-cols-[320px_1fr_260px]"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div className="space-y-4" variants={itemVariants}>
              <Panel title="Black Player" delay={0}>
                <motion.div className="flex items-center justify-between" layout>
                  <motion.div
                    className="flex items-center gap-2"
                    animate={
                      isThinking && !isWhiteTurn
                        ? {
                            boxShadow: ['0 0 0px #3b82f6', '0 0 20px #3b82f6', '0 0 0px #3b82f6'],
                          }
                        : {}
                    }
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold ${
                        isThinking && !isWhiteTurn
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 text-white'
                      }`}
                    >
                      B
                    </div>
                    <div className="text-sm text-gray-400">
                      {gameMode === 'ai-vs-ai'
                        ? 'Stockfish'
                        : gameMode === 'human-vs-human'
                          ? 'Player 2'
                          : 'AI'}
                    </div>
                  </motion.div>
                  <Timer
                    timeSeconds={blackTime}
                    increment={0}
                    isRunning={!isWhiteTurn && gameMode !== 'human-vs-human'}
                    onTimeUp={handleTimeUp}
                  />
                </motion.div>
                <motion.div
                  className="mt-3"
                  animate={isThinking && !isWhiteTurn ? { opacity: [0.5, 1, 0.5] } : { opacity: 1 }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <span className="text-xs uppercase text-gray-500">Captured (White)</span>
                  {renderCapturedPieces(capturedWhite, 'white')}
                </motion.div>
              </Panel>

              <Panel title="Game Info" delay={0.05}>
                <motion.div className="space-y-2 text-sm" variants={containerVariants}>
                  <motion.div className="flex justify-between" variants={itemVariants}>
                    <span className="text-gray-500">Mode</span>
                    <span className="text-white">
                      {gameMode === 'human-vs-ai'
                        ? 'Human vs AI'
                        : gameMode === 'ai-vs-ai'
                          ? 'AI vs AI'
                          : 'Human vs Human'}
                    </span>
                  </motion.div>
                  <motion.div className="flex justify-between" variants={itemVariants}>
                    <span className="text-gray-500">Difficulty</span>
                    <span className="text-white">{settings.difficulty}/5</span>
                  </motion.div>
                  <motion.div className="flex justify-between" variants={itemVariants}>
                    <span className="text-gray-500">Time</span>
                    <span className="text-white">{settings.timeControl}</span>
                  </motion.div>
                </motion.div>
              </Panel>

              <Panel title="White Player" delay={0.1}>
                <motion.div className="flex items-center justify-between" layout>
                  <motion.div
                    className="flex items-center gap-2"
                    animate={
                      isThinking && isWhiteTurn
                        ? {
                            boxShadow: ['0 0 0px #3b82f6', '0 0 20px #3b82f6', '0 0 0px #3b82f6'],
                          }
                        : {}
                    }
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold ${
                        isThinking && isWhiteTurn
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      W
                    </div>
                    <div className="text-sm text-gray-400">
                      {gameMode === 'human-vs-ai'
                        ? 'Human'
                        : gameMode === 'ai-vs-ai'
                          ? 'Stockfish'
                          : 'Player 1'}
                    </div>
                  </motion.div>
                  <Timer
                    timeSeconds={whiteTime}
                    increment={0}
                    isRunning={isWhiteTurn && gameMode !== 'ai-vs-ai'}
                    onTimeUp={handleTimeUp}
                  />
                </motion.div>
                <motion.div
                  className="mt-3"
                  animate={isThinking && isWhiteTurn ? { opacity: [0.5, 1, 0.5] } : { opacity: 1 }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <span className="text-xs uppercase text-gray-500">Captured (Black)</span>
                  {renderCapturedPieces(capturedBlack, 'black')}
                </motion.div>
              </Panel>
            </motion.div>

            <motion.div className="relative" variants={itemVariants} layout>
              <motion.div
                className={`${isFlipped ? 'rotate-180' : ''} transition-transform duration-500`}
                layout
              >
                {is3DMode ? (
                  <ClientOnly
                    fallback={
                      <div className="bg-gradient-dark flex h-full w-full items-center justify-center rounded-xl">
                        <span className="text-white/50">Loading 3D Board...</span>
                      </div>
                    }
                  >
                    <Board3D />
                  </ClientOnly>
                ) : (
                  <Board2D isFlipped={isFlipped} />
                )}
              </motion.div>
              <AnimatePresence>
                {isThinking && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      className="flex flex-col items-center gap-3"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                    >
                      <motion.div
                        className="animate-thinking-pulse h-10 w-10 rounded-full border-4 border-blue-500 border-t-transparent"
                        style={{ boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)' }}
                      />
                      <span className="text-sm font-medium text-white">AI is thinking...</span>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div className="space-y-4" variants={itemVariants}>
              <Panel title="Evaluation" className="flex justify-center" delay={0.15}>
                <EvaluationGraph evaluation={evaluation} />
              </Panel>

              <Panel title="Move History" className="max-h-80" delay={0.2}>
                <MoveHistory
                  moves={moves}
                  currentMoveIndex={currentMoveIndex}
                  onMoveClick={handleMoveClick}
                />
              </Panel>
            </motion.div>
          </motion.div>
        </LayoutGroup>

        <motion.div
          className="mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <GameControls
            onNewGame={handleNewGame}
            onUndo={handleUndo}
            onHint={handleHint}
            onFlipBoard={handleFlipBoard}
            onSettingsClick={() => setIsSettingsOpen(true)}
            isThinking={isThinking}
          />
        </motion.div>
      </main>

      <Settings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        difficulty={settings.difficulty}
        onDifficultyChange={handleDifficultyChange}
        timeControl={settings.timeControl}
        onTimeControlChange={handleTimeControlChange}
        boardTheme={settings.boardTheme}
        onBoardThemeChange={handleBoardThemeChange}
        soundEnabled={settings.soundEnabled}
        onSoundToggle={handleSoundToggle}
        flipBoard={settings.flipBoard}
        onFlipBoardToggle={handleFlipBoardToggle}
      />
    </motion.div>
  )
}
