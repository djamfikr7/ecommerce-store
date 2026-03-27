'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { ArrowLeft, Minus, Plus, Heart, Share2, Truck, Shield, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Container } from '@/components/ui/container'
import { FormattedPrice, LargePrice, OriginalPrice } from '@/components/currency/formatted-price'

// Sample product data
const sampleProduct = {
  id: '1',
  name: 'Wireless Headphones Pro',
  slug: 'wireless-headphones-pro',
  price: 29999,
  originalPrice: 39999,
  description: 'Experience premium sound quality with our Wireless Headphones Pro. Featuring active noise cancellation, 30-hour battery life, and ultra-comfortable memory foam ear cushions. Perfect for music lovers, gamers, and professionals who demand the best audio experience.',
  specifications: [
    { label: 'Driver Size', value: '40mm' },
    { label: 'Frequency Response', value: '20Hz - 20kHz' },
    { label: 'Battery Life', value: '30 hours' },
    { label: 'Charging', value: 'USB-C, 15min = 3hr' },
    { label: 'Connectivity', value: 'Bluetooth 5.2' },
    { label: 'Weight', value: '250g' },
  ],
  category: 'Electronics',
  image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
  images: [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
    'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800',
  ],
  rating: 4.8,
  reviews: 1247,
  inStock: true,
  badge: 'Best Seller',
}

const relatedProducts = [
  { id: '2', name: 'Wireless Earbuds', price: 14999, image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400' },
  { id: '3', name: 'Bluetooth Speaker', price: 7999, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400' },
  { id: '4', name: 'Audio Cable', price: 1999, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400' },
]

export default function ProductDetailPage() {
  const t = useTranslations()
  const params = useParams()
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)

  const product = sampleProduct // In real app, fetch by slug

  const incrementQuantity = () => setQuantity(q => Math.min(q + 1, 10))
  const decrementQuantity = () => setQuantity(q => Math.max(q - 1, 1))

  return (
    <div className="min-h-screen">
      <Container className="py-8">
        {/* Back Link */}
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </Link>

        {/* Product Section */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Images */}
          <div className="space-y-4">
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="aspect-square rounded-2xl overflow-hidden neo-raised"
            >
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </motion.div>
            <div className="flex gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index
                      ? 'border-accent-primary'
                      : 'border-transparent hover:border-white/20'
                  }`}
                >
                  <img src={image} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              {product.badge && (
                <Badge variant="default" className="mb-3">
                  {product.badge}
                </Badge>
              )}
              <p className="text-slate-500 mb-2">{product.category}</p>
              <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-lg ${
                        i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-slate-600'
                      }`}
                    >
                      *
                    </span>
                  ))}
                </div>
                <span className="text-slate-400">
                  {product.rating} ({product.reviews} {t('product.reviews')})
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-4">
                <LargePrice amountCents={product.price} />
                <OriginalPrice amountCents={product.originalPrice} />
              </div>
              <p className="text-sm text-green-400">
                {Math.round((1 - product.price / product.originalPrice) * 100)}% off
              </p>
            </div>

            {/* Description */}
            <p className="text-slate-400 leading-relaxed">
              {product.description}
            </p>

            {/* Quantity */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-300">
                {t('product.quantity')}
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center neo-raised rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={incrementQuantity}
                    disabled={quantity >= 10}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-sm text-slate-500">
                  {product.inStock ? t('product.inStock') : t('product.outOfStock')}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button size="lg" className="flex-1">
                {t('product.addToCart')}
              </Button>
              <Button size="lg" variant="outline">
                {t('product.buyNow')}
              </Button>
              <Button size="lg" variant="ghost" size="icon">
                <Heart className="h-5 w-5" />
              </Button>
              <Button size="lg" variant="ghost" size="icon">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
              <div className="flex flex-col items-center text-center gap-2">
                <Truck className="h-5 w-5 text-accent-primary" />
                <span className="text-xs text-slate-400">Free Shipping</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <Shield className="h-5 w-5 text-accent-primary" />
                <span className="text-xs text-slate-400">2 Year Warranty</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <RotateCcw className="h-5 w-5 text-accent-primary" />
                <span className="text-xs text-slate-400">30 Day Returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle>{t('product.specifications')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {product.specifications.map((spec) => (
                <div key={spec.label} className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-slate-400">{spec.label}</span>
                  <span className="font-medium">{spec.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Related Products */}
        <section>
          <h2 className="text-2xl font-bold mb-6">{t('product.relatedProducts')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((item) => (
              <Card key={item.id} className="group cursor-pointer" hoverable>
                <CardContent className="p-0">
                  <div className="aspect-square overflow-hidden rounded-t-xl">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">{item.name}</h3>
                    <CompactPrice amountCents={item.price} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </Container>
    </div>
  )
}
