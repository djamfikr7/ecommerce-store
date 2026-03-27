'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, ShoppingCart, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FormattedPrice } from '@/components/currency/formatted-price'
import { Container } from '@/components/ui/container'

const sampleWishlist = [
  {
    id: '1',
    name: 'Wireless Headphones Pro',
    price: 29999,
    originalPrice: 39999,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    inStock: true,
    rating: 4.8,
  },
  {
    id: '2',
    name: 'Premium Backpack',
    price: 14999,
    originalPrice: null,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
    inStock: true,
    rating: 4.7,
  },
  {
    id: '3',
    name: 'Smart Watch',
    price: 49999,
    originalPrice: 59999,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    inStock: false,
    rating: 4.9,
  },
]

export default function WishlistPage() {
  const t = useTranslations()

  return (
    <div className="min-h-screen">
      <Container className="py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">{t('wishlist.title')}</h1>
          <p className="text-slate-400">
            {sampleWishlist.length} {sampleWishlist.length === 1 ? 'item' : 'items'}
          </p>
        </div>

        {/* Wishlist Grid */}
        {sampleWishlist.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <div className="text-6xl mb-6">
                <Heart className="w-16 h-16 mx-auto text-slate-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">{t('wishlist.empty')}</h2>
              <p className="text-slate-400 mb-8">{t('wishlist.emptyDesc')}</p>
              <Link href="/products">
                <Button size="lg">{t('common.shop')}</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sampleWishlist.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="group" hoverable>
                  <CardContent className="p-0">
                    <div className="relative aspect-square overflow-hidden rounded-t-xl">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute top-3 right-3 flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-full bg-black/50 backdrop-blur-sm hover:bg-red-500/50 hover:text-white"
                          aria-label="Remove from wishlist"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {!item.inStock && (
                        <Badge variant="danger" className="absolute top-3 left-3">
                          Out of Stock
                        </Badge>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-yellow-400 mb-1">
                        {'*'.repeat(Math.round(item.rating))} ({item.rating})
                      </p>
                      <h3 className="font-semibold mb-2 line-clamp-1">{item.name}</h3>
                      <div className="flex items-center gap-2 mb-4">
                        <FormattedPrice amountCents={item.price} className="font-bold text-accent-primary" />
                        {item.originalPrice && (
                          <FormattedPrice
                            amountCents={item.originalPrice}
                            className="text-sm text-slate-500 line-through"
                          />
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 gap-2"
                          disabled={!item.inStock}
                        >
                          <ShoppingCart className="h-4 w-4" />
                          {t('wishlist.moveToCart')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </Container>
    </div>
  )
}
