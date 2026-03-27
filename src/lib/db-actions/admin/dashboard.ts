'use server'

import { prisma } from '@/lib/prisma'
import type {
  DashboardStats,
  SalesReport,
  SalesReportParams,
  InventoryReportItem,
  RecentOrder,
  SalesChartData,
  TopProduct,
} from '@/types/admin'

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // Execute all queries in parallel
  const [
    todayOrdersResult,
    todayRevenueResult,
    todayVisitorsResult,
    pendingOrdersCount,
    lowStockAlertsCount,
    recentOrders,
    thirtyDayOrders,
    topProductsResult,
  ] = await Promise.all([
    // Today's order count
    prisma.order.count({
      where: {
        createdAt: { gte: today, lt: tomorrow },
      },
    }),

    // Today's revenue (completed orders)
    prisma.order.aggregate({
      where: {
        createdAt: { gte: today, lt: tomorrow },
        paymentStatus: 'SUCCEEDED',
      },
      _sum: { total: true },
    }),

    // Today's visitors (page views)
    prisma.analyticsEvent.count({
      where: {
        createdAt: { gte: today, lt: tomorrow },
        type: 'page_view',
      },
    }),

    // Pending orders count
    prisma.order.count({
      where: {
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    }),

    // Low stock alerts (variants with quantity < 10)
    prisma.productVariant.count({
      where: {
        trackInventory: true,
        stockQuantity: { lt: 10 },
        stockQuantity: { gt: 0 },
      },
    }),

    // Recent orders (last 10)
    getRecentOrders(),

    // Orders for last 30 days for chart
    prisma.order.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        paymentStatus: 'SUCCEEDED',
      },
      select: {
        createdAt: true,
        total: true,
      },
      orderBy: { createdAt: 'asc' },
    }),

    // Top products by order count
    getTopProducts(),
  ])

  // Calculate sales chart data
  const salesChart = calculateSalesChart(thirtyDayOrders)

  return {
    todayRevenue: todayRevenueResult._sum.total || 0,
    todayOrders: todayOrdersResult,
    todayVisitors: todayVisitorsResult,
    pendingOrders: pendingOrdersCount,
    lowStockAlerts: lowStockAlertsCount,
    recentOrders,
    salesChart,
    topProducts: topProductsResult,
  }
}

/**
 * Get recent orders for dashboard
 */
async function getRecentOrders(): Promise<RecentOrder[]> {
  const orders = await prisma.order.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      items: {
        select: { quantity: true },
      },
    },
  })

  return orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    total: order.total,
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    createdAt: order.createdAt,
    user: order.user
      ? { name: order.user.name, email: order.user.email }
      : null,
  }))
}

/**
 * Get top products by order count
 */
async function getTopProducts(limit: number = 5): Promise<TopProduct[]> {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const topProducts = await prisma.orderItem.groupBy({
    by: ['productId'],
    where: {
      order: {
        createdAt: { gte: thirtyDaysAgo },
      },
    },
    _count: { productId: true },
    _sum: { total: true },
    orderBy: { _count: { productId: 'desc' } },
    take: limit,
  })

  const productIds = topProducts.map((p) => p.productId)
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: {
      images: { take: 1, orderBy: { sortOrder: 'asc' } },
    },
  })

  const productMap = new Map(products.map((p) => [p.id, p]))

  return topProducts.map((tp) => {
    const product = productMap.get(tp.productId)
    return {
      id: tp.productId,
      name: product?.name || 'Unknown Product',
      slug: product?.slug || '',
      image: product?.images[0]?.url || null,
      orderCount: tp._count.productId,
      revenue: tp._sum.total || 0,
    }
  })
}

/**
 * Calculate sales chart data from orders
 */
function calculateSalesChart(orders: { createdAt: Date; total: number }[]): SalesChartData[] {
  const chartMap = new Map<string, { revenue: number; orderCount: number }>()

  // Initialize last 30 days with zero values
  for (let i = 29; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().slice(0, 10)
    chartMap.set(dateStr, { revenue: 0, orderCount: 0 })
  }

  // Aggregate orders by day
  for (const order of orders) {
    const dateStr = order.createdAt.toISOString().slice(0, 10)
    const existing = chartMap.get(dateStr)
    if (existing) {
      existing.revenue += order.total
      existing.orderCount += 1
    }
  }

  return Array.from(chartMap.entries()).map(([date, data]) => ({
    date,
    revenue: data.revenue,
    orderCount: data.orderCount,
  }))
}

/**
 * Get sales report with date range and grouping
 */
export async function getSalesReport(params: SalesReportParams): Promise<SalesReport> {
  const { startDate, endDate, groupBy } = params
  const start = new Date(startDate)
  const end = new Date(endDate)

  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: start, lte: end },
      paymentStatus: 'SUCCEEDED',
    },
    include: {
      items: true,
    },
    orderBy: { createdAt: 'asc' },
  })

  // Get refunds in the same period
  const refunds = await prisma.order.findMany({
    where: {
      createdAt: { gte: start, lte: end },
      paymentStatus: { in: ['REFUNDED', 'PARTIALLY_REFUNDED'] },
    },
    select: { total: true, items: { select: { total: true } } },
  })

  const refundAmount = refunds.reduce((sum, order) => sum + order.total, 0)

  // Group data by period
  const groupedData = groupOrdersByPeriod(orders, groupBy, end)

  // Calculate summary
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)
  const totalOrders = orders.length
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0

  return {
    data: groupedData,
    summary: {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      refundAmount,
    },
  }
}

/**
 * Group orders by period (day, week, month)
 */
function groupOrdersByPeriod(
  orders: { createdAt: Date; total: number }[],
  groupBy: 'day' | 'week' | 'month',
  endDate: Date
) {
  const groupMap = new Map<string, { revenue: number; orderCount: number }>()

  // Initialize groups between start and end dates
  const startDate = orders.length > 0 ? orders[0].createdAt : endDate

  for (const order of orders) {
    const period = getPeriodKey(order.createdAt, groupBy)
    const existing = groupMap.get(period)
    if (existing) {
      existing.revenue += order.total
      existing.orderCount += 1
    } else {
      groupMap.set(period, { revenue: order.total, orderCount: 1 })
    }
  }

  return Array.from(groupMap.entries())
    .map(([period, data]) => ({
      period,
      revenue: data.revenue,
      orderCount: data.orderCount,
      avgOrderValue: data.orderCount > 0 ? Math.round(data.revenue / data.orderCount) : 0,
      refundAmount: 0, // TODO: Calculate refunds per period
    }))
    .sort((a, b) => a.period.localeCompare(b.period))
}

/**
 * Get period key for grouping
 */
function getPeriodKey(date: Date, groupBy: 'day' | 'week' | 'month'): string {
  switch (groupBy) {
    case 'day':
      return date.toISOString().slice(0, 10)
    case 'week': {
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      return weekStart.toISOString().slice(0, 10)
    }
    case 'month':
      return date.toISOString().slice(0, 7)
    default:
      return date.toISOString().slice(0, 10)
  }
}

/**
 * Get inventory report for all products
 */
export async function getInventoryReport(): Promise<InventoryReportItem[]> {
  const products = await prisma.product.findMany({
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      variants: {
        select: {
          id: true,
          name: true,
          sku: true,
          stockQuantity: true,
          lowStockThreshold: true,
          price: true,
        },
      },
      orderItems: {
        select: {
          quantity: true,
          total: true,
          order: {
            select: {
              paymentStatus: true,
            },
          },
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  return products.map((product) => {
    const totalStock =
      product.variants.length > 0
        ? product.variants.reduce((sum, v) => sum + v.stockQuantity, 0)
        : product.stockQuantity

    // Calculate sold quantity and revenue from completed orders
    const completedItems = product.orderItems.filter(
      (item) =>
        item.order.paymentStatus === 'SUCCEEDED' ||
        item.order.paymentStatus === 'REFUNDED'
    )
    const soldQuantity = completedItems.reduce((sum, item) => sum + item.quantity, 0)
    const revenue = completedItems.reduce((sum, item) => sum + item.total, 0)

    // Determine stock status
    const isOutOfStock = totalStock === 0
    const isLowStock = !isOutOfStock && totalStock < 10

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      category: product.category,
      variants: product.variants,
      totalStock,
      soldQuantity,
      revenue,
      isLowStock,
      isOutOfStock,
    }
  })
}
