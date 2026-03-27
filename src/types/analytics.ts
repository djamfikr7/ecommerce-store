// Analytics types

export type AnalyticsEventType =
  | 'page_view'
  | 'product_view'
  | 'search'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'checkout_step'
  | 'purchase'
  | 'affiliate_click'
  | 'sign_up'
  | 'login'
  | 'custom_event'

export interface AnalyticsEvent {
  id: string
  eventId: string
  type: AnalyticsEventType
  userId?: string
  sessionId?: string
  productId?: string
  orderId?: string
  metadata?: Record<string, unknown>
  timestamp: Date
}

export interface AnalyticsEventData {
  eventId?: string
  type: AnalyticsEventType
  userId?: string
  sessionId?: string
  productId?: string
  orderId?: string
  metadata?: Record<string, unknown>
}

export type AnalyticsPeriod = '7d' | '30d' | '90d'

export interface AnalyticsSummary {
  totalRevenue: number
  totalOrders: number
  totalVisitors: number
  pageViews: number
  conversionRate: number
  averageOrderValue: number
}

export interface TopProduct {
  productId: string
  views: number
  revenue?: number
}

export interface TrafficSource {
  source: string
  visits: number
  percentage: number
}

export interface ConversionFunnel {
  visitors: number
  productViews: number
  addToCart: number
  checkoutStarted: number
  purchases: number
  abandonmentRate: number
}

export interface DailyData {
  date: string
  pageViews: number
  uniqueVisitors: number
  revenue: number
}

export interface AnalyticsDashboard {
  period: AnalyticsPeriod
  startDate: Date
  endDate: Date
  summary: AnalyticsSummary
  topProducts: TopProduct[]
  trafficSources: TrafficSource[]
  conversionFunnel: ConversionFunnel
  dailyData: DailyData[]
}

export interface VitalMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  id: string
  timestamp: number
  url: string
  userAgent?: string
}

export interface WebVitalScore {
  lcp: number
  fid: number
  cls: number
  fcp: number
  ttfb: number
  inp: number
  overall: number
}

export interface SessionData {
  id: string
  userId?: string
  startedAt: Date
  lastActivity: Date
  pageViews: number
  deviceType?: string
  browser?: string
  os?: string
}

export type ReportFormat = 'csv' | 'json' | 'pdf'

export interface AnalyticsReport {
  id: string
  name: string
  type: 'summary' | 'sales' | 'traffic' | 'conversion' | 'products'
  period: AnalyticsPeriod
  format: ReportFormat
  createdAt: Date
  downloadUrl?: string
}

// Rate limiting types
export interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
}

export interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}
