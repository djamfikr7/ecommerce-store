'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AddressForm } from '@/components/profile/address-form'
import { AddressList } from '@/components/profile/address-list'
import { getAddressesAction, getSessionAction } from '@/lib/actions/auth'
import type { Address as DBAddress } from '@/types/auth'

type AddressType = 'SHIPPING' | 'BILLING' | 'BOTH'

interface Address {
  id: string
  type: AddressType
  firstName: string
  lastName: string
  addressLine1: string
  addressLine2?: string | null
  city: string
  state?: string | null
  postalCode: string
  country: string
  phone?: string | null
  isDefault: boolean
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAddresses()
  }, [])

  const loadAddresses = async () => {
    try {
      const session = await getSessionAction()
      if (session?.user?.id) {
        setUserId(session.user.id)
        const userAddresses = await getAddressesAction(session.user.id)
        const mappedAddresses: Address[] = userAddresses.map((addr: DBAddress) => ({
          id: addr.id,
          type: addr.type as AddressType,
          firstName: addr.firstName,
          lastName: addr.lastName,
          addressLine1: addr.addressLine1,
          addressLine2: addr.addressLine2,
          city: addr.city,
          state: addr.state,
          postalCode: addr.postalCode,
          country: addr.country,
          phone: addr.phone,
          isDefault: addr.isDefault,
        }))
        setAddresses(mappedAddresses)
      }
    } catch (error) {
      console.error('Failed to load addresses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (address: Address) => {
    setEditingAddress(address)
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingAddress(null)
  }

  const handleSuccess = async () => {
    await loadAddresses()
    handleCancel()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="gradient-text mb-2 text-3xl font-bold">Addresses</h1>
            <p className="text-slate-400">Manage your shipping and billing addresses</p>
          </div>
          {!showForm && (
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Address
            </Button>
          )}
        </div>

        {/* Add/Edit Form */}
        <AnimatePresence>
          {showForm && userId && (
            <AddressForm
              userId={userId}
              editingAddress={editingAddress}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          )}
        </AnimatePresence>

        {/* Addresses List */}
        {userId && (
          <AddressList
            addresses={addresses}
            userId={userId}
            onEdit={handleEdit}
            onAdd={() => setShowForm(true)}
            onRefresh={loadAddresses}
            showForm={showForm}
          />
        )}
      </div>
    </div>
  )
}
