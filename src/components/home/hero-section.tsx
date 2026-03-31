'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, ShoppingBag, TrendingUp, Zap, Shield, Truck } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Button3D } from '@/components/ui/button-3d'

const floatingCards = [
  {
    icon: ShoppingBag,
    title: 'Premium Quality',
    description: 'Handpicked products from trusted brands worldwide',
    gradient: 'from-accent-primary/20 to-accent-secondary/20',
    iconBg: 'bg-accent-primary/30',
    iconColor: 'text-accent-primary',
    yRange: [0, -20, 0],
    rotateRange: [-2, 2, -2],
    duration: 6,
    position: 'right-0 top-0',
    size: 'h-72 w-56',
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Get your orders delivered within 2-3 business days',
    gradient: 'from-accent-secondary/20 to-accent-info/20',
    iconBg: 'bg-accent-secondary/30',
    iconColor: 'text-accent-secondary',
    yRange: [0, 20, 0],
    rotateRange: [2, -2, 2],
    duration: 7,
    delay: 0.5,
    position: 'bottom-16 left-0',
    size: 'h-72 w-56',
  },
  {
    icon: Zap,
    title: '24/7 Support',
    description: 'Round-the-clock customer assistance',
    gradient: 'from-accent-info/20 to-accent-success/20',
    iconBg: 'bg-accent-info/30',
    iconColor: 'text-accent-info',
    yRange: [0, -15, 0],
    rotateRange: [1, -1, 1],
    duration: 5,
    delay: 1,
    position: 'left-16 top-44',
    size: 'h-44 w-44',
    centered: true,
  },
]

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
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
                <Button3D size="lg">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button3D>
              </Link>

              <Link href="/products?sort=trending">
                <Button size="lg" variant="outline">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Trending Products
                </Button>
              </Link>
            </motion.div>

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

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative h-[580px]">
              {floatingCards.map((card) => (
                <motion.div
                  key={card.title}
                  animate={{
                    y: card.yRange,
                    rotate: card.rotateRange,
                  }}
                  transition={{
                    duration: card.duration,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: card.delay ?? 0,
                  }}
                  className={`neo-card bg-gradient-to-br ${card.gradient} absolute ${card.position} ${card.size} p-6`}
                >
                  <div
                    className={`flex h-full flex-col ${card.centered ? 'items-center justify-center text-center' : 'justify-between'} space-y-2`}
                  >
                    {card.centered ? (
                      <>
                        <div className="text-gradient text-4xl font-bold">
                          <card.icon className="mb-2 h-10 w-10 text-accent-info" />
                        </div>
                        <div>
                          <div className="text-gradient text-3xl font-bold">24/7</div>
                          <p className="text-sm text-slate-400">{card.title}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <div
                            className={`neo-raised-sm flex h-12 w-12 items-center justify-center rounded-xl ${card.iconBg}`}
                          >
                            <card.icon className={`h-6 w-6 ${card.iconColor}`} />
                          </div>
                          <h3 className="text-xl font-semibold">{card.title}</h3>
                          <p className="text-sm text-slate-400">{card.description}</p>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}

              <motion.div
                animate={{
                  y: [0, -10, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                <div className="neo-card from-accent-primary/10 to-accent-secondary/10 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br">
                  <Shield className="h-12 w-12 text-accent-primary" />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
