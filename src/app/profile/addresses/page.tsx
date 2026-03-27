'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Check,
  X,
  Building,
  Phone
} from 'lucide-react'
import {
  addressSchema,
  type AddressInput,
  type UpdateAddressInput
} from '@/lib/validators/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FormError } from '@/components/auth/form-error'
import { cn } from '@/lib/utils'

interface Address {
  id: string
  type: 'SHIPPING' | 'BILLING' | 'BOTH'
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

// Mock addresses for demo
const mockAddresses: Address[] = [
  {
    id: '1',
    type: 'BOTH',
    firstName: 'John',
    lastName: 'Doe',
    addressLine1: '123 Main Street',
    addressLine2: 'Apt 4B',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: 'US',
    phone: '+1234567890',
    isDefault: true,
  },
  {
    id: '2',
    type: 'SHIPPING',
    firstName: 'John',
    lastName: 'Doe',
    addressLine1: '456 Work Avenue',
    addressLine2: null,
    city: 'Los Angeles',
    state: 'CA',
    postalCode: '90001',
    country: 'US',
    phone: null,
    isDefault: false,
  },
]

type AddressFormData = AddressInput

interface AddressFormProps {
  address?: Address | null
  onSubmit: (data: AddressFormData) => Promise<void>
  onCancel: () => void
}

function AddressForm({ address, onSubmit, onCancel }: AddressFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: address || {
      type: 'BOTH',
      firstName: '',
      lastName: '',
      addressLine1: '',
      addressLine2: null,
      city: '',
      state: null,
      postalCode: '',
      country: 'US',
      phone: null,
      isDefault: false,
    },
  })

  const handleFormSubmit = async (data: AddressFormData) => {
    setIsSubmitting(true)
    setError(null)
    try {
      await onSubmit(data)
    } catch (err) {
      setError('Failed to save address. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="neo-inset p-4 rounded-lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {error && <FormError message={error} onDismiss={() => setError(null)} />}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="firstName" className="text-sm font-medium text-slate-300">
              First Name
            </label>
            <Input
              id="firstName"
              {...register('firstName')}
              error={errors.firstName?.message}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="lastName" className="text-sm font-medium text-slate-300">
              Last Name
            </label>
            <Input
              id="lastName"
              {...register('lastName')}
              error={errors.lastName?.message}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="addressLine1" className="text-sm font-medium text-slate-300">
            Address Line 1
          </label>
          <Input
            id="addressLine1"
            placeholder="Street address"
            {...register('addressLine1')}
            error={errors.addressLine1?.message}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="addressLine2" className="text-sm font-medium text-slate-300">
            Address Line 2
          </label>
          <Input
            id="addressLine2"
            placeholder="Apartment, suite, etc."
            {...register('addressLine2')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="city" className="text-sm font-medium text-slate-300">
              City
            </label>
            <Input
              id="city"
              {...register('city')}
              error={errors.city?.message}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="state" className="text-sm font-medium text-slate-300">
              State
            </label>
            <Input
              id="state"
              {...register('state')}
              error={errors.state?.message}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="postalCode" className="text-sm font-medium text-slate-300">
              Postal Code
            </label>
            <Input
              id="postalCode"
              {...register('postalCode')}
              error={errors.postalCode?.message}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="country" className="text-sm font-medium text-slate-300">
              Country
            </label>
            <Input
              id="country"
              {...register('country')}
              error={errors.country?.message}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium text-slate-300">
            Phone
          </label>
          <Input
            id="phone"
            type="tel"
            placeholder="+1234567890"
            {...register('phone')}
            error={errors.phone?.message}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isDefault"
            {...register('isDefault')}
            className="h-4 w-4 rounded border-slate-500 bg-surface-base text-accent-primary focus:ring-accent-primary"
          />
          <label htmlFor="isDefault" className="text-sm text-slate-300">
            Set as default address
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {address ? 'Update' : 'Add'} Address
          </Button>
        </div>
      </form>
    </motion.div>
  )
}

export default function AddressesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [addresses, setAddresses] = useState<Address[]>(mockAddresses)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!session) {
    router.push('/login?callbackUrl=/profile/addresses')
    return null
  }

  const handleAddAddress = async (data: AddressInput) => {
    const newAddress: Address = {
      ...data,
      id: Date.now().toString(),
    }

    if (data.isDefault) {
      setAddresses(prev =>
        prev.map(a => ({ ...a, isDefault: false })).concat(newAddress)
      )
    } else {
      setAddresses(prev => [...prev, newAddress])
    }

    setIsAddingNew(false)
  }

  const handleUpdateAddress = async (data: AddressInput) => {
    if (!editingId) return

    setAddresses(prev =>
      prev.map(a =>
        a.id === editingId
          ? { ...a, ...data }
          : data.isDefault ? { ...a, isDefault: false } : a
      )
    )

    setEditingId(null)
  }

  const handleDeleteAddress = (id: string) => {
    setAddresses(prev => prev.filter(a => a.id !== id))
  }

  const handleSetDefault = (id: string) => {
    setAddresses(prev =>
      prev.map(a => ({ ...a, isDefault: a.id === id }))
    )
  }

  return (
    <div className="container-neo py-8 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">My Addresses</h1>
            <p className="text-slate-400 mt-1">Manage your shipping and billing addresses</p>
          </div>
          {!isAddingNew && (
            <Button onClick={() => setIsAddingNew(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </Button>
          )}
        </div>

        {error && <FormError message={error} onDismiss={() => setError(null)} />}

        {/* Address List */}
        <div className="space-y-4">
          <AnimatePresence mode="sync">
            {addresses.map((address, index) => (
              <motion.div
                key={address.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.1 }}
              >
                {editingId === address.id ? (
                  <AddressForm
                    address={address}
                    onSubmit={handleUpdateAddress}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <Card hoverable className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-2 neo-raised rounded-lg">
                          <MapPin className="h-5 w-5 text-accent-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-slate-100">
                              {address.firstName} {address.lastName}
                            </p>
                            <Badge variant={address.type === 'BOTH' ? 'info' : address.type === 'SHIPPING' ? 'success' : 'warning'}>
                              {address.type}
                            </Badge>
                            {address.isDefault && (
                              <Badge variant="default">Default</Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-400">
                            {address.addressLine1}
                            {address.addressLine2 && `, ${address.addressLine2}`}
                          </p>
                          <p className="text-sm text-slate-400">
                            {address.city}, {address.state} {address.postalCode}
                          </p>
                          <p className="text-sm text-slate-400">
                            {address.country}
                          </p>
                          {address.phone && (
                            <p className="text-sm text-slate-400 mt-1 flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {address.phone}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!address.isDefault && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSetDefault(address.id)}
                            title="Set as default"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingId(address.id)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteAddress(address.id)}
                          className="text-accent-danger hover:text-accent-danger"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Add New Form */}
          {isAddingNew && (
            <AddressForm
              onSubmit={handleAddAddress}
              onCancel={() => setIsAddingNew(false)}
            />
          )}

          {/* Empty State */}
          {addresses.length === 0 && !isAddingNew && (
            <Card className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full neo-raised mb-4">
                <Building className="h-8 w-8 text-slate-500" />
              </div>
              <h3 className="text-lg font-medium text-slate-200 mb-2">
                No addresses yet
              </h3>
              <p className="text-slate-400 mb-4">
                Add a shipping or billing address to speed up your checkout
              </p>
              <Button onClick={() => setIsAddingNew(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Address
              </Button>
            </Card>
          )}
        </div>
      </motion.div>
    </div>
  )
}
