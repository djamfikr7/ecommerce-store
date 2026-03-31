'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Download,
  FileText,
  Table,
  ChevronDown,
  Loader2,
  Check,
  AlertCircle,
  Calendar,
  Columns3,
} from 'lucide-react'

type ExportFormat = 'csv' | 'pdf'

interface ExportColumn {
  key: string
  label: string
  defaultSelected?: boolean
}

interface ExportButtonProps {
  entity: 'orders' | 'products' | 'users' | 'revenue'
  availableColumns?: ExportColumn[]
  dateRange?: { from?: string; to?: string }
  additionalFilters?: Record<string, string>
  label?: string
}

const ENTITY_LABELS: Record<string, string> = {
  orders: 'Orders',
  products: 'Products',
  users: 'Users',
  revenue: 'Revenue Report',
}

export function ExportButton({
  entity,
  availableColumns,
  dateRange,
  additionalFilters,
  label,
}: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [format, setFormat] = useState<ExportFormat>('csv')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(
    new Set(availableColumns?.filter((c) => c.defaultSelected !== false).map((c) => c.key) || []),
  )
  const [showColumnPicker, setShowColumnPicker] = useState(false)

  const buildExportUrl = useCallback(() => {
    const params = new URLSearchParams()

    if (entity === 'revenue') {
      params.set('format', format)
    }

    if (dateRange?.from) params.set('startDate', dateRange.from)
    if (dateRange?.from) params.set('dateFrom', dateRange.from)
    if (dateRange?.to) {
      params.set('endDate', dateRange.to)
      params.set('dateTo', dateRange.to)
    }

    if (selectedColumns.size > 0 && selectedColumns.size < (availableColumns?.length || 0)) {
      params.set('columns', Array.from(selectedColumns).join(','))
    }

    if (additionalFilters) {
      for (const [key, value] of Object.entries(additionalFilters)) {
        if (value) params.set(key, value)
      }
    }

    return `/api/admin/export/${entity}?${params.toString()}`
  }, [entity, format, dateRange, selectedColumns, availableColumns, additionalFilters])

  const handleExport = useCallback(async () => {
    setStatus('loading')
    setProgress(0)
    setErrorMessage('')

    try {
      const url = buildExportUrl()

      setProgress(30)

      const response = await fetch(url)

      if (!response.ok) {
        const data = await response.json().catch(() => ({ message: 'Export failed' }))
        throw new Error(data.message || 'Export failed')
      }

      setProgress(70)

      const blob = await response.blob()
      setProgress(90)

      const contentDisposition = response.headers.get('Content-Disposition')
      const filenameMatch = contentDisposition?.match(/filename="?(.+?)"?$/)
      const filename =
        filenameMatch?.[1] || `${entity}-export-${new Date().toISOString().slice(0, 10)}.${format}`

      const downloadUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(downloadUrl)

      setProgress(100)
      setStatus('success')

      setTimeout(() => {
        setStatus('idle')
        setIsOpen(false)
      }, 1500)
    } catch (error) {
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Export failed')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }, [buildExportUrl, entity, format])

  const toggleColumn = (key: string) => {
    const next = new Set(selectedColumns)
    if (next.has(key)) {
      if (next.size > 1) next.delete(key)
    } else {
      next.add(key)
    }
    setSelectedColumns(next)
  }

  const selectAllColumns = () => {
    setSelectedColumns(new Set(availableColumns?.map((c) => c.key) || []))
  }

  const deselectAllColumns = () => {
    if (availableColumns && availableColumns.length > 0) {
      setSelectedColumns(new Set([availableColumns[0]!.key]))
    }
  }

  const isRevenue = entity === 'revenue'

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 px-4 py-2.5 text-cyan-400 transition-all hover:border-cyan-400/50"
      >
        <Download size={16} />
        <span className="text-sm font-medium">{label || `Export ${ENTITY_LABELS[entity]}`}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/95 shadow-2xl backdrop-blur-md"
          >
            <div className="border-b border-slate-700/50 p-4">
              <h3 className="text-sm font-semibold text-white">Export {ENTITY_LABELS[entity]}</h3>
              <p className="mt-1 text-xs text-slate-400">Choose format and columns to export</p>
            </div>

            <div className="space-y-4 p-4">
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-400">
                  Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFormat('csv')}
                    className={`flex items-center gap-2 rounded-xl border p-3 transition-all ${
                      format === 'csv'
                        ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400'
                        : 'border-slate-700/50 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <Table size={16} />
                    <div className="text-left">
                      <p className="text-sm font-medium">CSV</p>
                      <p className="text-xs opacity-60">Spreadsheet</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setFormat('pdf')}
                    className={`flex items-center gap-2 rounded-xl border p-3 transition-all ${
                      format === 'pdf'
                        ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400'
                        : 'border-slate-700/50 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <FileText size={16} />
                    <div className="text-left">
                      <p className="text-sm font-medium">PDF</p>
                      <p className="text-xs opacity-60">Report</p>
                    </div>
                  </button>
                </div>
              </div>

              {availableColumns && availableColumns.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowColumnPicker(!showColumnPicker)}
                    className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-400 transition-colors hover:text-slate-300"
                  >
                    <Columns3 size={14} />
                    Columns ({selectedColumns.size}/{availableColumns.length})
                    <ChevronDown
                      size={12}
                      className={`transition-transform ${showColumnPicker ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <AnimatePresence>
                    {showColumnPicker && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mb-2 mt-2 flex gap-2">
                          <button
                            onClick={selectAllColumns}
                            className="text-xs text-cyan-400 hover:text-cyan-300"
                          >
                            Select All
                          </button>
                          <span className="text-slate-600">|</span>
                          <button
                            onClick={deselectAllColumns}
                            className="text-xs text-slate-400 hover:text-slate-300"
                          >
                            Select Minimal
                          </button>
                        </div>
                        <div className="max-h-40 space-y-1 overflow-y-auto">
                          {availableColumns.map((col) => (
                            <label
                              key={col.key}
                              className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-700/30"
                            >
                              <input
                                type="checkbox"
                                checked={selectedColumns.has(col.key)}
                                onChange={() => toggleColumn(col.key)}
                                className="rounded border-slate-600 bg-slate-700 text-cyan-500 focus:ring-cyan-500/50 focus:ring-offset-0"
                              />
                              <span className="text-sm text-slate-300">{col.label}</span>
                            </label>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {(dateRange?.from || dateRange?.to) && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Calendar size={12} />
                  <span>
                    {dateRange.from?.slice(0, 10) || '...'} — {dateRange.to?.slice(0, 10) || '...'}
                  </span>
                </div>
              )}

              {status === 'loading' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-cyan-400">
                    <Loader2 size={14} className="animate-spin" />
                    <span>Exporting...</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-700">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500"
                      initial={{ width: '0%' }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}

              {status === 'success' && (
                <div className="flex items-center gap-2 text-sm text-emerald-400">
                  <Check size={14} />
                  <span>Export complete!</span>
                </div>
              )}

              {status === 'error' && (
                <div className="flex items-center gap-2 text-sm text-red-400">
                  <AlertCircle size={14} />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                onClick={handleExport}
                disabled={status === 'loading'}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download size={14} />
                    {isRevenue && format === 'pdf'
                      ? 'Generate PDF Report'
                      : `Download ${format.toUpperCase()}`}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsOpen(false)
            setShowColumnPicker(false)
          }}
        />
      )}
    </div>
  )
}
