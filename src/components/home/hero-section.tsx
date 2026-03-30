'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, ShoppingBag, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      {/* Animated gradient background */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 50% 80%, rgba(99, 102, 241, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.3) 0%, transparent 50%)',
            ],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      <div className="container-neo">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="neo-raised-sm inline-flex items-center gap-2 rounded-full px-4 py-2"
            >
              <Sparkles className="h-4 w-4 text-accent-primary" />
              <span className="text-sm font-medium text-slate-300">New Collection Available</span>
            </motion.div>

            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl font-bold leading-tight md:text-6xl lg:text-7xl"
              >
                <span className="gradient-text">Discover</span>
                <br />
                Your Style
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="max-w-xl text-lg text-slate-400 md:text-xl"
              >
                Explore our curated collection of premium products. From fashion to electronics,
                find everything you need in one place.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-4"
            >
              <Link href="/products">
                <Button size="lg" className="group">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>

              <Link href="/products?sort=trending">
                <Button size="lg" variant="outline">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Trending Products
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-6 pt-8"
            >
              <div className="space-y-1">
                <div className="text-gradient text-3xl font-bold">10K+</div>
                <div className="text-sm text-slate-400">Products</div>
              </div>
              <div className="space-y-1">
                <div className="text-gradient text-3xl font-bold">50K+</div>
                <div className="text-sm text-slate-400">Customers</div>
              </div>
              <div className="space-y-1">
                <div className="text-gradient text-3xl font-bold">4.9</div>
                <div className="text-sm text-slate-400">Rating</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right content - 3D floating cards */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative h-[600px]">
              {/* Floating card 1 */}
              <motion.div
                animate={{
                  y: [0, -20, 0],
                  rotate: [-2, 2, -2],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="neo-card from-accent-primary/20 to-accent-secondary/20 absolute right-0 top-0 h-80 w-64 bg-gradient-to-br p-6"
              >
                <div className="flex h-full flex-col justify-between">
                  <div className="space-y-2">
                    <div className="neo-raised-sm bg-accent-primary/30 flex h-12 w-12 items-center justify-center rounded-xl">
                      <ShoppingBag className="h-6 w-6 text-accent-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">Premium Quality</h3>
                    <p className="text-sm text-slate-400">
                      Handpicked products from trusted brands
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Floating card 2 */}
              <motion.div
                animate={{
                  y: [0, 20, 0],
                  rotate: [2, -2, 2],
                }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.5,
                }}
                className="neo-card from-accent-secondary/20 to-accent-info/20 absolute bottom-20 left-0 h-80 w-64 bg-gradient-to-br p-6"
              >
                <div className="flex h-full flex-col justify-between">
                  <div className="space-y-2">
                    <div className="neo-raised-sm bg-accent-secondary/30 flex h-12 w-12 items-center justify-center rounded-xl">
                      <Sparkles className="h-6 w-6 text-accent-secondary" />
                    </div>
                    <h3 className="text-xl font-semibold">Fast Delivery</h3>
                    <p className="text-sm text-slate-400">
                      Get your orders delivered within 2-3 days
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Floating card 3 */}
              <motion.div
                animate={{
                  y: [0, -15, 0],
                  rotate: [1, -1, 1],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 1,
                }}
                className="neo-card from-accent-info/20 to-accent-success/20 absolute left-20 top-40 h-48 w-48 bg-gradient-to-br p-4"
              >
                <div className="flex h-full flex-col items-center justify-center space-y-2 text-center">
                  <div className="text-gradient text-4xl font-bold">24/7</div>
                  <p className="text-sm text-slate-400">Customer Support</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
