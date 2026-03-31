import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatDate, formatCurrency, type CSVColumn } from '@/lib/export/csv-generator'
import type { Prisma } from '@prisma/client'

type UserRow = {
  email: string
  name: string | null
  role: string
  phone: string | null
  orderCount: number
  totalSpent: number
  avgOrderValue: number
  lastOrderDate: string | null
  createdAt: Date
}

const ALL_COLUMNS: CSVColumn<UserRow>[] = [
  { key: 'email', header: 'Email' },
  { key: 'name', header: 'Name' },
  { key: 'role', header: 'Role' },
  { key: 'phone', header: 'Phone' },
  { key: 'orderCount', header: 'Order Count' },
  {
    key: 'totalSpent',
    header: 'Total Spent (USD)',
    transform: (row) => formatCurrency(row.totalSpent),
  },
  {
    key: 'avgOrderValue',
    header: 'Avg Order Value',
    transform: (row) => formatCurrency(row.avgOrderValue),
  },
  { key: 'lastOrderDate', header: 'Last Order Date' },
  {
    key: 'createdAt',
    header: 'Registered At',
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
    const role = searchParams.get('role') || undefined
    const dateFrom = searchParams.get('dateFrom') || undefined
    const dateTo = searchParams.get('dateTo') || undefined
    const columnsParam = searchParams.get('columns')

    const selectedColumns = columnsParam ? columnsParam.split(',') : undefined

    const where: Prisma.UserWhereInput = {}

    if (role && role !== 'all') {
      where.role = role as 'USER' | 'ADMIN' | 'SUPERADMIN'
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
          const totalCount = await prisma.user.count({ where })
          const totalBatches = Math.ceil(totalCount / batchSize)

          for (let batch = 0; batch < totalBatches; batch++) {
            const offset = batch * batchSize

            const users = await prisma.user.findMany({
              where,
              orderBy: { createdAt: 'desc' },
              skip: offset,
              take: batchSize,
              select: {
                id: true,
                email: true,
                name: true,
                role: true,
                phone: true,
                createdAt: true,
                orders: {
                  where: { paymentStatus: 'SUCCEEDED' },
                  select: { total: true, createdAt: true },
                  orderBy: { createdAt: 'desc' },
                },
              },
            })

            const rows: UserRow[] = users.map((user) => {
              const orderCount = user.orders.length
              const totalSpent = user.orders.reduce((s, o) => s + o.total, 0)
              const avgOrderValue = orderCount > 0 ? Math.round(totalSpent / orderCount) : 0
              const lastOrderDate = user.orders[0] ? formatDate(user.orders[0].createdAt) : null
              return {
                email: user.email,
                name: user.name,
                role: user.role,
                phone: user.phone,
                orderCount,
                totalSpent,
                avgOrderValue,
                lastOrderDate,
                createdAt: user.createdAt,
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

    const filename = `users-export-${new Date().toISOString().slice(0, 10)}.csv`

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (error) {
    console.error('Error exporting users:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to export users' },
      { status: 500 },
    )
  }
}
