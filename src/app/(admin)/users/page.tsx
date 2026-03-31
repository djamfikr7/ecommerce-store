'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { UserTable, UserListItem } from '@/components/admin/user-table'

type UserRole = 'USER' | 'ADMIN' | 'SUPERADMIN'

interface UsersResponse {
  success: boolean
  data: {
    users: UserListItem[]
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

export default function UsersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [users, setUsers] = useState<UserListItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1)
  const [pageSize] = useState(20)
  const [totalPages, setTotalPages] = useState(0)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [role, setRole] = useState(searchParams.get('role') || 'all')
  const [sort, setSort] = useState(searchParams.get('sort') || 'createdAt')
  const [order, setOrder] = useState<'asc' | 'desc'>(
    (searchParams.get('order') as 'asc' | 'desc') || 'desc',
  )
  const [isLoading, setIsLoading] = useState(true)

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        sort,
        order,
      })
      if (search) params.set('search', search)
      if (role !== 'all') params.set('role', role)

      const res = await fetch(`/api/admin/users?${params}`)
      const data: UsersResponse = await res.json()

      if (data.success) {
        setUsers(data.data.users)
        setTotal(data.data.total)
        setTotalPages(data.data.totalPages)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setIsLoading(false)
    }
  }, [page, pageSize, search, role, sort, order])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Sync URL params
  useEffect(() => {
    const params = new URLSearchParams()
    if (page > 1) params.set('page', String(page))
    if (search) params.set('search', search)
    if (role !== 'all') params.set('role', role)
    if (sort !== 'createdAt') params.set('sort', sort)
    if (order !== 'desc') params.set('order', order)

    const qs = params.toString()
    router.replace(`/admin/users${qs ? `?${qs}` : ''}`, { scroll: false })
  }, [page, search, role, sort, order, router])

  const handleSearch = (query: string) => {
    setSearch(query)
    setPage(1)
  }

  const handleRoleFilter = (newRole: string) => {
    setRole(newRole)
    setPage(1)
  }

  const handleSort = (field: string, newOrder: 'asc' | 'desc') => {
    setSort(field)
    setOrder(newOrder)
    setPage(1)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleRoleChange = async (ids: string[], newRole: UserRole) => {
    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/admin/users/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: newRole }),
          }),
        ),
      )
      fetchUsers()
    } catch (error) {
      console.error('Failed to update role:', error)
    }
  }

  const handleDelete = async (ids: string[]) => {
    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/admin/users/${id}`, {
            method: 'DELETE',
          }),
        ),
      )
      fetchUsers()
    } catch (error) {
      console.error('Failed to delete users:', error)
    }
  }

  const handleExport = (ids: string[]) => {
    const exportUsers = users.filter((u) => ids.includes(u.id))
    const csv = [
      ['Name', 'Email', 'Role', 'Orders', 'Total Spent', 'Joined'].join(','),
      ...exportUsers.map((u) =>
        [
          u.name || 'Unnamed',
          u.email,
          u.role,
          u.orderCount,
          (u.totalSpent / 100).toFixed(2),
          new Date(u.createdAt).toLocaleDateString(),
        ].join(','),
      ),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white lg:text-3xl">Users</h1>
        <p className="mt-1 text-slate-400">
          {isLoading ? 'Loading...' : `${total} user${total !== 1 ? 's' : ''} found`}
        </p>
      </div>

      <UserTable
        users={users}
        total={total}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        onSearch={handleSearch}
        onRoleFilter={handleRoleFilter}
        onSort={handleSort}
        onPageChange={handlePageChange}
        onRoleChange={handleRoleChange}
        onDelete={handleDelete}
        onExport={handleExport}
        currentSearch={search}
        currentRole={role}
        currentSort={sort}
        currentOrder={order}
        isLoading={isLoading}
      />
    </div>
  )
}
