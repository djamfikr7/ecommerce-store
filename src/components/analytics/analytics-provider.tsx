'use client'

import { useEffect, useRef } from 'react'
import { initWebVitals, trackEvent } from '@/lib/analytics/client'

interface AnalyticsProviderProps {
  children: React.ReactNode
  trackPageViews?: boolean
}

export function AnalyticsProvider({
  children,
  trackPageViews = true
}: AnalyticsProviderProps) {
  const initialized = useRef(false)

  useEffect(() => {
    // Prevent double initialization in StrictMode
    if (initialized.current) return
    initialized.current = true

    // Initialize Web Vitals tracking (non-blocking)
    initWebVitals()

    // Track initial page view
    if (trackPageViews) {
      trackEvent('page_view', {
        page: window.location.pathname,
        referrer: document.referrer || 'direct',
      })
    }

    // Track route changes (for Next.js App Router)
    const handleRouteChange = () => {
      if (trackPageViews) {
        trackEvent('page_view', {
          page: window.location.pathname,
        })
      }
    }

    // Listen for popstate events (browser back/forward)
    window.addEventListener('popstate', handleRouteChange)

    // Cleanup
    return () => {
      window.removeEventListener('popstate', handleRouteChange)
    }
  }, [trackPageViews])

  return (
    <>
      {children}
    </>
  )
}

// Lazy-loaded analytics for better performance
export function withAnalytics<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options?: { trackPageViews?: boolean }
) {
  return function AnalyticsWrapper(props: P) {
    return (
      <AnalyticsProvider {...options}>
        <WrappedComponent {...props} />
      </AnalyticsProvider>
    )
  }
}

export default AnalyticsProvider
