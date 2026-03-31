'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { ProductForm } from '@/components/admin/product-form'
import type { CreateProductInput } from '@/types/admin'

const categories = [
  { id: '1', name: 'Electronics', slug: 'electronics' },
  { id: '2', name: 'Accessories', slug: 'accessories' },
  { id: '3', name: 'Audio', slug: 'audio' },
  { id: '4', name: 'Wearables', slug: 'wearables' },
  { id: '5', name: 'Storage', slug: 'storage' },
]

export default function NewProductPage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (data: CreateProductInput & { publish?: boolean }) => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to create product')
      }

      router.push('/admin/products')
      router.refresh()
    } catch (error) {
      console.error('Error creating product:', error)
      alert(error instanceof Error ? error.message : 'Failed to create product')
    } finally {
      setIsSaving(false)
    }
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
            <h1 className="text-2xl font-bold text-white lg:text-3xl">New Product</h1>
            <p className="mt-1 text-slate-400">Create a new product listing</p>
          </div>
        </div>
      </div>

      <ProductForm categories={categories} onSubmit={handleSubmit} isSaving={isSaving} />
    </div>
  )
}
