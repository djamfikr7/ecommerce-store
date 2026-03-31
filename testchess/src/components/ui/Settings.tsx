'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface SettingsProps {
  isOpen: boolean
  onClose: () => void
  difficulty: number
  onDifficultyChange: (d: number) => void
  timeControl: string
  onTimeControlChange: (t: string) => void
  boardTheme: string
  onBoardThemeChange: (t: string) => void
  soundEnabled: boolean
  onSoundToggle: () => void
  flipBoard: boolean
  onFlipBoardToggle: () => void
}

const TIME_CONTROLS = ['1+0', '3+0', '3+2', '5+0', '5+3', '10+0', '15+10', '30+0']

const BOARD_THEMES = ['brown', 'gray', 'green', 'blue', 'purple']

export default function Settings({
  isOpen,
  onClose,
  difficulty,
  onDifficultyChange,
  timeControl,
  onTimeControlChange,
  boardTheme,
  onBoardThemeChange,
  soundEnabled,
  onSoundToggle,
  flipBoard,
  onFlipBoardToggle,
}: SettingsProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="fixed right-4 top-20 z-50 w-72"
        >
          <div className="bg-dark-gradient shadow-neomorphic rounded-2xl border border-gray-700/50 p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Settings</h3>
              <button
                onClick={onClose}
                className="text-gray-500 transition-colors hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-gray-500">Difficulty</label>
                <div className="mt-1 flex gap-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      onClick={() => onDifficultyChange(level)}
                      className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all ${
                        difficulty === level
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      } `}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-gray-500">
                  Time Control
                </label>
                <select
                  value={timeControl}
                  onChange={(e) => onTimeControlChange(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                >
                  {TIME_CONTROLS.map((tc) => (
                    <option key={tc} value={tc}>
                      {tc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-gray-500">
                  Board Theme
                </label>
                <div className="mt-1 flex gap-2">
                  {BOARD_THEMES.map((theme) => (
                    <button
                      key={theme}
                      onClick={() => onBoardThemeChange(theme)}
                      className={`h-8 w-8 rounded-full border-2 transition-all ${
                        boardTheme === theme ? 'scale-110 border-blue-500' : 'border-transparent'
                      } `}
                      style={{
                        backgroundColor:
                          theme === 'brown'
                            ? '#b58863'
                            : theme === 'gray'
                              ? '#999'
                              : theme === 'green'
                                ? '#8cb369'
                                : theme === 'blue'
                                  ? '#5b8cd4'
                                  : '#9b6d9d',
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-gray-500">Sound</span>
                <button
                  onClick={onSoundToggle}
                  className={`relative h-6 w-12 rounded-full transition-all ${soundEnabled ? 'bg-blue-600' : 'bg-gray-700'} `}
                >
                  <motion.div
                    className="absolute top-1 h-4 w-4 rounded-full bg-white"
                    animate={{ left: soundEnabled ? 28 : 4 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-gray-500">Flip Board</span>
                <button
                  onClick={onFlipBoardToggle}
                  className={`relative h-6 w-12 rounded-full transition-all ${flipBoard ? 'bg-blue-600' : 'bg-gray-700'} `}
                >
                  <motion.div
                    className="absolute top-1 h-4 w-4 rounded-full bg-white"
                    animate={{ left: flipBoard ? 28 : 4 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
