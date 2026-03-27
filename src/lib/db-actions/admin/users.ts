'use server'

import { prisma } from '@/lib/prisma'
import type {
  AdminUserList,
  AdminUserListParams,
  AdminUserDetail,
  AdminUserSummary,
} from '@/types/admin'
import type { UserRole } from '@prisma/client'
import { revalidatePath } from 'next/cache'

/**
 * Get paginated list of users for admin
 */
export async function adminGetUsers(
  params: AdminUserListParams
): Promise<AdminUserList> {
  const {
    page = 1,
    pageSize = 20,
    role,
    search,
    sort = 'createdAt',
    order = 'desc',
  } = params

  const skip = (page - 1) * pageSize

  // Build where clause
  const where: Parameters<typeof prisma.user.findMany>[0]['where'] = {}

  // Role filter
  if (role && role !== 'all') {
    where.role = role as UserRole
  }

  // Search filter
  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } },
    ]
  }

  // Build order by
  const orderBy: Record<string, 'asc' | 'desc'> = {}
  if (sort === 'createdAt') {
    orderBy.createdAt = order
  }

  // Execute queries in parallel
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        createdAt: true,
        orders: {
          where: { paymentStatus: 'SUCCEEDED' },
          select: { total: true },
        },
      },
    }),
    prisma.user.count({ where }),
  ])

  // Format users with aggregated data
  const formattedUsers: AdminUserSummary[] = users.map((user) => {
    const totalSpent = user.orders.reduce((sum, order) => sum + order.total, 0)
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role,
      orderCount: user.orders.length,
      totalSpent,
      createdAt: user.createdAt,
    }
  })

  // Sort by totalSpent or orderCount if needed
  if (sort === 'totalSpent') {
    formattedUsers.sort((a, b) => (order === 'desc' ? b.totalSpent - a.totalSpent : a.totalSpent - b.totalSpent))
  } else if (sort === 'orderCount') {
    formattedUsers.sort((a, b) => (order === 'desc' ? b.orderCount - a.orderCount : a.orderCount - b.orderCount))
  }

  return {
    users: formattedUsers,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

/**
 * Get single user by ID for admin
 */
export async function adminGetUserById(id: string): Promise<AdminUserDetail | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      addresses: {
        orderBy: { createdAt: 'desc' },
      },
      orders: {
        where: { paymentStatus: 'SUCCEEDED' },
        select: {
          id: true,
          total: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!user) {
    return null
  }

  // Calculate aggregated stats
  const totalSpent = user.orders.reduce((sum, order) => sum + order.total, 0)
  const lastOrderAt = user.orders.length > 0 ? user.orders[0].createdAt : null

  return {
    ...user,
    ordersCount: user.orders.length,
    totalSpent,
    lastOrderAt,
  }
}

/**
 * Update user role
 */
export async function adminUpdateUserRole(
  userId: string,
  role: UserRole,
  adminId: string
): Promise<AdminUserDetail> {
  // Get current user for audit
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!currentUser) {
    throw new Error('User not found')
  }

  const oldRole = currentUser.role

  // Update user role in transaction
  const updatedUser = await prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({
      where: { id: userId },
      data: { role },
    })

    // Create audit log
    await tx.adminAuditLog.create({
      data: {
        adminId,
        action: 'UPDATE_USER_ROLE',
        entityType: 'User',
        entityId: userId,
        oldValue: { role: oldRole },
        newValue: { role },
      },
    })

    return updated
  })

  // Fetch complete user data
  const userDetail = await adminGetUserById(updatedUser.id)

  revalidatePath('/admin/users')
  revalidatePath(`/admin/users/${userId}`)

  return userDetail!
}
