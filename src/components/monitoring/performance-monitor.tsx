'use client'

/**
 * Performance Monitor Dev Tools Overlay
 * Displays real-time performance metrics during development
 */

import { useEffect, useState } from 'react'
import { performanceMonitor } from '@/lib/monitoring/performance'
import { webVitalsMonitor, type WebVitalsMetric } from '@/lib/monitoring/web-vitals'

interface PerformanceStats {
  apiCalls: number
  avgApiTime: number
  dbQueries: number
  avgDbTime: number
  memoryUsage: number
  vitalsScore: number | null
}

export function PerformanceMonitor() {
  const [isOpen, setIsOpen] = useState(false)
  const [stats, setStats] = useState<PerformanceStats>({
    apiCalls: 0,
    avgApiTime: 0,
    dbQueries: 0,
    avgDbTime: 0,
    memoryUsage: 0,
    vitalsScore: null,
  })
  const [vitals, setVitals] = useState<WebVitalsMetric[]>([])

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') {
      return
    }

    // Update stats every 2 seconds
    const interval = setInterval(() => {
      const apiStats = performanceMonitor.getStats('api.call')
      const dbStats = performanceMonitor.getStats('db.query')
      const memory = performanceMonitor.getMemoryMetrics()
      const vitalsScore = webVitalsMonitor.getPerformanceScore()
      const currentVitals = webVitalsMonitor.getVitals()

      setStats({
        apiCalls: apiStats?.count || 0,
        avgApiTime: apiStats?.avg || 0,
        dbQueries: dbStats?.count || 0,
        avgDbTime: dbStats?.avg || 0,
        memoryUsage: memory?.usagePercent || 0,
        vitalsScore,
      })

      setVitals(currentVitals)
    }, 2000)

    // Subscribe to web vitals updates
    const unsubscribe = webVitalsMonitor.subscribe((metric) => {
      setVitals((prev) => {
        const filtered = prev.filter((v) => v.name !== metric.name)
        return [...filtered, metric]
      })
    })

    // Keyboard shortcut to toggle (Ctrl+Shift+P)
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsOpen((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyPress)

    return () => {
      clearInterval(interval)
      unsubscribe()
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [])

  // Don't render in production
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-[9999] rounded-full bg-gradient-to-r from-purple-600 to-blue-600 p-3 text-white shadow-lg transition-all hover:shadow-xl"
        title="Performance Monitor (Ctrl+Shift+P)"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      </button>

      {/* Performance Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-[9999] max-h-[600px] w-96 overflow-auto rounded-lg border border-gray-700 bg-gray-900 text-white shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 flex items-center justify-between bg-gradient-to-r from-purple-600 to-blue-600 p-4">
            <h3 className="text-lg font-bold">Performance Monitor</h3>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200">
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="space-y-4 p-4">
            {/* Web Vitals Score */}
            {stats.vitalsScore !== null && (
              <div className="rounded-lg bg-gray-800 p-3">
                <div className="mb-1 text-sm text-gray-400">Performance Score</div>
                <div className="flex items-center gap-2">
                  <div className="text-3xl font-bold">{stats.vitalsScore}</div>
                  <div className="text-sm text-gray-400">/100</div>
                  <div
                    className={`ml-auto rounded px-2 py-1 text-xs font-semibold ${
                      stats.vitalsScore >= 90
                        ? 'bg-green-500/20 text-green-400'
                        : stats.vitalsScore >= 50
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {stats.vitalsScore >= 90
                      ? 'Good'
                      : stats.vitalsScore >= 50
                        ? 'Needs Work'
                        : 'Poor'}
                  </div>
                </div>
              </div>
            )}

            {/* Web Vitals */}
            <div className="rounded-lg bg-gray-800 p-3">
              <div className="mb-2 text-sm font-semibold">Core Web Vitals</div>
              <div className="space-y-2">
                {vitals.map((vital) => (
                  <div key={vital.name} className="flex items-center justify-between">
                    <div className="text-sm">{vital.name}</div>
                    <div className="flex items-center gap-2">
                      <div className="font-mono text-sm">
                        {vital.value.toFixed(0)}
                        {vital.name === 'CLS' ? '' : 'ms'}
                      </div>
                      <div
                        className={`h-2 w-2 rounded-full ${
                          vital.rating === 'good'
                            ? 'bg-green-400'
                            : vital.rating === 'needs-improvement'
                              ? 'bg-yellow-400'
                              : 'bg-red-400'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* API Calls */}
            <div className="rounded-lg bg-gray-800 p-3">
              <div className="mb-2 text-sm font-semibold">API Performance</div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Calls</span>
                  <span className="font-mono">{stats.apiCalls}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Avg Response Time</span>
                  <span className="font-mono">{stats.avgApiTime.toFixed(0)}ms</span>
                </div>
              </div>
            </div>

            {/* Database Queries */}
            <div className="rounded-lg bg-gray-800 p-3">
              <div className="mb-2 text-sm font-semibold">Database Performance</div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Queries</span>
                  <span className="font-mono">{stats.dbQueries}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Avg Query Time</span>
                  <span className="font-mono">{stats.avgDbTime.toFixed(0)}ms</span>
                </div>
              </div>
            </div>

            {/* Memory Usage */}
            {stats.memoryUsage > 0 && (
              <div className="rounded-lg bg-gray-800 p-3">
                <div className="mb-2 text-sm font-semibold">Memory Usage</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Heap Usage</span>
                    <span className="font-mono">{stats.memoryUsage.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-700">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        stats.memoryUsage > 80
                          ? 'bg-red-500'
                          : stats.memoryUsage > 60
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(stats.memoryUsage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  performanceMonitor.clear()
                  setStats({
                    apiCalls: 0,
                    avgApiTime: 0,
                    dbQueries: 0,
                    avgDbTime: 0,
                    memoryUsage: 0,
                    vitalsScore: null,
                  })
                }}
                className="flex-1 rounded bg-gray-700 px-3 py-2 text-sm transition-colors hover:bg-gray-600"
              >
                Clear Metrics
              </button>
              <button
                onClick={() => performanceMonitor.exportMetrics()}
                className="flex-1 rounded bg-blue-600 px-3 py-2 text-sm transition-colors hover:bg-blue-500"
              >
                Export Data
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
