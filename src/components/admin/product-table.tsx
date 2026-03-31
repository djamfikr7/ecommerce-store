'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  Plus,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Star,
  StarOff,
  Eye,
  EyeOff,
  Package,
  ArrowUpDown,
  MoreHorizontal,
  X,
  AlertTriangle,
} from 'lucide-react'

export interface ProductListItem {
  id: string
  name: string
  slug: string
  sku: string
  price: number
  compareAtPrice: number | null
  stockQuantity: number
  isActive: boolean
  isFeatured: boolean
  category: { id: string; name: string; slug: string } | null
  image: string | null
  variantsCount: number
  totalSold: number
  createdAt: string
  updatedAt: string
}

interface ProductTableProps {
  products: ProductListItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  categories: { id: string; name: string; slug: string }[]
  onSearch: (query: string) => void
  onCategoryFilter: (category: string) => void
  onStatusFilter: (status: 'active' | 'inactive' | 'all') => void
  onSort: (field: string, order: 'asc' | 'desc') => void
  onPageChange: (page: number) => void
  onDelete: (ids: string[]) => void
  onToggleFeatured: (ids: string[], featured: boolean) => void
  onToggleActive: (ids: string[], active: boolean) => void
  currentSearch: string
  currentCategory: string
  currentStatus: 'active' | 'inactive' | 'all'
  currentSort: string
  currentOrder: 'asc' | 'desc'
}

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

export function ProductTable({
  products,
  total,
  page,
  pageSize,
  totalPages,
  categories,
  onSearch,
  onCategoryFilter,
  onStatusFilter,
  onSort,
  onPageChange,
  onDelete,
  onToggleFeatured,
  onToggleActive,
  currentSearch,
  currentCategory,
  currentStatus,
  currentSort,
  currentOrder,
}: ProductTableProps) {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [searchInput, setSearchInput] = useState(currentSearch)
  const [showBulkMenu, setShowBulkMenu] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string[] | null>(null)

  const toggleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(products.map((p) => p.id))
    }
  }

  const toggleSelectProduct = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    )
  }

  const handleSort = (field: string) => {
    const newOrder = currentSort === field && currentOrder === 'desc' ? 'asc' : 'desc'
    onSort(field, newOrder)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchInput)
  }

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`
  }

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { color: 'text-red-400', bg: 'bg-red-500/20', label: 'Out of stock' }
    if (quantity <= 5) return { color: 'text-amber-400', bg: 'bg-amber-500/20', label: 'Low stock' }
    return { color: 'text-emerald-400', bg: 'bg-emerald-500/20', label: 'In stock' }
  }

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-4 backdrop-blur-sm">
        <div className="flex flex-col gap-4 lg:flex-row">
          {/* Search */}
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/50 py-2.5 pl-10 pr-4 text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('')
                  onSearch('')
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </form>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={currentCategory}
              onChange={(e) => onCategoryFilter(e.target.value)}
              className="cursor-pointer appearance-none rounded-xl border border-slate-700 bg-slate-900/50 py-2.5 pl-4 pr-10 text-slate-200 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
            <Filter
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={currentStatus}
              onChange={(e) => onStatusFilter(e.target.value as 'active' | 'inactive' | 'all')}
              className="cursor-pointer appearance-none rounded-xl border border-slate-700 bg-slate-900/50 py-2.5 pl-4 pr-10 text-slate-200 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Filter
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
          </div>

          {/* Add Product */}
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 px-4 py-2 font-medium text-white transition-opacity hover:opacity-90"
          >
            <Plus size={18} />
            Add Product
          </Link>
        </div>

        {/* Bulk Actions */}
        <AnimatePresence>
          {selectedProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 overflow-hidden"
            >
              <div className="flex items-center gap-4 rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3">
                <span className="text-sm text-slate-300">
                  {selectedProducts.length} product
                  {selectedProducts.length > 1 ? 's' : ''} selected
                </span>
                <div className="flex-1" />
                <button
                  onClick={() => onToggleFeatured(selectedProducts, true)}
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-amber-400 transition-colors hover:bg-amber-500/20"
                >
                  <Star size={16} />
                  Feature
                </button>
                <button
                  onClick={() => onToggleFeatured(selectedProducts, false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-slate-400 transition-colors hover:bg-slate-700/50"
                >
                  <StarOff size={16} />
                  Unfeature
                </button>
                <button
                  onClick={() => onToggleActive(selectedProducts, true)}
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-emerald-400 transition-colors hover:bg-emerald-500/20"
                >
                  <Eye size={16} />
                  Publish
                </button>
                <button
                  onClick={() => onToggleActive(selectedProducts, false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-slate-400 transition-colors hover:bg-slate-700/50"
                >
                  <EyeOff size={16} />
                  Unpublish
                </button>
                <button
                  onClick={() => setDeleteConfirm(selectedProducts)}
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-red-400 transition-colors hover:bg-red-500/20"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
                <button
                  onClick={() => setSelectedProducts([])}
                  className="text-slate-500 transition-colors hover:text-slate-300"
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Products Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-4 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === products.length && products.length > 0}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500/50"
                  />
                </th>
                <th className="px-4 py-4 text-left">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 transition-colors hover:text-white"
                  >
                    Product
                    <ArrowUpDown size={14} />
                  </button>
                </th>
                <th className="px-4 py-4 text-left">
                  <button
                    onClick={() => handleSort('price')}
                    className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 transition-colors hover:text-white"
                  >
                    Price
                    <ArrowUpDown size={14} />
                  </button>
                </th>
                <th className="px-4 py-4 text-left">
                  <button
                    onClick={() => handleSort('stock')}
                    className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 transition-colors hover:text-white"
                  >
                    Inventory
                    <ArrowUpDown size={14} />
                  </button>
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Status
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Sales
                </th>
                <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    <Package className="mx-auto mb-4 text-slate-500" size={48} />
                    <p>No products found</p>
                  </td>
                </tr>
              ) : (
                products.map((product, index) => {
                  const stockStatus = getStockStatus(product.stockQuantity)
                  return (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className={`transition-colors hover:bg-slate-700/20 ${
                        index % 2 === 0 ? 'bg-slate-800/20' : ''
                      } ${selectedProducts.includes(product.id) ? 'bg-cyan-500/5' : ''}`}
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => toggleSelectProduct(product.id)}
                          className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500/50"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-700/50">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Package className="text-slate-500" size={20} />
                            )}
                          </div>
                          <div>
                            <Link
                              href={`/admin/products/${product.id}`}
                              className="font-medium text-slate-200 transition-colors hover:text-cyan-400"
                            >
                              {product.name}
                            </Link>
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-slate-500">SKU: {product.sku}</p>
                              {product.isFeatured && (
                                <Star size={12} className="fill-amber-400 text-amber-400" />
                              )}
                              {product.variantsCount > 0 && (
                                <span className="rounded-full bg-slate-700/50 px-2 py-0.5 text-xs text-slate-400">
                                  {product.variantsCount} variants
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-slate-200">{formatPrice(product.price)}</p>
                          {product.compareAtPrice && (
                            <p className="text-sm text-slate-500 line-through">
                              {formatPrice(product.compareAtPrice)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${stockStatus.bg} ${stockStatus.color}`}
                          >
                            {product.stockQuantity}
                          </span>
                          {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
                            <AlertTriangle size={14} className="text-amber-400" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
                            product.isActive
                              ? 'border-emerald-500/30 bg-emerald-500/20 text-emerald-400'
                              : 'border-slate-500/30 bg-slate-500/20 text-slate-400'
                          }`}
                        >
                          {product.isActive ? (
                            <>
                              <Eye size={12} />
                              Active
                            </>
                          ) : (
                            <>
                              <EyeOff size={12} />
                              Inactive
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-400">{product.totalSold} sold</td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-700/50 hover:text-white"
                          >
                            <Edit size={16} />
                          </Link>
                          <button
                            onClick={() => setDeleteConfirm([product.id])}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-500/20 hover:text-red-400"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-700/50 px-6 py-4 sm:flex-row">
            <p className="text-sm text-slate-400">
              Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total}{' '}
              products
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                className="rounded-lg bg-slate-800/50 p-2 text-slate-400 transition-colors hover:bg-slate-700/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft size={20} />
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNum: number
                if (totalPages <= 7) {
                  pageNum = i + 1
                } else if (page <= 4) {
                  pageNum = i + 1
                } else if (page >= totalPages - 3) {
                  pageNum = totalPages - 6 + i
                } else {
                  pageNum = page - 3 + i
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`h-10 w-10 rounded-lg text-sm font-medium transition-colors ${
                      pageNum === page
                        ? 'border border-cyan-500/30 bg-cyan-500/20 text-cyan-400'
                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              <button
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages}
                className="rounded-lg bg-slate-800/50 p-2 text-slate-400 transition-colors hover:bg-slate-700/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="mx-4 w-full max-w-md rounded-2xl border border-slate-700/50 bg-slate-900 p-6 shadow-2xl"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
                  <AlertTriangle className="text-red-400" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Delete Product{deleteConfirm.length > 1 ? 's' : ''}
                  </h3>
                  <p className="text-sm text-slate-400">
                    Are you sure you want to delete {deleteConfirm.length} product
                    {deleteConfirm.length > 1 ? 's' : ''}? This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2 font-medium text-slate-300 transition-colors hover:bg-slate-700/50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onDelete(deleteConfirm)
                    setSelectedProducts([])
                    setDeleteConfirm(null)
                  }}
                  className="rounded-xl bg-red-500 px-4 py-2 font-medium text-white transition-colors hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
