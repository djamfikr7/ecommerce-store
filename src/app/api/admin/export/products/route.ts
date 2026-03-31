import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatDate, formatCurrency, type CSVColumn } from '@/lib/export/csv-generator'
import type { Prisma } from '@prisma/client'

type ProductRow = {
  name: string
  sku: string
  category: string | null
  price: number
  compareAtPrice: number | null
  costPrice: number | null
  stockQuantity: number
  lowStockThreshold: number
  isActive: boolean
  isFeatured: boolean
  variantsCount: number
  totalSold: number
  createdAt: Date
  updatedAt: Date
}

const ALL_COLUMNS: CSVColumn<ProductRow>[] = [
  { key: 'name', header: 'Product Name' },
  { key: 'sku', header: 'SKU' },
  { key: 'category', header: 'Category' },
  {
    key: 'price',
    header: 'Price (USD)',
    transform: (row) => formatCurrency(row.price),
  },
  {
    key: 'compareAtPrice',
    header: 'Compare At Price',
    transform: (row) => (row.compareAtPrice != null ? formatCurrency(row.compareAtPrice) : ''),
  },
  {
    key: 'costPrice',
    header: 'Cost Price',
    transform: (row) => (row.costPrice != null ? formatCurrency(row.costPrice) : ''),
  },
  { key: 'stockQuantity', header: 'Stock Quantity' },
  { key: 'lowStockThreshold', header: 'Low Stock Threshold' },
  {
    key: 'isActive',
    header: 'Active',
    transform: (row) => (row.isActive ? 'Yes' : 'No'),
  },
  {
    key: 'isFeatured',
    header: 'Featured',
    transform: (row) => (row.isFeatured ? 'Yes' : 'No'),
  },
  { key: 'variantsCount', header: 'Variants Count' },
  { key: 'totalSold', header: 'Total Sold' },
  {
    key: 'createdAt',
    header: 'Created At',
    transform: (row) => formatDate(row.createdAt),
  },
  {
    key: 'updatedAt',
    header: 'Updated At',
    transform: (row) => formatDate(row.updatedAt),
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
    const category = searchParams.get('category') || undefined
    const status = searchParams.get('status') || 'all'
    const dateFrom = searchParams.get('dateFrom') || undefined
    const dateTo = searchParams.get('dateTo') || undefined
    const columnsParam = searchParams.get('columns')

    const selectedColumns = columnsParam ? columnsParam.split(',') : undefined

    const where: Prisma.ProductWhereInput = {}

    if (status === 'active') {
      where.isActive = true
    } else if (status === 'inactive') {
      where.isActive = false
    }

    if (category) {
      where.category = { slug: category }
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
          const totalCount = await prisma.product.count({ where })
          const totalBatches = Math.ceil(totalCount / batchSize)

          for (let batch = 0; batch < totalBatches; batch++) {
            const offset = batch * batchSize

            const products = await prisma.product.findMany({
              where,
              orderBy: { createdAt: 'desc' },
              skip: offset,
              take: batchSize,
              include: {
                category: { select: { name: true } },
                variants: { select: { id: true } },
                orderItems: {
                  where: { order: { paymentStatus: 'SUCCEEDED' } },
                  select: { quantity: true },
                },
              },
            })

            const rows: ProductRow[] = products.map((product) => ({
              name: product.name,
              sku: product.sku,
              category: product.category?.name ?? null,
              price: product.price,
              compareAtPrice: product.compareAtPrice,
              costPrice: product.costPrice,
              stockQuantity: product.stockQuantity,
              lowStockThreshold: product.lowStockThreshold,
              isActive: product.isActive,
              isFeatured: product.isFeatured,
              variantsCount: product.variants.length,
              totalSold: product.orderItems.reduce((s, i) => s + i.quantity, 0),
              createdAt: product.createdAt,
              updatedAt: product.updatedAt,
            }))

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

    const filename = `products-export-${new Date().toISOString().slice(0, 10)}.csv`

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (error) {
    console.error('Error exporting products:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to export products' },
      { status: 500 },
    )
  }
}
