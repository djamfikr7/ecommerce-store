import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Container } from '@/components/ui/container'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Product3DButton } from '@/components/design-system/button-3d'

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

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <Container className="flex-1 py-12">
        {/* Hero Section */}
        <section className="relative py-20 mb-16">
          <div className="text-center max-w-3xl mx-auto animate-fade-in-up">
            <Badge variant="default" className="mb-4">
              New Collection Available
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">Discover</span> the Future of
              Shopping
            </h1>
            <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
              Experience a stunning e-commerce platform with dark neomorphic design,
              3D animations, and seamless checkout.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Product3DButton href="/products">
                Shop Now
              </Product3DButton>
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Featured Products</h2>
            <Link href="/products">
              <Button variant="ghost">View All</Button>
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
                      <span className="text-xl font-bold text-accent-primary">
                        {formatPrice(product.price)}
                      </span>
                      <Button size="sm" variant="ghost">
                        Add to Cart
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
            Why Choose Us
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card hoverable className="text-center p-8">
              <CardHeader>
                <CardTitle>Dark Neomorphic Design</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-400">
                Stunning visual experience with 3D animated buttons,
                soft shadows, and gradient backgrounds.
              </CardContent>
            </Card>
            <Card hoverable className="text-center p-8">
              <CardHeader>
                <CardTitle>Secure Payments</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-400">
                Industry-standard Stripe integration for safe and
                reliable payment processing.
              </CardContent>
            </Card>
            <Card hoverable className="text-center p-8">
              <CardHeader>
                <CardTitle>Multi-Currency</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-400">
                Shop in your preferred currency with real-time
                exchange rates and localization support.
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="neo-card p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Shopping?
          </h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            Join thousands of satisfied customers and experience the
            best in e-commerce.
          </p>
          <Product3DButton href="/products" size="lg">
            Browse Products
          </Product3DButton>
        </section>
      </Container>

      <Footer />
    </div>
  )
}
