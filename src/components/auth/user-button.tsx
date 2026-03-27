'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Package, Heart, Settings, LogOut, ChevronDown, Shield } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MenuItemProps {
  href?: string
  icon: React.ReactNode
  label: string
  onClick?: () => void
  variant?: 'default' | 'danger'
}

function MenuItem({ href, icon, label, onClick, variant = 'default' }: MenuItemProps) {
  const content = (
    <>
      <span className="text-slate-400">{icon}</span>
      <span className={cn(variant === 'danger' && 'text-accent-danger')}>{label}</span>
    </>
  )

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          'flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300',
          'hover:bg-surface-overlay hover:text-white',
          'rounded-lg transition-colors'
        )}
      >
        {content}
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300',
        'hover:bg-surface-overlay hover:text-white',
        'rounded-lg transition-colors',
        variant === 'danger' && 'text-accent-danger hover:bg-accent-danger/10'
      )}
    >
      {content}
    </button>
  )
}

export function UserButton() {
  const { data: session, status } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const user = session?.user
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  if (status === 'loading') {
    return (
      <div className="h-10 w-10 neo-raised rounded-full animate-pulse" />
    )
  }

  if (!session) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login">
          <Button variant="ghost" size="sm">
            Sign In
          </Button>
        </Link>
        <Link href="/register">
          <Button variant="default" size="sm">
            Register
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 p-1.5 pr-3',
          'neo-raised rounded-full',
          'hover:neo-glow transition-all duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary'
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Avatar
          src={user?.image}
          alt={user?.name || 'User'}
          fallback={user?.name || user?.email || 'U'}
          size="sm"
        />
        <span className="hidden sm:block text-sm font-medium text-slate-200 max-w-[120px] truncate">
          {user?.name || user?.email?.split('@')[0]}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-slate-400 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              'absolute right-0 mt-2 w-64',
              'neo-card p-2',
              'z-50'
            )}
          >
            {/* User info header */}
            <div className="px-4 py-3 border-b border-border-subtle mb-2">
              <p className="text-sm font-medium text-slate-100 truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>

            {/* Menu items */}
            <div className="space-y-1">
              <MenuItem href="/profile" icon={<User className="h-4 w-4" />} label="Profile" />
              <MenuItem href="/profile/orders" icon={<Package className="h-4 w-4" />} label="My Orders" />
              <MenuItem href="/wishlist" icon={<Heart className="h-4 w-4" />} label="Wishlist" />

              {isAdmin && (
                <MenuItem href="/admin" icon={<Shield className="h-4 w-4" />} label="Admin Dashboard" />
              )}

              <div className="border-t border-border-subtle my-2 pt-2">
                <MenuItem
                  href="/settings"
                  icon={<Settings className="h-4 w-4" />}
                  label="Settings"
                />
                <MenuItem
                  icon={<LogOut className="h-4 w-4" />}
                  label="Sign Out"
                  variant="danger"
                  onClick={handleSignOut}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
