import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create currencies
  await prisma.currency.createMany({
    data: [
      { code: 'USD', name: 'US Dollar', symbol: '$', decimalPlaces: 2, isBaseCurrency: true },
      { code: 'EUR', name: 'Euro', symbol: '€', decimalPlaces: 2 },
      { code: 'GBP', name: 'British Pound', symbol: '£', decimalPlaces: 2 },
      { code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimalPlaces: 0 },
    ],
  })

  // Create categories
  const electronics = await prisma.category.create({
    data: {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Latest gadgets and electronic devices',
    },
  })

  const fashion = await prisma.category.create({
    data: {
      name: 'Fashion',
      slug: 'fashion',
      description: 'Trendy clothing and accessories',
    },
  })

  const homeGarden = await prisma.category.create({
    data: {
      name: 'Home & Garden',
      slug: 'home-garden',
      description: 'Everything for your home',
    },
  })

  // Create products
  const products = [
    {
      name: 'Wireless Headphones Pro',
      slug: 'wireless-headphones-pro',
      description: 'Premium wireless headphones with noise cancellation',
      price: 29999,
      sku: 'WHP-001',
      stockQuantity: 50,
      categoryId: electronics.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', alt: 'Headphones' },
      ],
    },
    {
      name: 'Minimalist Watch',
      slug: 'minimalist-watch',
      description: 'Elegant minimalist watch with leather strap',
      price: 19999,
      sku: 'MW-001',
      stockQuantity: 30,
      categoryId: fashion.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', alt: 'Watch' },
      ],
    },
    {
      name: 'Premium Backpack',
      slug: 'premium-backpack',
      description: 'Durable backpack with multiple compartments',
      price: 14999,
      sku: 'PB-001',
      stockQuantity: 25,
      categoryId: fashion.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', alt: 'Backpack' },
      ],
    },
    {
      name: 'Smart Speaker',
      slug: 'smart-speaker',
      description: 'Voice-controlled smart speaker with premium sound',
      price: 9999,
      sku: 'SS-001',
      stockQuantity: 100,
      categoryId: electronics.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=400', alt: 'Speaker' },
      ],
    },
  ]

  for (const product of products) {
    const created = await prisma.product.create({
      data: {
        ...product,
        images: {
          create: product.images,
        },
      },
    })
    console.log(`Created product: ${created.name}`)
  }

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
