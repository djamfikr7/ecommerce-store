import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  generatePDFReport,
  type PDFReportOptions,
  type PDFChartConfig,
} from '@/lib/export/pdf-generator'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 },
      )
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Admin access required' },
        { status: 403 },
      )
    }

    const searchParams = request.nextUrl.searchParams
    const format = searchParams.get('format') || 'pdf'
    const startDate =
      searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const endDate = searchParams.get('endDate') || new Date().toISOString()

    const start = new Date(startDate)
    const end = new Date(endDate)

    const [orders, refundedOrders] = await Promise.all([
      prisma.order.findMany({
        where: {
          createdAt: { gte: start, lte: end },
          paymentStatus: 'SUCCEEDED',
        },
        include: {
          items: {
            select: {
              productId: true,
              productName: true,
              quantity: true,
              total: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.order.findMany({
        where: {
          createdAt: { gte: start, lte: end },
          paymentStatus: { in: ['REFUNDED', 'PARTIALLY_REFUNDED'] },
        },
        select: { total: true },
      }),
    ])

    const totalRevenue = orders.reduce((s, o) => s + o.total, 0)
    const totalOrders = orders.length
    const totalRefunded = refundedOrders.reduce((s, o) => s + o.total, 0)
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0
    const uniqueCustomers = new Set(orders.map((o) => o.userId).filter(Boolean)).size

    const dailyRevenueMap = new Map<string, { revenue: number; orderCount: number }>()
    for (const order of orders) {
      const dateKey = order.createdAt.toISOString().slice(0, 10)
      const existing = dailyRevenueMap.get(dateKey)
      if (existing) {
        existing.revenue += order.total
        existing.orderCount += 1
      } else {
        dailyRevenueMap.set(dateKey, { revenue: order.total, orderCount: 1 })
      }
    }

    const revenueByDay: { date: string; revenue: number; orderCount: number }[] = []
    const current = new Date(start)
    while (current <= end) {
      const dateStr = current.toISOString().slice(0, 10)
      const data = dailyRevenueMap.get(dateStr) || { revenue: 0, orderCount: 0 }
      revenueByDay.push({ date: dateStr, ...data })
      current.setDate(current.getDate() + 1)
    }

    const productRevenueMap = new Map<string, { name: string; revenue: number; quantity: number }>()
    for (const order of orders) {
      for (const item of order.items) {
        const existing = productRevenueMap.get(item.productId)
        if (existing) {
          existing.revenue += item.total
          existing.quantity += item.quantity
        } else {
          productRevenueMap.set(item.productId, {
            name: item.productName,
            revenue: item.total,
            quantity: item.quantity,
          })
        }
      }
    }

    const topProducts = Array.from(productRevenueMap.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    if (format === 'csv') {
      const { generateCSV } = await import('@/lib/export/csv-generator')
      const csvData = revenueByDay.map((d) => ({
        date: d.date,
        revenue: (d.revenue / 100).toFixed(2),
        orderCount: String(d.orderCount),
      }))
      const csv = generateCSV(csvData, [
        { key: 'date', header: 'Date' },
        { key: 'revenue', header: 'Revenue (USD)' },
        { key: 'orderCount', header: 'Orders' },
      ])

      const filename = `revenue-report-${start.toISOString().slice(0, 10)}-to-${end.toISOString().slice(0, 10)}.csv`
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      })
    }

    const revenueLabels =
      revenueByDay.length > 60
        ? revenueByDay
            .filter((_, i) => i % Math.ceil(revenueByDay.length / 30) === 0)
            .map((d) => d.date.slice(5))
        : revenueByDay.map((d) => d.date.slice(5))
    const revenueValues =
      revenueByDay.length > 60
        ? revenueByDay
            .filter((_, i) => i % Math.ceil(revenueByDay.length / 30) === 0)
            .map((d) => d.revenue / 100)
        : revenueByDay.map((d) => d.revenue / 100)

    const reportOptions: PDFReportOptions = {
      title: 'Revenue Report',
      subtitle: 'Comprehensive revenue analysis',
      dateRange: {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      },
      generatedBy: session.user.name || session.user.email,
      sections: [
        {
          type: 'summary',
          summaryItems: [
            { label: 'Total Revenue', value: `$${(totalRevenue / 100).toFixed(2)}` },
            { label: 'Total Orders', value: String(totalOrders) },
            { label: 'Avg Order Value', value: `$${(avgOrderValue / 100).toFixed(2)}` },
            { label: 'Unique Customers', value: String(uniqueCustomers) },
            { label: 'Total Refunded', value: `$${(totalRefunded / 100).toFixed(2)}` },
            {
              label: 'Net Revenue',
              value: `$${((totalRevenue - totalRefunded) / 100).toFixed(2)}`,
            },
          ],
        },
        {
          title: 'Revenue Over Time',
          type: 'chart',
          chartConfig: {
            type: 'line',
            title: 'Daily Revenue (USD)',
            labels: revenueLabels,
            values: revenueValues,
          } as PDFChartConfig,
        },
        {
          title: 'Orders Over Time',
          type: 'chart',
          chartConfig: {
            type: 'bar',
            title: 'Daily Orders',
            labels: revenueLabels,
            values:
              revenueByDay.length > 60
                ? revenueByDay
                    .filter((_, i) => i % Math.ceil(revenueByDay.length / 30) === 0)
                    .map((d) => d.orderCount)
                : revenueByDay.map((d) => d.orderCount),
          } as PDFChartConfig,
        },
        {
          title: 'Top Products by Revenue',
          type: 'table',
          data: {
            headers: ['Product', 'Quantity Sold', 'Revenue'],
            rows: topProducts.map((p) => [
              p.name,
              String(p.quantity),
              `$${(p.revenue / 100).toFixed(2)}`,
            ]),
            totals: [
              'Total',
              String(topProducts.reduce((s, p) => s + p.quantity, 0)),
              `$${(topProducts.reduce((s, p) => s + p.revenue, 0) / 100).toFixed(2)}`,
            ],
          },
        },
        {
          title: 'Top Products Distribution',
          type: 'chart',
          chartConfig: {
            type: 'pie',
            title: 'Revenue by Product',
            labels: topProducts
              .slice(0, 8)
              .map((p) => (p.name.length > 20 ? p.name.slice(0, 20) + '...' : p.name)),
            values: topProducts.slice(0, 8).map((p) => p.revenue / 100),
          } as PDFChartConfig,
        },
        {
          title: 'Daily Breakdown',
          type: 'table',
          data: {
            headers: ['Date', 'Orders', 'Revenue'],
            rows: revenueByDay.map((d) => [
              d.date,
              String(d.orderCount),
              `$${(d.revenue / 100).toFixed(2)}`,
            ]),
            totals: [
              'Total',
              String(revenueByDay.reduce((s, d) => s + d.orderCount, 0)),
              `$${(revenueByDay.reduce((s, d) => s + d.revenue, 0) / 100).toFixed(2)}`,
            ],
          },
        },
      ],
    }

    const pdfBuffer = await generatePDFReport(reportOptions)

    const filename = `revenue-report-${start.toISOString().slice(0, 10)}-to-${end.toISOString().slice(0, 10)}.pdf`

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(pdfBuffer.length),
      },
    })
  } catch (error) {
    console.error('Error generating revenue report:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to generate revenue report' },
      { status: 500 },
    )
  }
}
