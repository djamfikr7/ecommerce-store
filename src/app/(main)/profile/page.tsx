'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Avatar } from '@/components/ui/avatar'
import { ProfileForm } from '@/components/profile/profile-form'
import { PasswordChange } from '@/components/profile/password-change'
import { getSessionAction } from '@/lib/actions/auth'
import { MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface UserData {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  phone?: string | null
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      try {
        const session = await getSessionAction()
        if (!session?.user) {
          router.push('/login')
          return
        }
        setUser(session.user as UserData)
      } catch (error) {
        console.error('Failed to load user data')
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-accent-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mx-auto w-full max-w-4xl space-y-6"
    >
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-6"
      >
        <Avatar
          src={user.image || null}
          alt={user.name || 'User'}
          fallback={user.name || user.email || 'U'}
          size="xl"
        />
        <div className="flex-1">
          <h1 className="gradient-text text-3xl font-bold">{user.name || 'User'}</h1>
          <p className="mt-1 text-slate-400">{user.email}</p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => router.push('/profile/addresses')}
        >
          <MapPin className="h-4 w-4" />
          Manage Addresses
        </Button>
      </motion.div>

      {/* Profile Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <ProfileForm user={user} onUserUpdate={setUser} />
      </motion.div>

      {/* Password Change */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <PasswordChange userId={user.id} />
      </motion.div>
    </motion.div>
  )
}
