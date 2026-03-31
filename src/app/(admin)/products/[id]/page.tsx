'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { ProductForm } from '@/components/admin/product-form'
import type { CreateProductInput, AdminProductDetail } from '@/types/admin'

const categories = [
  { id: '1', name: 'Electronics', slug: 'electronics' },
  { id: '2', name: 'Accessories', slug: 'accessories' },
  { id: '3', name: 'Audio', slug: 'audio' },
  { id: '4', name: 'Wearables', slug: 'wearables' },
  { id: '5', name: 'Storage', slug: 'storage' },
]

interface EditProductPageProps {
  params: Promise<{ id: string }>
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const [product, setProduct] = useState<AdminProductDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/admin/products/${id}`)
        if (!res.ok) throw new Error('Product not found')
        const json = await res.json()
        if (json.success) {
          setProduct(json.data)
        }
      } catch (error) {
        console.error('Error fetching product:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  const handleSubmit = async (data: CreateProductInput & { publish?: boolean }) => {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to update product')
      }

      router.push('/admin/products')
      router.refresh()
    } catch (error) {
      console.error('Error updating product:', error)
      alert(error instanceof Error ? error.message : 'Failed to update product')
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-slate-700/50 bg-slate-800/30 p-12 backdrop-blur-sm">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500/30 border-t-cyan-500" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-12 text-center backdrop-blur-sm">
        <p className="text-lg text-slate-400">Product not found</p>
        <Link
          href="/admin/products"
          className="mt-4 inline-block text-cyan-400 hover:text-cyan-300"
        >
          Back to products
        </Link>
      </div>
    )
  }

  const initialData = {
    name: product.name,
    description: product.description || '',
    categoryId: product.categoryId || '',
    price: (product.price / 100).toString(),
    compareAtPrice: product.compareAtPrice ? (product.compareAtPrice / 100).toString() : '',
    costPrice: product.costPrice ? (product.costPrice / 100).toString() : '',
    sku: product.sku,
    barcode: product.barcode || '',
    stockQuantity: product.stockQuantity.toString(),
    lowStockThreshold: product.lowStockThreshold.toString(),
    trackInventory: product.trackInventory,
    isFeatured: product.isFeatured,
    isActive: product.isActive,
    images: product.images.map((img) => ({
      id: img.id,
      url: img.url,
      alt: img.alt || '',
    })),
    variants: product.variants.map((v) => ({
      id: v.id,
      name: v.name,
      sku: v.sku,
      price: v.price ? (v.price / 100).toString() : '',
      stockQuantity: v.stockQuantity.toString(),
      lowStockThreshold: v.lowStockThreshold.toString(),
      trackInventory: v.trackInventory,
      attributes: (v.attributes as Record<string, string>) || {},
    })),
    tags: product.tags.map((t) => t.name),
    metaTitle: '',
    metaDescription: '',
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/products"
            className="rounded-xl bg-slate-800/50 p-2 text-slate-400 transition-colors hover:bg-slate-700/50 hover:text-white"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white lg:text-3xl">Edit Product</h1>
            <p className="mt-1 text-slate-400">SKU: {product.sku}</p>
          </div>
        </div>
      </div>

      <ProductForm
        initialData={initialData}
        categories={categories}
        onSubmit={handleSubmit}
        isEditing
        isSaving={isSaving}
      />
    </div>
  )
}
