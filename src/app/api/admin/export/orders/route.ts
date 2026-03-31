import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatDate, formatCurrency, type CSVColumn } from '@/lib/export/csv-generator'
import type { Prisma } from '@prisma/client'

type OrderRow = {
  orderNumber: string
  status: string
  paymentStatus: string
  paymentMethod: string | null
  currency: string
  subtotal: number
  shippingCost: number
  tax: number
  total: number
  itemCount: number
  customerEmail: string | null
  customerName: string | null
  shippingCity: string | null
  shippingCountry: string | null
  createdAt: Date
}

const ALL_COLUMNS: CSVColumn<OrderRow>[] = [
  { key: 'orderNumber', header: 'Order Number' },
  { key: 'status', header: 'Status' },
  { key: 'paymentStatus', header: 'Payment Status' },
  { key: 'paymentMethod', header: 'Payment Method' },
  { key: 'currency', header: 'Currency' },
  {
    key: 'subtotal',
    header: 'Subtotal',
    transform: (row) => formatCurrency(row.subtotal, row.currency),
  },
  {
    key: 'shippingCost',
    header: 'Shipping',
    transform: (row) => formatCurrency(row.shippingCost, row.currency),
  },
  {
    key: 'tax',
    header: 'Tax',
    transform: (row) => formatCurrency(row.tax, row.currency),
  },
  {
    key: 'total',
    header: 'Total',
    transform: (row) => formatCurrency(row.total, row.currency),
  },
  { key: 'itemCount', header: 'Item Count' },
  { key: 'customerEmail', header: 'Customer Email' },
  { key: 'customerName', header: 'Customer Name' },
  { key: 'shippingCity', header: 'Shipping City' },
  { key: 'shippingCountry', header: 'Shipping Country' },
  {
    key: 'createdAt',
    header: 'Created At',
    transform: (row) => formatDate(row.createdAt),
  },
]

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
    const dateFrom = searchParams.get('dateFrom') || undefined
    const dateTo = searchParams.get('dateTo') || undefined
    const status = searchParams.get('status') || undefined
    const columnsParam = searchParams.get('columns')

    const selectedColumns = columnsParam ? columnsParam.split(',') : undefined

    const where: Prisma.OrderWhereInput = {}

    if (status && status !== 'all') {
      where.status = status as
        | 'PENDING'
        | 'CONFIRMED'
        | 'PROCESSING'
        | 'SHIPPED'
        | 'DELIVERED'
        | 'CANCELLED'
        | 'REFUNDED'
    }

    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) where.createdAt.gte = new Date(dateFrom)
      if (dateTo) where.createdAt.lte = new Date(dateTo)
    }

    const columns = ALL_COLUMNS

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()

        try {
          const batchSize = 5000
          const totalCount = await prisma.order.count({ where })
          const totalBatches = Math.ceil(totalCount / batchSize)

          for (let batch = 0; batch < totalBatches; batch++) {
            const offset = batch * batchSize

            const orders = await prisma.order.findMany({
              where,
              orderBy: { createdAt: 'desc' },
              skip: offset,
              take: batchSize,
              include: {
                user: { select: { email: true, name: true } },
                items: { select: { quantity: true } },
              },
            })

            const rows: OrderRow[] = orders.map((order) => {
              const shippingAddr = order.shippingAddress as Record<string, unknown> | null
              return {
                orderNumber: order.orderNumber,
                status: order.status,
                paymentStatus: order.paymentStatus,
                paymentMethod: order.paymentMethod,
                currency: order.currency,
                subtotal: order.subtotal,
                shippingCost: order.shippingCost,
                tax: order.tax,
                total: order.total,
                itemCount: order.items.reduce((s, i) => s + i.quantity, 0),
                customerEmail: order.user?.email ?? null,
                customerName: order.user?.name ?? null,
                shippingCity: (shippingAddr?.city as string) ?? null,
                shippingCountry: (shippingAddr?.country as string) ?? null,
                createdAt: order.createdAt,
              }
            })

            if (batch === 0) {
              const headerLine = columns
                .filter((c) => !selectedColumns || selectedColumns.includes(c.key))
                .map((c) => (c.header.includes(',') ? `"${c.header}"` : c.header))
                .join(',')
              controller.enqueue(encoder.encode(headerLine + '\n'))
            }

            for (const row of rows) {
              const filteredCols = selectedColumns
                ? columns.filter((c) => selectedColumns.includes(c.key))
                : columns
              const line = filteredCols
                .map((col) => {
                  const val = col.transform
                    ? col.transform(row)
                    : String((row as Record<string, unknown>)[col.key] ?? '')
                  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
                    return `"${val.replace(/"/g, '""')}"`
                  }
                  return val
                })
                .join(',')
              controller.enqueue(encoder.encode(line + '\n'))
            }
          }

          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    const filename = `orders-export-${new Date().toISOString().slice(0, 10)}.csv`

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (error) {
    console.error('Error exporting orders:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to export orders' },
      { status: 500 },
    )
  }
}
