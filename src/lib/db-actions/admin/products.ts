'use server'

import { prisma } from '@/lib/prisma'
import type {
  AdminProductList,
  AdminProductListParams,
  AdminProductDetail,
  CreateProductInput,
  UpdateProductInput,
  AdminProductListItem,
} from '@/types/admin'
import type { Product, ProductVariant } from '@prisma/client'
import { revalidatePath } from 'next/cache'

/**
 * Generate slug from name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 100)
}

/**
 * Get paginated list of products for admin
 */
export async function adminGetProducts(
  params: AdminProductListParams
): Promise<AdminProductList> {
  const {
    page = 1,
    pageSize = 20,
    search,
    category,
    status = 'all',
    sort = 'createdAt',
    order = 'desc',
  } = params

  const skip = (page - 1) * pageSize

  // Build where clause
  const where: Parameters<typeof prisma.product.findMany>[0]['where'] = {}

  // Search filter
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
    ]
  }

  // Category filter
  if (category) {
    where.category = { slug: category }
  }

  // Status filter
  if (status === 'active') {
    where.isActive = true
  } else if (status === 'inactive') {
    where.isActive = false
  }

  // Build order by
  const orderBy: Record<string, 'asc' | 'desc'> = {}
  if (sort === 'name') {
    orderBy.name = order
  } else if (sort === 'price') {
    orderBy.price = order
  } else if (sort === 'stock') {
    orderBy.stockQuantity = order
  } else if (sort === 'createdAt') {
    orderBy.createdAt = order
  } else if (sort === 'updatedAt') {
    orderBy.updatedAt = order
  }

  // Execute queries in parallel
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        images: {
          take: 1,
          orderBy: { sortOrder: 'asc' },
          select: { url: true },
        },
        variants: {
          select: { id: true },
        },
        orderItems: {
          where: {
            order: { paymentStatus: 'SUCCEEDED' },
          },
          select: { quantity: true },
        },
      },
    }),
    prisma.product.count({ where }),
  ])

  // Format products
  const formattedProducts: AdminProductListItem[] = products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    stockQuantity: product.stockQuantity,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    category: product.category,
    image: product.images[0]?.url || null,
    variantsCount: product.variants.length,
    totalSold: product.orderItems.reduce((sum, item) => sum + item.quantity, 0),
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  }))

  return {
    products: formattedProducts,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

/**
 * Get single product by ID for admin
 */
export async function adminGetProductById(id: string): Promise<AdminProductDetail | null> {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      images: {
        orderBy: { sortOrder: 'asc' },
      },
      variants: {
        orderBy: { createdAt: 'asc' },
      },
      tags: true,
      orderItems: {
        where: {
          order: { paymentStatus: 'SUCCEEDED' },
        },
        select: { total: true },
      },
    },
  })

  if (!product) {
    return null
  }

  // Calculate total sold and revenue
  const totalSold = product.variants.reduce((sum, v) => sum, 0)
  const totalRevenue = product.orderItems.reduce((sum, item) => sum + item.total, 0)

  return {
    ...product,
    totalSold,
    totalRevenue,
  }
}

/**
 * Create new product
 */
export async function adminCreateProduct(
  data: CreateProductInput,
  adminId: string
): Promise<Product> {
  const slug = generateSlug(data.name)

  // Check for duplicate slug
  const existingSlug = await prisma.product.findUnique({ where: { slug } })
  const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug

  // Create product with variants, images, and tags in transaction
  const product = await prisma.$transaction(async (tx) => {
    // Create product
    const newProduct = await tx.product.create({
      data: {
        name: data.name,
        slug: finalSlug,
        description: data.description,
        categoryId: data.categoryId,
        price: data.price,
        compareAtPrice: data.compareAtPrice,
        costPrice: data.costPrice,
        sku: data.sku,
        barcode: data.barcode,
        stockQuantity: data.stockQuantity || 0,
        lowStockThreshold: data.lowStockThreshold || 5,
        trackInventory: data.trackInventory ?? true,
        isFeatured: data.isFeatured ?? false,
        isActive: data.isActive ?? true,
      },
    })

    // Create images
    if (data.images && data.images.length > 0) {
      await tx.productImage.createMany({
        data: data.images.map((img, index) => ({
          productId: newProduct.id,
          url: img.url,
          alt: img.alt,
          width: img.width,
          height: img.height,
          sortOrder: img.sortOrder ?? index,
        })),
      })
    }

    // Create variants
    if (data.variants && data.variants.length > 0) {
      for (const variant of data.variants) {
        await tx.productVariant.create({
          data: {
            productId: newProduct.id,
            name: variant.name,
            sku: variant.sku,
            price: variant.price,
            stockQuantity: variant.stockQuantity || 0,
            lowStockThreshold: variant.lowStockThreshold || 3,
            trackInventory: variant.trackInventory ?? true,
            attributes: variant.attributes,
          },
        })
      }
    }

    // Create or connect tags
    if (data.tags && data.tags.length > 0) {
      for (const tagName of data.tags) {
        const tag = await tx.productTag.upsert({
          where: { name: tagName },
          update: {},
          create: { name: tagName },
        })
        await tx.product.update({
          where: { id: newProduct.id },
          data: {
            tags: { connect: { id: tag.id } },
          },
        })
      }
    }

    // Create audit log
    await tx.adminAuditLog.create({
      data: {
        adminId,
        action: 'CREATE_PRODUCT',
        entityType: 'Product',
        entityId: newProduct.id,
        newValue: { name: data.name, sku: data.sku },
      },
    })

    return newProduct
  })

  revalidatePath('/admin/products')
  revalidatePath('/products')

  return product
}

/**
 * Update existing product
 */
export async function adminUpdateProduct(
  id: string,
  data: UpdateProductInput,
  adminId: string
): Promise<Product> {
  // Get current product for audit
  const currentProduct = await prisma.product.findUnique({
    where: { id },
    include: { tags: true },
  })

  if (!currentProduct) {
    throw new Error('Product not found')
  }

  // Build update data
  const updateData: Parameters<typeof prisma.product.update>[0]['data'] = {}

  if (data.name !== undefined) {
    updateData.name = data.name
    // Update slug if name changed
    if (data.name !== currentProduct.name) {
      updateData.slug = generateSlug(data.name)
    }
  }

  if (data.description !== undefined) updateData.description = data.description
  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId
  if (data.price !== undefined) updateData.price = data.price
  if (data.compareAtPrice !== undefined) updateData.compareAtPrice = data.compareAtPrice
  if (data.costPrice !== undefined) updateData.costPrice = data.costPrice
  if (data.sku !== undefined) updateData.sku = data.sku
  if (data.barcode !== undefined) updateData.barcode = data.barcode
  if (data.stockQuantity !== undefined) updateData.stockQuantity = data.stockQuantity
  if (data.lowStockThreshold !== undefined) updateData.lowStockThreshold = data.lowStockThreshold
  if (data.trackInventory !== undefined) updateData.trackInventory = data.trackInventory
  if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured
  if (data.isActive !== undefined) updateData.isActive = data.isActive

  // Update product in transaction
  const product = await prisma.$transaction(async (tx) => {
    // Update product
    const updated = await tx.product.update({
      where: { id },
      data: updateData,
    })

    // Update images if provided
    if (data.images !== undefined) {
      // Delete existing images
      await tx.productImage.deleteMany({ where: { productId: id } })

      // Create new images
      if (data.images.length > 0) {
        await tx.productImage.createMany({
          data: data.images.map((img, index) => ({
            productId: id,
            url: img.url,
            alt: img.alt,
            width: img.width,
            height: img.height,
            sortOrder: img.sortOrder ?? index,
          })),
        })
      }
    }

    // Update variants if provided
    if (data.variants !== undefined) {
      // Delete existing variants
      await tx.productVariant.deleteMany({ where: { productId: id } })

      // Create new variants
      if (data.variants.length > 0) {
        for (const variant of data.variants) {
          await tx.productVariant.create({
            data: {
              productId: id,
              name: variant.name,
              sku: variant.sku,
              price: variant.price,
              stockQuantity: variant.stockQuantity || 0,
              lowStockThreshold: variant.lowStockThreshold || 3,
              trackInventory: variant.trackInventory ?? true,
              attributes: variant.attributes,
            },
          })
        }
      }
    }

    // Update tags if provided
    if (data.tags !== undefined) {
      // Disconnect all tags
      await tx.product.update({
        where: { id },
        data: { tags: { set: [] } },
      })

      // Connect new tags
      for (const tagName of data.tags) {
        const tag = await tx.productTag.upsert({
          where: { name: tagName },
          update: {},
          create: { name: tagName },
        })
        await tx.product.update({
          where: { id },
          data: {
            tags: { connect: { id: tag.id } },
          },
        })
      }
    }

    // Create audit log
    await tx.adminAuditLog.create({
      data: {
        adminId,
        action: 'UPDATE_PRODUCT',
        entityType: 'Product',
        entityId: id,
        oldValue: { name: currentProduct.name },
        newValue: updateData,
      },
    })

    return updated
  })

  revalidatePath('/admin/products')
  revalidatePath(`/products/${product.slug}`)
  revalidatePath('/products')

  return product
}

/**
 * Soft delete product (set isActive = false)
 */
export async function adminDeleteProduct(id: string, adminId: string): Promise<void> {
  const product = await prisma.product.findUnique({ where: { id } })

  if (!product) {
    throw new Error('Product not found')
  }

  await prisma.$transaction(async (tx) => {
    // Soft delete
    await tx.product.update({
      where: { id },
      data: { isActive: false },
    })

    // Audit log
    await tx.adminAuditLog.create({
      data: {
        adminId,
        action: 'DELETE_PRODUCT',
        entityType: 'Product',
        entityId: id,
        oldValue: { isActive: true },
        newValue: { isActive: false },
      },
    })
  })

  revalidatePath('/admin/products')
  revalidatePath('/products')
}

/**
 * Update inventory for a product variant
 */
export async function adminUpdateInventory(
  variantId: string,
  quantity: number,
  reason: string,
  adminId: string,
  ip?: string
): Promise<ProductVariant> {
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    include: { product: true },
  })

  if (!variant) {
    throw new Error('Variant not found')
  }

  const oldQuantity = variant.stockQuantity

  const updatedVariant = await prisma.$transaction(async (tx) => {
    // Update variant stock
    const updated = await tx.productVariant.update({
      where: { id: variantId },
      data: { stockQuantity: quantity },
    })

    // Update parent product stock if not using variants
    if (variant.product.stockQuantity !== undefined) {
      const stockDiff = quantity - oldQuantity
      if (stockDiff !== 0) {
        await tx.product.update({
          where: { id: variant.productId },
          data: {
            stockQuantity: { increment: stockDiff },
          },
        })
      }
    }

    // Audit log
    await tx.adminAuditLog.create({
      data: {
        adminId,
        action: 'UPDATE_INVENTORY',
        entityType: 'ProductVariant',
        entityId: variantId,
        oldValue: { stockQuantity: oldQuantity },
        newValue: { stockQuantity: quantity },
        ip,
      },
    })

    return updated
  })

  revalidatePath('/admin/products')
  revalidatePath(`/products/${variant.product.slug}`)

  return updatedVariant
}
