import Link from 'next/link'
import { motion } from 'framer-motion'
import { Home, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl text-center"
      >
        <div className="rounded-3xl bg-gray-900/50 p-12 shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(255,255,255,0.02)]">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mb-8"
          >
            <h1 className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-9xl font-bold text-transparent">
              404
            </h1>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <h2 className="mb-4 text-3xl font-bold text-white">Page not found</h2>
            <p className="mb-8 text-lg text-gray-400">
              The page you're looking for doesn't exist or has been moved.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/">
                <Button variant="default" size="lg" className="w-full sm:w-auto">
                  <Home className="h-5 w-5" aria-hidden="true" />
                  Go home
                </Button>
              </Link>
              <Link href="/shop">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  <Search className="h-5 w-5" aria-hidden="true" />
                  Browse products
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
