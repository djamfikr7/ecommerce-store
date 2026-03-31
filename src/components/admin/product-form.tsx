'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  X,
  Plus,
  Trash2,
  Package,
  DollarSign,
  Image as ImageIcon,
  Layers,
  Search,
  GripVertical,
  AlertCircle,
  Check,
} from 'lucide-react'
import type { CreateProductInput } from '@/types/admin'

type TabType = 'basic' | 'pricing' | 'images' | 'variants' | 'seo'

interface VariantForm {
  id: string
  name: string
  sku: string
  price: string
  stockQuantity: string
  lowStockThreshold: string
  trackInventory: boolean
  attributes: Record<string, string>
}

interface ImageForm {
  id: string
  url: string
  alt: string
  file?: File
  preview?: string
}

interface ProductFormState {
  name: string
  description: string
  categoryId: string
  price: string
  compareAtPrice: string
  costPrice: string
  sku: string
  barcode: string
  stockQuantity: string
  lowStockThreshold: string
  trackInventory: boolean
  isFeatured: boolean
  isActive: boolean
  images: ImageForm[]
  variants: VariantForm[]
  tags: string[]
  metaTitle: string
  metaDescription: string
}

interface ProductFormProps {
  initialData?: Partial<ProductFormState>
  categories: { id: string; name: string; slug: string }[]
  onSubmit: (data: CreateProductInput & { publish?: boolean }) => Promise<void>
  isEditing?: boolean
  isSaving?: boolean
}

const tabs: { id: TabType; label: string; icon: typeof Package }[] = [
  { id: 'basic', label: 'Basic Info', icon: Package },
  { id: 'pricing', label: 'Pricing', icon: DollarSign },
  { id: 'images', label: 'Images', icon: ImageIcon },
  { id: 'variants', label: 'Variants', icon: Layers },
  { id: 'seo', label: 'SEO', icon: Search },
]

const defaultFormState: ProductFormState = {
  name: '',
  description: '',
  categoryId: '',
  price: '',
  compareAtPrice: '',
  costPrice: '',
  sku: '',
  barcode: '',
  stockQuantity: '0',
  lowStockThreshold: '5',
  trackInventory: true,
  isFeatured: false,
  isActive: true,
  images: [],
  variants: [],
  tags: [],
  metaTitle: '',
  metaDescription: '',
}

export function ProductForm({
  initialData,
  categories,
  onSubmit,
  isEditing = false,
  isSaving = false,
}: ProductFormProps) {
  const [activeTab, setActiveTab] = useState<TabType>('basic')
  const [form, setForm] = useState<ProductFormState>({
    ...defaultFormState,
    ...initialData,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [newVariantName, setNewVariantName] = useState('')
  const [newVariantOptions, setNewVariantOptions] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [dragOverImage, setDragOverImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const updateField = <K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  const generateSku = () => {
    if (!form.name) return
    const slug = form.name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '-')
      .substring(0, 10)
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase()
    updateField('sku', `SKU-${slug}-${randomSuffix}`)
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  // Image handling
  const handleImageFiles = useCallback(
    (files: FileList | File[]) => {
      const newImages: ImageForm[] = Array.from(files)
        .filter((file) => file.type.startsWith('image/'))
        .map((file) => ({
          id: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          url: '',
          alt: file.name.replace(/\.[^/.]+$/, ''),
          file,
          preview: URL.createObjectURL(file),
        }))

      updateField('images', [...form.images, ...newImages])
    },
    [form.images],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOverImage(false)
      if (e.dataTransfer.files.length > 0) {
        handleImageFiles(e.dataTransfer.files)
      }
    },
    [handleImageFiles],
  )

  const removeImage = (id: string) => {
    const image = form.images.find((img) => img.id === id)
    if (image?.preview) URL.revokeObjectURL(image.preview)
    updateField(
      'images',
      form.images.filter((img) => img.id !== id),
    )
  }

  const updateImageAlt = (id: string, alt: string) => {
    updateField(
      'images',
      form.images.map((img) => (img.id === id ? { ...img, alt } : img)),
    )
  }

  // Variant handling
  const addVariant = () => {
    if (!newVariantName.trim() || !newVariantOptions.trim()) return
    const options = newVariantOptions.split(',').map((o) => o.trim())
    const newVariants: VariantForm[] = options.map((option) => ({
      id: `var-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: `${newVariantName.trim()}: ${option}`,
      sku: `${form.sku || 'SKU'}-${newVariantName.trim().toUpperCase().substring(0, 3)}-${option.toUpperCase().substring(0, 3)}`,
      price: '',
      stockQuantity: '0',
      lowStockThreshold: '3',
      trackInventory: true,
      attributes: { [newVariantName.trim().toLowerCase()]: option },
    }))
    updateField('variants', [...form.variants, ...newVariants])
    setNewVariantName('')
    setNewVariantOptions('')
  }

  const removeVariant = (id: string) => {
    updateField(
      'variants',
      form.variants.filter((v) => v.id !== id),
    )
  }

  const updateVariant = (
    id: string,
    field: keyof VariantForm,
    value: string | boolean | Record<string, string>,
  ) => {
    updateField(
      'variants',
      form.variants.map((v) => (v.id === id ? { ...v, [field]: value } : v)),
    )
  }

  // Tags handling
  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && !form.tags.includes(tag)) {
      updateField('tags', [...form.tags, tag])
    }
    setTagInput('')
  }

  const removeTag = (tag: string) => {
    updateField(
      'tags',
      form.tags.filter((t) => t !== tag),
    )
  }

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!form.name.trim()) newErrors.name = 'Product name is required'
    if (!form.sku.trim()) newErrors.sku = 'SKU is required'
    if (!form.price || parseFloat(form.price) <= 0) newErrors.price = 'Valid price is required'
    if (form.compareAtPrice && parseFloat(form.compareAtPrice) < parseFloat(form.price))
      newErrors.compareAtPrice = 'Compare price must be >= sale price'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (publish?: boolean) => {
    if (!validate()) {
      const firstError = Object.keys(errors)[0]
      if (firstError && ['name', 'sku', 'description', 'barcode'].includes(firstError))
        setActiveTab('basic')
      else if (firstError && ['price', 'compareAtPrice', 'costPrice'].includes(firstError))
        setActiveTab('pricing')
      return
    }

    const priceInCents = Math.round(parseFloat(form.price) * 100)
    const data: Record<string, unknown> = {
      name: form.name,
      price: priceInCents,
      sku: form.sku,
      stockQuantity: parseInt(form.stockQuantity) || 0,
      lowStockThreshold: parseInt(form.lowStockThreshold) || 5,
      trackInventory: form.trackInventory,
      isFeatured: form.isFeatured,
      isActive: publish ? true : form.isActive,
      images: form.images.map((img, index) => ({
        url: img.url || img.preview || '',
        alt: img.alt,
        sortOrder: index,
      })),
    }

    if (form.description) data.description = form.description
    if (form.categoryId) data.categoryId = form.categoryId
    if (form.compareAtPrice) data.compareAtPrice = Math.round(parseFloat(form.compareAtPrice) * 100)
    if (form.costPrice) data.costPrice = Math.round(parseFloat(form.costPrice) * 100)
    if (form.barcode) data.barcode = form.barcode
    if (form.tags.length > 0) data.tags = form.tags
    if (publish) data.publish = true

    if (form.variants.length > 0) {
      data.variants = form.variants.map((v) => {
        const variantData: Record<string, unknown> = {
          name: v.name,
          sku: v.sku,
          stockQuantity: parseInt(v.stockQuantity) || 0,
          lowStockThreshold: parseInt(v.lowStockThreshold) || 3,
          trackInventory: v.trackInventory,
          attributes: v.attributes,
        }
        if (v.price) variantData.price = Math.round(parseFloat(v.price) * 100)
        return variantData
      })
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await onSubmit(data as any)
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-2 backdrop-blur-sm">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const hasError =
              (tab.id === 'basic' && (errors.name || errors.sku)) ||
              (tab.id === 'pricing' && errors.price)
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
                    : hasError
                      ? 'text-red-400 hover:bg-red-500/10'
                      : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <Icon size={18} />
                {tab.label}
                {hasError && <AlertCircle size={14} />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6 backdrop-blur-sm">
        {/* Basic Info */}
        {activeTab === 'basic' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Product Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className={`w-full rounded-xl border bg-slate-900/50 px-4 py-2.5 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${
                    errors.name ? 'border-red-500/50' : 'border-slate-700 focus:border-cyan-500/50'
                  }`}
                  placeholder="Enter product name"
                />
                {errors.name && (
                  <p className="mt-1 flex items-center gap-1 text-sm text-red-400">
                    <AlertCircle size={14} />
                    {errors.name}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  SKU <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => updateField('sku', e.target.value)}
                    className={`flex-1 rounded-xl border bg-slate-900/50 px-4 py-2.5 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${
                      errors.sku ? 'border-red-500/50' : 'border-slate-700 focus:border-cyan-500/50'
                    }`}
                    placeholder="SKU-001"
                  />
                  <button
                    type="button"
                    onClick={generateSku}
                    disabled={!form.name}
                    className="rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-slate-300 transition-colors hover:bg-slate-700/50 disabled:opacity-50"
                  >
                    Generate
                  </button>
                </div>
                {errors.sku && (
                  <p className="mt-1 flex items-center gap-1 text-sm text-red-400">
                    <AlertCircle size={14} />
                    {errors.sku}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={5}
                className="w-full resize-none rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-2.5 text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                placeholder="Enter product description"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Category</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => updateField('categoryId', e.target.value)}
                  className="w-full cursor-pointer rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-2.5 text-slate-200 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Barcode</label>
                <input
                  type="text"
                  value={form.barcode}
                  onChange={(e) => updateField('barcode', e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-2.5 text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  placeholder="UPC / EAN"
                />
              </div>
              <div className="flex items-end gap-4">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => updateField('isFeatured', e.target.checked)}
                    className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500/50"
                  />
                  <span className="text-sm text-slate-300">Featured</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.trackInventory}
                    onChange={(e) => updateField('trackInventory', e.target.checked)}
                    className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500/50"
                  />
                  <span className="text-sm text-slate-300">Track inventory</span>
                </label>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Tags</label>
              <div className="flex flex-wrap gap-2">
                {form.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-600 bg-slate-800/50 px-3 py-1 text-sm text-slate-300"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-slate-500 hover:text-red-400"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addTag()
                      }
                    }}
                    className="rounded-xl border border-slate-700 bg-slate-900/50 px-3 py-1.5 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    placeholder="Add tag..."
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="rounded-lg bg-slate-700/50 p-1.5 text-slate-400 hover:text-white"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pricing */}
        {activeTab === 'pricing' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Price <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={(e) => updateField('price', e.target.value)}
                    className={`w-full rounded-xl border bg-slate-900/50 py-2.5 pl-8 pr-4 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${
                      errors.price
                        ? 'border-red-500/50'
                        : 'border-slate-700 focus:border-cyan-500/50'
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {errors.price && (
                  <p className="mt-1 flex items-center gap-1 text-sm text-red-400">
                    <AlertCircle size={14} />
                    {errors.price}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Compare at Price
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.compareAtPrice}
                    onChange={(e) => updateField('compareAtPrice', e.target.value)}
                    className={`w-full rounded-xl border bg-slate-900/50 py-2.5 pl-8 pr-4 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${
                      errors.compareAtPrice
                        ? 'border-red-500/50'
                        : 'border-slate-700 focus:border-cyan-500/50'
                    }`}
                    placeholder="0.00"
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Shows original price with strikethrough
                </p>
                {errors.compareAtPrice && (
                  <p className="mt-1 flex items-center gap-1 text-sm text-red-400">
                    <AlertCircle size={14} />
                    {errors.compareAtPrice}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Cost Price</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.costPrice}
                    onChange={(e) => updateField('costPrice', e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/50 py-2.5 pl-8 pr-4 text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    placeholder="0.00"
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">Internal only, not shown to customers</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.stockQuantity}
                  onChange={(e) => updateField('stockQuantity', e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-2.5 text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Low Stock Threshold
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.lowStockThreshold}
                  onChange={(e) => updateField('lowStockThreshold', e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-2.5 text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  placeholder="5"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Alert when stock falls below this level
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Images */}
        {activeTab === 'images' && (
          <div className="space-y-6">
            {/* Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragOverImage(true)
              }}
              onDragLeave={() => setDragOverImage(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-colors ${
                dragOverImage
                  ? 'border-cyan-500/50 bg-cyan-500/10'
                  : 'border-slate-700 hover:border-slate-600'
              }`}
            >
              <Upload
                className={`mb-4 ${dragOverImage ? 'text-cyan-400' : 'text-slate-500'}`}
                size={48}
              />
              <p className="mb-2 text-slate-400">Drag and drop images here, or click to upload</p>
              <p className="text-xs text-slate-500">PNG, JPG, WEBP up to 10MB each</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => e.target.files && handleImageFiles(e.target.files)}
                className="hidden"
              />
            </div>

            {/* Image Grid */}
            {form.images.length > 0 && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {form.images.map((image, index) => (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="group relative"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-xl border border-slate-700 bg-slate-900/50">
                      {image.preview || image.url ? (
                        <img
                          src={image.preview || image.url}
                          alt={image.alt}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Package className="text-slate-600" size={32} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="absolute right-2 top-2 flex gap-1">
                          <button
                            type="button"
                            onClick={() => removeImage(image.id)}
                            className="rounded-lg bg-red-500/80 p-1.5 text-white"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      {index === 0 && (
                        <span className="absolute bottom-2 left-2 rounded-full bg-cyan-500/80 px-2 py-0.5 text-xs font-medium text-white">
                          Main
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={image.alt}
                      onChange={(e) => updateImageAlt(image.id, e.target.value)}
                      placeholder="Alt text"
                      className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-1.5 text-xs text-slate-300 placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none"
                    />
                  </motion.div>
                ))}

                {/* Add More Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 text-slate-500 transition-colors hover:border-cyan-500/50 hover:text-cyan-400"
                >
                  <Plus size={24} />
                  <span className="mt-2 text-sm">Add Image</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Variants */}
        {activeTab === 'variants' && (
          <div className="space-y-6">
            {form.variants.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">
                  Product Variants ({form.variants.length})
                </h3>
                {form.variants.map((variant) => (
                  <motion.div
                    key={variant.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-slate-700 bg-slate-900/50 p-4"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <input
                        type="text"
                        value={variant.name}
                        onChange={(e) => updateVariant(variant.id, 'name', e.target.value)}
                        className="rounded-lg border border-transparent bg-transparent text-slate-200 focus:border-cyan-500/50 focus:bg-slate-800/50 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => removeVariant(variant.id)}
                        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-500/20 hover:text-red-400"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                      <div>
                        <label className="mb-1 block text-xs text-slate-500">SKU</label>
                        <input
                          type="text"
                          value={variant.sku}
                          onChange={(e) => updateVariant(variant.id, 'sku', e.target.value)}
                          className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-1.5 text-sm text-slate-200 focus:border-cyan-500/50 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-slate-500">Price override</label>
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                            $
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={variant.price}
                            onChange={(e) => updateVariant(variant.id, 'price', e.target.value)}
                            className="w-full rounded-lg border border-slate-700 bg-slate-800/50 py-1.5 pl-6 pr-3 text-sm text-slate-200 focus:border-cyan-500/50 focus:outline-none"
                            placeholder="Same as product"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-slate-500">Stock</label>
                        <input
                          type="number"
                          min="0"
                          value={variant.stockQuantity}
                          onChange={(e) =>
                            updateVariant(variant.id, 'stockQuantity', e.target.value)
                          }
                          className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-1.5 text-sm text-slate-200 focus:border-cyan-500/50 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-slate-500">Low stock alert</label>
                        <input
                          type="number"
                          min="0"
                          value={variant.lowStockThreshold}
                          onChange={(e) =>
                            updateVariant(variant.id, 'lowStockThreshold', e.target.value)
                          }
                          className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-1.5 text-sm text-slate-200 focus:border-cyan-500/50 focus:outline-none"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Add Variant */}
            <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
              <h4 className="mb-4 font-medium text-slate-200">Add Variant Group</h4>
              <p className="mb-4 text-sm text-slate-400">
                Create variants by specifying an attribute name and its options. For example:
                &quot;Color&quot; with options &quot;Red, Blue, Green&quot;.
              </p>
              <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-slate-400">Attribute Name</label>
                  <input
                    type="text"
                    value={newVariantName}
                    onChange={(e) => setNewVariantName(e.target.value)}
                    placeholder="e.g., Size, Color"
                    className="w-full rounded-xl border border-slate-600 bg-slate-800/50 px-4 py-2.5 text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-slate-400">
                    Options (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newVariantOptions}
                    onChange={(e) => setNewVariantOptions(e.target.value)}
                    placeholder="e.g., S, M, L, XL"
                    className="w-full rounded-xl border border-slate-600 bg-slate-800/50 px-4 py-2.5 text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={addVariant}
                disabled={!newVariantName.trim() || !newVariantOptions.trim()}
                className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/20 px-4 py-2 font-medium text-cyan-400 transition-colors hover:bg-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus size={18} />
                Add Variant Group
              </button>
            </div>
          </div>
        )}

        {/* SEO */}
        {activeTab === 'seo' && (
          <div className="space-y-6">
            <div>
              <h3 className="mb-2 text-lg font-semibold text-white">SEO Settings</h3>
              <p className="text-sm text-slate-400">
                Optimize your product listing for search engines
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Meta Title</label>
              <input
                type="text"
                value={form.metaTitle}
                onChange={(e) => updateField('metaTitle', e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-2.5 text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                placeholder="Enter meta title"
              />
              <p
                className={`mt-1 text-xs ${form.metaTitle.length > 60 ? 'text-red-400' : 'text-slate-500'}`}
              >
                {form.metaTitle.length}/60 characters
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Meta Description
              </label>
              <textarea
                value={form.metaDescription}
                onChange={(e) => updateField('metaDescription', e.target.value)}
                rows={4}
                className="w-full resize-none rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-2.5 text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                placeholder="Enter meta description"
              />
              <p
                className={`mt-1 text-xs ${form.metaDescription.length > 160 ? 'text-red-400' : 'text-slate-500'}`}
              >
                {form.metaDescription.length}/160 characters
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">URL Slug</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">/products/</span>
                <input
                  type="text"
                  value={generateSlug(form.name) || 'product-url-slug'}
                  readOnly
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-900/30 px-4 py-2.5 text-slate-400"
                />
              </div>
            </div>

            {/* Preview */}
            <div className="rounded-xl border border-slate-700 bg-slate-900/30 p-4">
              <h4 className="mb-3 text-sm font-medium text-slate-400">Search Preview</h4>
              <div className="space-y-1">
                <p className="text-sm text-blue-400 hover:underline">
                  {form.metaTitle || form.name || 'Product Title'}
                </p>
                <p className="text-xs text-green-600">
                  example.com/products/{generateSlug(form.name) || 'product-slug'}
                </p>
                <p className="text-xs text-slate-400">
                  {form.metaDescription ||
                    form.description?.substring(0, 160) ||
                    'Product description will appear here...'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => updateField('isActive', e.target.checked)}
              className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500/50"
            />
            <span className="text-sm text-slate-300">{form.isActive ? 'Published' : 'Draft'}</span>
          </label>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={isSaving}
            className="rounded-xl border border-slate-700 bg-slate-800/50 px-6 py-2.5 font-medium text-slate-300 transition-colors hover:bg-slate-700/50 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 px-6 py-2.5 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Saving...
              </>
            ) : (
              <>
                <Check size={18} />
                {isEditing ? 'Save & Publish' : 'Create Product'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
