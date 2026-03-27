'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'

export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Product page error:', error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-16">
      <Container>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="neo-card p-12 text-center max-w-lg mx-auto"
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent-danger/20 neo-raised flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-accent-danger" />
          </div>

          <h2 className="text-2xl font-bold text-slate-100 mb-2">Product not found</h2>

          <p className="text-slate-400 mb-6">
            This product may have been removed or the link is incorrect. Please check the URL or browse our catalog.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={reset}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Link href="/products">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Products
              </Button>
            </Link>
          </div>
        </motion.div>
      </Container>
    </div>
  )
}
