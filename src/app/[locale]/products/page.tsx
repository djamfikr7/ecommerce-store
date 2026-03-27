'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Search, Filter, Grid, List, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormattedPrice, CompactPrice } from '@/components/currency/formatted-price'
import { Container } from '@/components/ui/container'

// Sample products data
const allProducts = [
  { id: '1', name: 'Wireless Headphones Pro', price: 29999, category: 'Electronics', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', badge: 'Best Seller', rating: 4.8 },
  { id: '2', name: 'Minimalist Watch', price: 19999, category: 'Accessories', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', badge: 'New', rating: 4.6 },
  { id: '3', name: 'Premium Backpack', price: 14999, category: 'Fashion', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', badge: null, rating: 4.7 },
  { id: '4', name: 'Smart Speaker', price: 9999, category: 'Electronics', image: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=400', badge: 'Sale', rating: 4.5 },
  { id: '5', name: 'Leather Wallet', price: 4999, category: 'Accessories', image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400', badge: null, rating: 4.4 },
  { id: '6', name: 'Running Shoes', price: 12999, category: 'Fashion', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', badge: 'New', rating: 4.9 },
  { id: '7', name: 'Laptop Stand', price: 7999, category: 'Electronics', image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400', badge: null, rating: 4.3 },
  { id: '8', name: 'Sunglasses', price: 8999, category: 'Accessories', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400', badge: 'Sale', rating: 4.6 },
]

const categories = ['All', 'Electronics', 'Accessories', 'Fashion']
const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Best Rating' },
]

export default function ProductsPage() {
  const t = useTranslations()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('featured')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Filter and sort products
  let filteredProducts = allProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (sortBy === 'price-low') {
    filteredProducts = [...filteredProducts].sort((a, b) => a.price - b.price)
  } else if (sortBy === 'price-high') {
    filteredProducts = [...filteredProducts].sort((a, b) => b.price - a.price)
  } else if (sortBy === 'rating') {
    filteredProducts = [...filteredProducts].sort((a, b) => b.rating - a.rating)
  }

  return (
    <div className="min-h-screen">
      <Container className="py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">
            {t('nav.products')}
          </h1>
          <p className="text-slate-400">
            {filteredProducts.length} {t('cart.items').toLowerCase()}
          </p>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="flex-1">
            <Input
              placeholder={t('common.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
              className="w-full"
            />
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('common.sort')} />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View Mode Toggle */}
          <div className="flex gap-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-400 text-lg">{t('cart.empty')}</p>
          </div>
        ) : (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }>
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card
                  className="group cursor-pointer overflow-hidden"
                  hoverable
                >
                  <CardContent className={viewMode === 'list' ? 'flex gap-6 p-4' : 'p-0'}>
                    <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-48 h-32' : 'aspect-square'}`}>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
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
                    <div className={`p-4 ${viewMode === 'list' ? 'flex-1 flex items-center' : ''}`}>
                      <p className="text-sm text-slate-500 mb-1">{product.category}</p>
                      <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-yellow-400">{'*'.repeat(Math.round(product.rating))}</span>
                        <span className="text-xs text-slate-500">({product.rating})</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <CompactPrice amountCents={product.price} />
                        <Button size="sm" variant="ghost">
                          {t('common.addToCart')}
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
