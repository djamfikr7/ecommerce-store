import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

import { adminGetUserById, adminUpdateUserRole } from '@/lib/db-actions/admin/users'
import { validateUpdateUserRole } from '@/lib/validators/admin'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/admin/users/[id] - Get single user
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    // Verify admin session
    const session = await auth()

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

    const user = await adminGetUserById(id)

    if (!user) {
      return NextResponse.json(
        { error: 'Not Found', message: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: user,
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/users/[id] - Update user (role)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    // Verify admin session
    const session = await auth()

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

    // Only SUPERADMIN can update roles
    if (session.user.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Only super admins can update user roles' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validated = validateUpdateUserRole(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: validated.error.errors[0].message },
        { status: 400 }
      )
    }

    const user = await adminUpdateUserRole(id, validated.data.role, session.user.id)

    return NextResponse.json({
      success: true,
      data: user,
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to update user' },
      { status: 500 }
    )
  }
}
