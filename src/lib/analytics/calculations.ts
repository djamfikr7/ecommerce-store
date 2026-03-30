import {
  startOfDay,
  startOfWeek,
  startOfMonth,
  endOfDay,
  endOfWeek,
  endOfMonth,
  subDays,
  subWeeks,
  subMonths,
  format,
} from 'date-fns'

export interface Order {
  id: string
  createdAt: Date
  total: number
  status: string
  userId: string
  items: OrderItem[]
  currency: string
  country?: string
  source?: string
}

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
}

export interface RevenueData {
  date: string
  revenue: number
  orders: number
  avgOrderValue: number
}

export interface SalesData {
  date: string
  sales: number
  previousPeriod: number
  change: number
}

export interface TopProduct {
  id: string
  name: string
  revenue: number
  quantity: number
  orders: number
}

export interface CustomerInsight {
  totalCustomers: number
  newCustomers: number
  returningCustomers: number
  avgLifetimeValue: number
  avgOrdersPerCustomer: number
}

export interface ConversionFunnelData {
  stage: string
  count: number
  percentage: number
}

export interface GeographicData {
  country: string
  revenue: number
  orders: number
}

export interface TrafficSource {
  source: string
  visits: number
  conversions: number
  revenue: number
  conversionRate: number
}

export type DateRange = 'today' | 'week' | 'month' | 'custom'
export type Granularity = 'daily' | 'weekly' | 'monthly'

export function getDateRangeBounds(range: DateRange, customStart?: Date, customEnd?: Date) {
  const now = new Date()

  switch (range) {
    case 'today':
      return { start: startOfDay(now), end: endOfDay(now) }
    case 'week':
      return { start: startOfWeek(now), end: endOfWeek(now) }
    case 'month':
      return { start: startOfMonth(now), end: endOfMonth(now) }
    case 'custom':
      return {
        start: customStart || startOfMonth(now),
        end: customEnd || endOfMonth(now),
      }
    default:
      return { start: startOfMonth(now), end: endOfMonth(now) }
  }
}

export function calculateRevenueData(
  orders: Order[],
  granularity: Granularity = 'daily',
): RevenueData[] {
  const groupedData = new Map<string, { revenue: number; orders: number }>()

  orders.forEach((order) => {
    if (order.status !== 'completed' && order.status !== 'paid') return

    let key: string
    const date = new Date(order.createdAt)

    switch (granularity) {
      case 'daily':
        key = format(date, 'yyyy-MM-dd')
        break
      case 'weekly':
        key = format(startOfWeek(date), 'yyyy-MM-dd')
        break
      case 'monthly':
        key = format(startOfMonth(date), 'yyyy-MM')
        break
      default:
        key = format(date, 'yyyy-MM-dd')
    }

    const existing = groupedData.get(key) || { revenue: 0, orders: 0 }
    groupedData.set(key, {
      revenue: existing.revenue + order.total,
      orders: existing.orders + 1,
    })
  })

  return Array.from(groupedData.entries())
    .map(([date, data]) => ({
      date,
      revenue: data.revenue,
      orders: data.orders,
      avgOrderValue: data.revenue / data.orders,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export function calculateSalesComparison(
  currentOrders: Order[],
  previousOrders: Order[],
  granularity: Granularity = 'daily',
): SalesData[] {
  const currentData = calculateRevenueData(currentOrders, granularity)
  const previousData = calculateRevenueData(previousOrders, granularity)

  const previousMap = new Map(previousData.map((d) => [d.date, d.revenue]))

  return currentData.map((current) => {
    const previous = previousMap.get(current.date) || 0
    const change = previous > 0 ? ((current.revenue - previous) / previous) * 100 : 0

    return {
      date: current.date,
      sales: current.revenue,
      previousPeriod: previous,
      change,
    }
  })
}

export function calculateTopProducts(orders: Order[], limit: number = 10): TopProduct[] {
  const productMap = new Map<
    string,
    { name: string; revenue: number; quantity: number; orders: Set<string> }
  >()

  orders.forEach((order) => {
    if (order.status !== 'completed' && order.status !== 'paid') return

    order.items.forEach((item) => {
      const existing = productMap.get(item.productId) || {
        name: item.productName,
        revenue: 0,
        quantity: 0,
        orders: new Set<string>(),
      }

      existing.revenue += item.price * item.quantity
      existing.quantity += item.quantity
      existing.orders.add(order.id)

      productMap.set(item.productId, existing)
    })
  })

  return Array.from(productMap.entries())
    .map(([id, data]) => ({
      id,
      name: data.name,
      revenue: data.revenue,
      quantity: data.quantity,
      orders: data.orders.size,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit)
}

export function calculateCustomerInsights(
  orders: Order[],
  previousPeriodOrders: Order[],
): CustomerInsight {
  const currentCustomers = new Set(orders.map((o) => o.userId))
  const previousCustomers = new Set(previousPeriodOrders.map((o) => o.userId))

  const newCustomers = Array.from(currentCustomers).filter(
    (id) => !previousCustomers.has(id),
  ).length

  const returningCustomers = Array.from(currentCustomers).filter((id) =>
    previousCustomers.has(id),
  ).length

  const customerOrderMap = new Map<string, { orders: number; revenue: number }>()

  orders.forEach((order) => {
    if (order.status !== 'completed' && order.status !== 'paid') return

    const existing = customerOrderMap.get(order.userId) || { orders: 0, revenue: 0 }
    existing.orders += 1
    existing.revenue += order.total
    customerOrderMap.set(order.userId, existing)
  })

  const totalRevenue = Array.from(customerOrderMap.values()).reduce(
    (sum, data) => sum + data.revenue,
    0,
  )

  const totalOrders = Array.from(customerOrderMap.values()).reduce(
    (sum, data) => sum + data.orders,
    0,
  )

  return {
    totalCustomers: currentCustomers.size,
    newCustomers,
    returningCustomers,
    avgLifetimeValue: currentCustomers.size > 0 ? totalRevenue / currentCustomers.size : 0,
    avgOrdersPerCustomer: currentCustomers.size > 0 ? totalOrders / currentCustomers.size : 0,
  }
}

export function calculateConversionFunnel(
  views: number,
  addToCarts: number,
  checkouts: number,
  orders: number,
): ConversionFunnelData[] {
  return [
    { stage: 'Product Views', count: views, percentage: 100 },
    {
      stage: 'Add to Cart',
      count: addToCarts,
      percentage: views > 0 ? (addToCarts / views) * 100 : 0,
    },
    { stage: 'Checkout', count: checkouts, percentage: views > 0 ? (checkouts / views) * 100 : 0 },
    { stage: 'Purchase', count: orders, percentage: views > 0 ? (orders / views) * 100 : 0 },
  ]
}

export function calculateGeographicDistribution(orders: Order[]): GeographicData[] {
  const countryMap = new Map<string, { revenue: number; orders: number }>()

  orders.forEach((order) => {
    if (order.status !== 'completed' && order.status !== 'paid') return

    const country = order.country || 'Unknown'
    const existing = countryMap.get(country) || { revenue: 0, orders: 0 }
    existing.revenue += order.total
    existing.orders += 1
    countryMap.set(country, existing)
  })

  return Array.from(countryMap.entries())
    .map(([country, data]) => ({
      country,
      revenue: data.revenue,
      orders: data.orders,
    }))
    .sort((a, b) => b.revenue - a.revenue)
}

export function calculateTrafficSources(orders: Order[]): TrafficSource[] {
  const sourceMap = new Map<string, { visits: number; conversions: number; revenue: number }>()

  orders.forEach((order) => {
    const source = order.source || 'Direct'
    const existing = sourceMap.get(source) || { visits: 0, conversions: 0, revenue: 0 }

    existing.visits += 1
    if (order.status === 'completed' || order.status === 'paid') {
      existing.conversions += 1
      existing.revenue += order.total
    }

    sourceMap.set(source, existing)
  })

  return Array.from(sourceMap.entries())
    .map(([source, data]) => ({
      source,
      visits: data.visits,
      conversions: data.conversions,
      revenue: data.revenue,
      conversionRate: data.visits > 0 ? (data.conversions / data.visits) * 100 : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatPercentage(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
}
