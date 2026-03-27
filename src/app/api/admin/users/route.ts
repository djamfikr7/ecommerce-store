import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { adminGetUsers } from '@/lib/db-actions/admin/users'
import { validateAdminUserList } from '@/lib/validators/admin'

// GET /api/admin/users - List users
export async function GET(request: NextRequest) {
  try {
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

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const params = {
      page: searchParams.get('page') || '1',
      pageSize: searchParams.get('pageSize') || '20',
      role: searchParams.get('role') || undefined,
      search: searchParams.get('search') || undefined,
      sort: searchParams.get('sort') || 'createdAt',
      order: searchParams.get('order') || 'desc',
    }

    const validated = validateAdminUserList(params)
    if (!validated.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: validated.error.errors[0].message },
        { status: 400 }
      )
    }

    const result = await adminGetUsers(validated.data)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
