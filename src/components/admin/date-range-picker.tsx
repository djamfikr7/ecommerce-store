'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, ChevronDown } from 'lucide-react'

export type DateRangePreset = '7d' | '30d' | '90d' | '12m' | 'custom'

interface DateRangePickerProps {
  value: DateRangePreset
  onChange: (range: DateRangePreset) => void
  customStart?: string
  customEnd?: string
  onCustomChange?: (start: string, end: string) => void
}

const PRESETS: { value: DateRangePreset; label: string }[] = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: '12m', label: 'Last 12 Months' },
  { value: 'custom', label: 'Custom Range' },
]

export function DateRangePicker({
  value,
  onChange,
  customStart,
  customEnd,
  onCustomChange,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentLabel = PRESETS.find((p) => p.value === value)?.label || 'Select Range'

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-xl border border-slate-700/50 bg-slate-800/50 px-4 py-2.5 text-slate-200 transition-all hover:border-slate-600 hover:bg-slate-700/50"
      >
        <Calendar size={16} className="text-cyan-400" />
        <span className="text-sm font-medium">{currentLabel}</span>
        <ChevronDown
          size={14}
          className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/95 shadow-2xl backdrop-blur-md"
          >
            <div className="p-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => {
                    onChange(preset.value)
                    if (preset.value !== 'custom') setIsOpen(false)
                  }}
                  className={`w-full rounded-xl px-4 py-2.5 text-left text-sm transition-all ${
                    value === preset.value
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {value === 'custom' && onCustomChange && (
              <div className="space-y-3 border-t border-slate-700/50 p-4">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-400">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={customStart || ''}
                    onChange={(e) => onCustomChange(e.target.value, customEnd || '')}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-200 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-400">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={customEnd || ''}
                    onChange={(e) => onCustomChange(customStart || '', e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-200 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                  />
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  Apply Range
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
