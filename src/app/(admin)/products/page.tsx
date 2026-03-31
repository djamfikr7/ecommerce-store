'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ProductTable, type ProductListItem } from '@/components/admin/product-table'
import type { AdminProductListParams } from '@/types/admin'

const PAGE_SIZE = 20

export default function ProductsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [products, setProducts] = useState<ProductListItem[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [status, setStatus] = useState<'active' | 'inactive' | 'all'>(
    (searchParams.get('status') as 'active' | 'inactive' | 'all') || 'all',
  )
  const [sort, setSort] = useState(searchParams.get('sort') || 'createdAt')
  const [order, setOrder] = useState<'asc' | 'desc'>(
    (searchParams.get('order') as 'asc' | 'desc') || 'desc',
  )
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1)

  const categories = [
    { id: '1', name: 'Electronics', slug: 'electronics' },
    { id: '2', name: 'Accessories', slug: 'accessories' },
    { id: '3', name: 'Audio', slug: 'audio' },
    { id: '4', name: 'Wearables', slug: 'wearables' },
    { id: '5', name: 'Storage', slug: 'storage' },
  ]

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('pageSize', String(PAGE_SIZE))
      if (search) params.set('search', search)
      if (category) params.set('category', category)
      if (status !== 'all') params.set('status', status)
      params.set('sort', sort)
      params.set('order', order)

      const res = await fetch(`/api/admin/products?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch products')

      const json = await res.json()
      if (json.success) {
        setProducts(json.data.products)
        setTotal(json.data.total)
        setTotalPages(json.data.totalPages)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }, [page, search, category, status, sort, order])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const updateUrl = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value)
        else params.delete(key)
      })
      router.replace(`/admin/products?${params.toString()}`, { scroll: false })
    },
    [router, searchParams],
  )

  const handleSearch = (query: string) => {
    setSearch(query)
    setPage(1)
    updateUrl({ search: query, page: '1' })
  }

  const handleCategoryFilter = (cat: string) => {
    setCategory(cat)
    setPage(1)
    updateUrl({ category: cat, page: '1' })
  }

  const handleStatusFilter = (s: 'active' | 'inactive' | 'all') => {
    setStatus(s)
    setPage(1)
    updateUrl({ status: s === 'all' ? '' : s, page: '1' })
  }

  const handleSort = (field: string, newOrder: 'asc' | 'desc') => {
    setSort(field)
    setOrder(newOrder)
    updateUrl({ sort: field, order: newOrder })
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    updateUrl({ page: String(newPage) })
  }

  const handleDelete = async (ids: string[]) => {
    try {
      await Promise.all(ids.map((id) => fetch(`/api/admin/products/${id}`, { method: 'DELETE' })))
      fetchProducts()
    } catch (error) {
      console.error('Error deleting products:', error)
    }
  }

  const handleToggleFeatured = async (ids: string[], featured: boolean) => {
    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/admin/products/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isFeatured: featured }),
          }),
        ),
      )
      fetchProducts()
    } catch (error) {
      console.error('Error toggling featured:', error)
    }
  }

  const handleToggleActive = async (ids: string[], active: boolean) => {
    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/admin/products/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isActive: active }),
          }),
        ),
      )
      fetchProducts()
    } catch (error) {
      console.error('Error toggling active:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white lg:text-3xl">Products</h1>
        <p className="mt-1 text-slate-400">
          {loading ? 'Loading...' : `${total} product${total !== 1 ? 's' : ''} found`}
        </p>
      </div>

      {loading && products.length === 0 ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-700/50 bg-slate-800/30 p-12 backdrop-blur-sm">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500/30 border-t-cyan-500" />
        </div>
      ) : (
        <ProductTable
          products={products}
          total={total}
          page={page}
          pageSize={PAGE_SIZE}
          totalPages={totalPages}
          categories={categories}
          onSearch={handleSearch}
          onCategoryFilter={handleCategoryFilter}
          onStatusFilter={handleStatusFilter}
          onSort={handleSort}
          onPageChange={handlePageChange}
          onDelete={handleDelete}
          onToggleFeatured={handleToggleFeatured}
          onToggleActive={handleToggleActive}
          currentSearch={search}
          currentCategory={category}
          currentStatus={status}
          currentSort={sort}
          currentOrder={order}
        />
      )}
    </div>
  )
}
