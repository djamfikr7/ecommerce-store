import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { adminUpdateInventory } from '@/lib/db-actions/admin/products'
import { validateUpdateInventory } from '@/lib/validators/admin'

interface RouteParams {
  params: Promise<{ id: string }>
}

// PATCH /api/admin/products/[id]/inventory - Update inventory
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    // Verify admin session
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validated = validateUpdateInventory(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: validated.error.errors[0].message },
        { status: 400 }
      )
    }

    // Get IP address for audit log
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : undefined

    const variant = await adminUpdateInventory(
      id,
      validated.data.quantity,
      validated.data.reason,
      session.user.id,
      ip
    )

    return NextResponse.json({
      success: true,
      data: variant,
    })
  } catch (error) {
    console.error('Error updating inventory:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to update inventory' },
      { status: 500 }
    )
  }
}
