/**
 * Performance Monitoring System
 * Tracks various performance metrics including API calls, database queries, and custom metrics
 */

export interface PerformanceMetric {
  name: string
  value: number
  unit: 'ms' | 'bytes' | 'count'
  timestamp: number
  metadata?: Record<string, unknown>
}

export interface PerformanceBudget {
  metric: string
  threshold: number
  unit: string
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private budgets: Map<string, PerformanceBudget> = new Map()
  private observers: PerformanceObserver[] = []

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers()
    }
  }

  private initializeObservers() {
    // Resource timing observer
    try {
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming
            this.recordMetric({
              name: `resource.${resourceEntry.initiatorType}`,
              value: resourceEntry.duration,
              unit: 'ms',
              timestamp: Date.now(),
              metadata: {
                url: resourceEntry.name,
                size: resourceEntry.transferSize,
              },
            })
          }
        }
      })
      resourceObserver.observe({ entryTypes: ['resource'] })
      this.observers.push(resourceObserver)
    } catch (e) {
      console.warn('Resource timing observer not supported', e)
    }

    // Navigation timing observer
    try {
      const navigationObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming
            this.recordMetric({
              name: 'navigation.domContentLoaded',
              value: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
              unit: 'ms',
              timestamp: Date.now(),
            })
            this.recordMetric({
              name: 'navigation.loadComplete',
              value: navEntry.loadEventEnd - navEntry.loadEventStart,
              unit: 'ms',
              timestamp: Date.now(),
            })
          }
        }
      })
      navigationObserver.observe({ entryTypes: ['navigation'] })
      this.observers.push(navigationObserver)
    } catch (e) {
      console.warn('Navigation timing observer not supported', e)
    }
  }

  /**
   * Record a performance metric
   */
  recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric)
    this.checkBudget(metric)

    // Keep only last 1000 metrics to prevent memory leaks
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000)
    }
  }

  /**
   * Set a performance budget
   */
  setBudget(metric: string, threshold: number, unit: string) {
    this.budgets.set(metric, { metric, threshold, unit })
  }

  /**
   * Check if a metric exceeds its budget
   */
  private checkBudget(metric: PerformanceMetric) {
    const budget = this.budgets.get(metric.name)
    if (budget && metric.value > budget.threshold) {
      console.warn(
        `Performance budget exceeded for ${metric.name}: ${metric.value}${metric.unit} > ${budget.threshold}${budget.unit}`,
      )

      // Send alert to monitoring service
      this.sendAlert({
        type: 'budget_exceeded',
        metric: metric.name,
        value: metric.value,
        threshold: budget.threshold,
        timestamp: metric.timestamp,
      })
    }
  }

  /**
   * Track API call performance
   */
  async trackApiCall<T>(endpoint: string, apiCall: () => Promise<T>): Promise<T> {
    const startTime = performance.now()
    const startMemory = this.getMemoryUsage()

    try {
      const result = await apiCall()
      const duration = performance.now() - startTime

      this.recordMetric({
        name: 'api.call',
        value: duration,
        unit: 'ms',
        timestamp: Date.now(),
        metadata: {
          endpoint,
          status: 'success',
          memoryDelta: this.getMemoryUsage() - startMemory,
        },
      })

      return result
    } catch (error) {
      const duration = performance.now() - startTime

      this.recordMetric({
        name: 'api.call',
        value: duration,
        unit: 'ms',
        timestamp: Date.now(),
        metadata: {
          endpoint,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      })

      throw error
    }
  }

  /**
   * Track database query performance
   */
  async trackDbQuery<T>(query: string, operation: () => Promise<T>): Promise<T> {
    const startTime = performance.now()

    try {
      const result = await operation()
      const duration = performance.now() - startTime

      this.recordMetric({
        name: 'db.query',
        value: duration,
        unit: 'ms',
        timestamp: Date.now(),
        metadata: {
          query: query.substring(0, 100), // Truncate long queries
          status: 'success',
        },
      })

      return result
    } catch (error) {
      const duration = performance.now() - startTime

      this.recordMetric({
        name: 'db.query',
        value: duration,
        unit: 'ms',
        timestamp: Date.now(),
        metadata: {
          query: query.substring(0, 100),
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      })

      throw error
    }
  }

  /**
   * Get memory usage (if available)
   */
  private getMemoryUsage(): number {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      return (performance as any).memory.usedJSHeapSize
    }
    return 0
  }

  /**
   * Get current memory metrics
   */
  getMemoryMetrics() {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        usagePercent: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
      }
    }
    return null
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(filter?: { name?: string; since?: number }) {
    let filtered = this.metrics

    if (filter?.name) {
      filtered = filtered.filter((m) => m.name === filter.name)
    }

    if (filter?.since !== undefined) {
      filtered = filtered.filter((m) => m.timestamp >= filter.since!)
    }

    return filtered
  }

  /**
   * Get metric statistics
   */
  getStats(metricName: string) {
    const metrics = this.getMetrics({ name: metricName })

    if (metrics.length === 0) {
      return null
    }

    const values = metrics.map((m) => m.value)
    const sorted = [...values].sort((a, b) => a - b)

    return {
      count: metrics.length,
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
    }
  }

  /**
   * Send alert to monitoring service
   */
  private async sendAlert(alert: Record<string, unknown>) {
    try {
      await fetch('/api/monitoring/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert),
      })
    } catch (error) {
      console.error('Failed to send performance alert', error)
    }
  }

  /**
   * Export metrics for analytics
   */
  async exportMetrics() {
    const metrics = this.getMetrics()
    const memoryMetrics = this.getMemoryMetrics()

    try {
      await fetch('/api/monitoring/vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrics,
          memory: memoryMetrics,
          timestamp: Date.now(),
        }),
      })
    } catch (error) {
      console.error('Failed to export metrics', error)
    }
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics = []
  }

  /**
   * Cleanup observers
   */
  destroy() {
    this.observers.forEach((observer) => observer.disconnect())
    this.observers = []
    this.metrics = []
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor()

// Set default performance budgets
performanceMonitor.setBudget('api.call', 1000, 'ms')
performanceMonitor.setBudget('db.query', 500, 'ms')
performanceMonitor.setBudget('navigation.loadComplete', 3000, 'ms')

// Export metrics every 30 seconds
if (typeof window !== 'undefined') {
  setInterval(() => {
    performanceMonitor.exportMetrics()
  }, 30000)
}
