'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Container } from '@/components/ui/container'
import { Product3DButton } from '@/components/design-system/button-3d'
import { FormattedPrice } from '@/components/currency/formatted-price'

// Sample products for demo
const featuredProducts = [
  {
    id: '1',
    name: 'Wireless Headphones Pro',
    price: 29999, // cents
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    badge: 'Best Seller',
  },
  {
    id: '2',
    name: 'Minimalist Watch',
    price: 19999,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    badge: 'New',
  },
  {
    id: '3',
    name: 'Premium Backpack',
    price: 14999,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
    badge: null,
  },
  {
    id: '4',
    name: 'Smart Speaker',
    price: 9999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=400',
    badge: 'Sale',
  },
]

export default function LocalizedHomePage() {
  const t = useTranslations()

  return (
    <div className="min-h-screen flex flex-col">
      <Container className="flex-1 py-12">
        {/* Hero Section */}
        <section className="relative py-20 mb-16">
          <div className="text-center max-w-3xl mx-auto animate-fade-in-up">
            <Badge variant="default" className="mb-4">
              {t('home.featured.badge')}
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">{t('common.shop')}</span> {t('home.hero.title')}
            </h1>
            <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
              {t('home.hero.subtitle')}
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Product3DButton href="/products">
                {t('common.shop')}
              </Product3DButton>
              <Button variant="outline" size="lg">
                {t('common.learnMore')}
              </Button>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">{t('home.featured.title')}</h2>
            <Link href="/products">
              <Button variant="ghost">{t('common.viewAll')}</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => (
              <Card
                key={product.id}
                className="group cursor-pointer"
                hoverable
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-0">
                  <div className="relative aspect-square overflow-hidden rounded-t-xl">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-300
                                 group-hover:scale-105"
                    />
                    {product.badge && (
                      <Badge
                        variant={product.badge === 'Sale' ? 'danger' : 'default'}
                        className="absolute top-3 left-3"
                      >
                        {product.badge}
                      </Badge>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-slate-500 mb-1">
                      {product.category}
                    </p>
                    <h3 className="font-semibold text-lg mb-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <FormattedPrice
                        amountCents={product.price}
                        className="text-xl font-bold text-accent-primary"
                      />
                      <Button size="sm" variant="ghost">
                        {t('common.addToCart')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t('home.features.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card hoverable className="text-center p-8">
              <CardHeader>
                <CardTitle>{t('home.features.designTitle')}</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-400">
                {t('home.features.designDesc')}
              </CardContent>
            </Card>
            <Card hoverable className="text-center p-8">
              <CardHeader>
                <CardTitle>{t('home.features.paymentsTitle')}</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-400">
                {t('home.features.paymentsDesc')}
              </CardContent>
            </Card>
            <Card hoverable className="text-center p-8">
              <CardHeader>
                <CardTitle>{t('home.features.currencyTitle')}</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-400">
                {t('home.features.currencyDesc')}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="neo-card p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {t('home.cta.title')}
          </h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            {t('home.cta.subtitle')}
          </p>
          <Product3DButton href="/products" size="lg">
            {t('home.cta.button')}
          </Product3DButton>
        </section>
      </Container>
    </div>
  )
}
