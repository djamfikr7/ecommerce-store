/**
 * Web Vitals Monitoring
 * Tracks Core Web Vitals: LCP, FID, CLS, TTFB, INP
 */

import { onCLS, onLCP, onTTFB, onINP, type Metric } from 'web-vitals'

export interface WebVitalsMetric {
  id: string
  name: 'CLS' | 'LCP' | 'TTFB' | 'INP'
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  navigationType: string
  timestamp: number
}

type VitalsCallback = (metric: WebVitalsMetric) => void

class WebVitalsMonitor {
  private callbacks: VitalsCallback[] = []
  private metrics: Map<string, WebVitalsMetric> = new Map()

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeVitals()
    }
  }

  private initializeVitals() {
    // Largest Contentful Paint (LCP)
    onLCP((metric: Metric) => this.handleMetric(metric))

    // Cumulative Layout Shift (CLS)
    onCLS((metric: Metric) => this.handleMetric(metric))

    // Time to First Byte (TTFB)
    onTTFB((metric: Metric) => this.handleMetric(metric))

    // Interaction to Next Paint (INP)
    onINP((metric: Metric) => this.handleMetric(metric))
  }

  private handleMetric(metric: Metric) {
    const webVitalsMetric: WebVitalsMetric = {
      id: metric.id,
      name: metric.name as WebVitalsMetric['name'],
      value: metric.value,
      rating: metric.rating as WebVitalsMetric['rating'],
      delta: metric.delta,
      navigationType: metric.navigationType,
      timestamp: Date.now(),
    }

    this.metrics.set(metric.name, webVitalsMetric)

    // Notify all callbacks
    this.callbacks.forEach((callback) => callback(webVitalsMetric))

    // Send to analytics
    this.sendToAnalytics(webVitalsMetric)
  }

  /**
   * Subscribe to web vitals updates
   */
  subscribe(callback: VitalsCallback) {
    this.callbacks.push(callback)

    // Return unsubscribe function
    return () => {
      const index = this.callbacks.indexOf(callback)
      if (index > -1) {
        this.callbacks.splice(index, 1)
      }
    }
  }

  /**
   * Get current web vitals
   */
  getVitals() {
    return Array.from(this.metrics.values())
  }

  /**
   * Get specific vital
   */
  getVital(name: WebVitalsMetric['name']) {
    return this.metrics.get(name)
  }

  /**
   * Send metrics to analytics endpoint
   */
  private async sendToAnalytics(metric: WebVitalsMetric) {
    try {
      // Use sendBeacon for reliability (works even when page is unloading)
      const body = JSON.stringify({
        metric,
        url: window.location.href,
        userAgent: navigator.userAgent,
        connection: this.getConnectionInfo(),
      })

      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/monitoring/vitals', body)
      } else {
        // Fallback to fetch
        fetch('/api/monitoring/vitals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
          keepalive: true,
        }).catch((error) => {
          console.error('Failed to send web vitals', error)
        })
      }
    } catch (error) {
      console.error('Failed to send web vitals', error)
    }
  }

  /**
   * Get network connection information
   */
  private getConnectionInfo() {
    if ('connection' in navigator) {
      const conn = (navigator as any).connection
      return {
        effectiveType: conn?.effectiveType,
        downlink: conn?.downlink,
        rtt: conn?.rtt,
        saveData: conn?.saveData,
      }
    }
    return null
  }

  /**
   * Get performance score (0-100)
   */
  getPerformanceScore() {
    const vitals = this.getVitals()
    if (vitals.length === 0) return null

    const scores = vitals.map((vital): number => {
      switch (vital.rating) {
        case 'good':
          return 100
        case 'needs-improvement':
          return 50
        case 'poor':
          return 0
      }
    })

    return Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length)
  }

  /**
   * Check if vitals meet performance targets
   */
  meetsTargets() {
    const vitals = this.getVitals()
    return vitals.every((vital) => vital.rating === 'good')
  }

  /**
   * Get vitals summary
   */
  getSummary() {
    const vitals = this.getVitals()
    const score = this.getPerformanceScore()

    return {
      score,
      meetsTargets: this.meetsTargets(),
      vitals: vitals.reduce(
        (acc, vital) => {
          acc[vital.name] = {
            value: vital.value,
            rating: vital.rating,
          }
          return acc
        },
        {} as Record<string, { value: number; rating: string }>,
      ),
    }
  }
}

// Singleton instance
export const webVitalsMonitor = new WebVitalsMonitor()

// Helper function for easy integration
export function reportWebVitals(callback?: VitalsCallback): (() => void) | undefined {
  if (callback) {
    return webVitalsMonitor.subscribe(callback)
  }
  return undefined
}

// Thresholds for each metric
export const VITALS_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  CLS: { good: 0.1, poor: 0.25 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 },
}
