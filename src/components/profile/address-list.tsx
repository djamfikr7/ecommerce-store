'use client'

import { useTransition } from 'react'
import { motion } from 'framer-motion'
import { Edit2, Trash2, MapPin, Check, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { removeAddressAction, setDefaultAddressAction } from '@/lib/actions/auth'
import { useNotificationStore } from '@/lib/stores/notification-store'

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

interface AddressListProps {
  addresses: Address[]
  userId: string
  onEdit: (address: Address) => void
  onAdd: () => void
  onRefresh: () => void
  showForm: boolean
}

export function AddressList({
  addresses,
  userId,
  onEdit,
  onAdd,
  onRefresh,
  showForm,
}: AddressListProps) {
  const addToast = useNotificationStore((state) => state.addToast)
  const [isPending, startTransition] = useTransition()

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return

    startTransition(async () => {
      try {
        const result = await removeAddressAction(id, userId)
        if (result.success) {
          addToast({
            type: 'success',
            title: 'Address Deleted',
            message: 'Address has been deleted successfully',
          })
          onRefresh()
        } else {
          addToast({
            type: 'error',
            title: 'Error',
            message: result.error || 'Failed to delete address',
          })
        }
      } catch (error) {
        addToast({ type: 'error', title: 'Error', message: 'An error occurred. Please try again.' })
      }
    })
  }

  const handleSetDefault = async (id: string) => {
    startTransition(async () => {
      try {
        const result = await setDefaultAddressAction(id, userId)
        if (result.success) {
          addToast({
            type: 'success',
            title: 'Default Address Set',
            message: 'Default address has been updated',
          })
          onRefresh()
        } else {
          addToast({
            type: 'error',
            title: 'Error',
            message: result.error || 'Failed to set default address',
          })
        }
      } catch (error) {
        addToast({ type: 'error', title: 'Error', message: 'An error occurred. Please try again.' })
      }
    })
  }

  if (addresses.length === 0) {
    return (
      <Card className="py-16 text-center">
        <CardContent>
          <div className="mb-6 text-6xl">
            <MapPin className="mx-auto h-16 w-16 text-slate-600" />
          </div>
          <h2 className="mb-2 text-2xl font-bold">No addresses yet</h2>
          <p className="mb-8 text-slate-400">Add a shipping address to make checkout faster.</p>
          {!showForm && (
            <Button onClick={onAdd} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Address
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {addresses.map((address, index) => (
        <motion.div
          key={address.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <Card hoverable className="h-full">
            <CardContent className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {address.type}
                  </Badge>
                  {address.isDefault && (
                    <Badge variant="default" className="text-xs">
                      Default
                    </Badge>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onEdit(address)}
                    disabled={isPending}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-accent-danger hover:text-accent-danger"
                    onClick={() => handleDelete(address.id)}
                    disabled={isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mb-4 space-y-1 text-slate-300">
                <p className="font-medium text-slate-100">
                  {address.firstName} {address.lastName}
                </p>
                <p>{address.addressLine1}</p>
                {address.addressLine2 && <p>{address.addressLine2}</p>}
                <p>
                  {address.city}, {address.state} {address.postalCode}
                </p>
                <p>{address.country}</p>
                {address.phone && <p className="text-slate-400">{address.phone}</p>}
              </div>

              {!address.isDefault && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => handleSetDefault(address.id)}
                  disabled={isPending}
                >
                  <Check className="h-4 w-4" />
                  Set as Default
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
