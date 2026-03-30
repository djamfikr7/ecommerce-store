// GET /api/orders/[id]/invoice - Generate and return invoice PDF
import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { getInvoicePDF, generateInvoice } from '@/lib/db-actions/invoices'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: orderId } = await params

    // Get session for authentication
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify order ownership or admin access
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        userId: true,
        orderNumber: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Check ownership or admin
    const isAdmin = session.user.role === 'admin'
    const isOwner = order.userId === session.user.id

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Check if PDF format is requested
    const acceptHeader = request.headers.get('accept')
    const wantsPdf = acceptHeader?.includes('application/pdf')

    if (wantsPdf) {
      // Generate PDF
      const pdfBuffer = await getInvoicePDF(orderId)

      if (!pdfBuffer) {
        return NextResponse.json(
          { error: 'Failed to generate invoice' },
          { status: 500 }
        )
      }

      // Return PDF
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="invoice-${order.orderNumber}.pdf"`,
          'Content-Length': pdfBuffer.length.toString(),
        },
      })
    }

    // Return JSON invoice data
    const invoiceData = await generateInvoice(orderId)

    if (!invoiceData) {
      return NextResponse.json(
        { error: 'Failed to generate invoice data' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: invoiceData,
    })
  } catch (error) {
    console.error('Error generating invoice:', error)
    return NextResponse.json(
      { error: 'Failed to generate invoice' },
      { status: 500 }
    )
  }
}
