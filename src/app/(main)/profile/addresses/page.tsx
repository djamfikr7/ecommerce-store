'use client'

import { useState, useEffect, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, MapPin, Check, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import {
  getAddressesAction,
  addAddressAction,
  editAddressAction,
  removeAddressAction,
  setDefaultAddressAction,
} from '@/lib/actions/auth'
import { getSessionAction } from '@/lib/actions/auth'
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

interface FormData {
  type: AddressType
  firstName: string
  lastName: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  postalCode: string
  country: string
  phone: string
}

const US_STATES = [
  'AL',
  'AK',
  'AZ',
  'AR',
  'CA',
  'CO',
  'CT',
  'DE',
  'FL',
  'GA',
  'HI',
  'ID',
  'IL',
  'IN',
  'IA',
  'KS',
  'KY',
  'LA',
  'ME',
  'MD',
  'MA',
  'MI',
  'MN',
  'MS',
  'MO',
  'MT',
  'NE',
  'NV',
  'NH',
  'NJ',
  'NM',
  'NY',
  'NC',
  'ND',
  'OH',
  'OK',
  'OR',
  'PA',
  'RI',
  'SC',
  'SD',
  'TN',
  'TX',
  'UT',
  'VT',
  'VA',
  'WA',
  'WV',
  'WI',
  'WY',
]

const initialFormData: FormData = {
  type: 'SHIPPING',
  firstName: '',
  lastName: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'US',
  phone: '',
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [userId, setUserId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
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
        // Map DB addresses to component Address type
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.addressLine1.trim()) newErrors.addressLine1 = 'Address is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.state.trim()) newErrors.state = 'State is required'
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'ZIP code is required'
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.postalCode)) {
      newErrors.postalCode = 'Invalid ZIP code format (e.g., 12345 or 12345-6789)'
    }
    if (formData.phone && !/^\+?1?\s*\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone format (e.g., (555) 123-4567)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm() || !userId) return

    startTransition(async () => {
      try {
        const formDataObj = new FormData()
        formDataObj.append('type', formData.type)
        formDataObj.append('firstName', formData.firstName.trim())
        formDataObj.append('lastName', formData.lastName.trim())
        formDataObj.append('addressLine1', formData.addressLine1.trim())
        formDataObj.append('addressLine2', formData.addressLine2.trim())
        formDataObj.append('city', formData.city.trim())
        formDataObj.append('state', formData.state)
        formDataObj.append('postalCode', formData.postalCode.trim())
        formDataObj.append('country', formData.country)
        formDataObj.append('phone', formData.phone.trim())
        formDataObj.append('isDefault', 'false')

        let result
        if (editingId) {
          result = await editAddressAction(editingId, userId, formDataObj)
        } else {
          result = await addAddressAction(userId, formDataObj)
        }

        if (result.success) {
          await loadAddresses()
          handleCancel()
        } else {
          setErrors({ submit: result.error || 'Failed to save address' })
        }
      } catch (error) {
        setErrors({ submit: 'An error occurred. Please try again.' })
      }
    })
  }

  const handleEdit = (address: Address) => {
    setEditingId(address.id)
    setFormData({
      type: address.type,
      firstName: address.firstName,
      lastName: address.lastName,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state || '',
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone || '',
    })
    setShowForm(true)
    setErrors({})
  }

  const handleDelete = async (id: string) => {
    if (!userId || !confirm('Are you sure you want to delete this address?')) return

    startTransition(async () => {
      try {
        const result = await removeAddressAction(id, userId)
        if (result.success) {
          await loadAddresses()
        } else {
          alert(result.error || 'Failed to delete address')
        }
      } catch (error) {
        alert('An error occurred. Please try again.')
      }
    })
  }

  const handleSetDefault = async (id: string) => {
    if (!userId) return

    startTransition(async () => {
      try {
        const result = await setDefaultAddressAction(id, userId)
        if (result.success) {
          await loadAddresses()
        } else {
          alert(result.error || 'Failed to set default address')
        }
      } catch (error) {
        alert('An error occurred. Please try again.')
      }
    })
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData(initialFormData)
    setErrors({})
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
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
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              <Card>
                <CardHeader>
                  <CardTitle>{editingId ? 'Edit Address' : 'Add New Address'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Address Type */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-200">
                        Address Type
                      </label>
                      <Select
                        value={formData.type}
                        onChange={(e) => handleInputChange('type', e.target.value as AddressType)}
                        error={errors.type || undefined}
                      >
                        <option value="SHIPPING">Shipping</option>
                        <option value="BILLING">Billing</option>
                        <option value="BOTH">Both</option>
                      </Select>
                    </div>

                    {/* Name Fields */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-200">
                          First Name *
                        </label>
                        <Input
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          error={errors.firstName}
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-200">
                          Last Name *
                        </label>
                        <Input
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          error={errors.lastName}
                          placeholder="Doe"
                        />
                      </div>
                    </div>

                    {/* Address Lines */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-200">
                        Address Line 1 *
                      </label>
                      <Input
                        value={formData.addressLine1}
                        onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                        error={errors.addressLine1}
                        placeholder="123 Main Street"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-200">
                        Address Line 2
                      </label>
                      <Input
                        value={formData.addressLine2}
                        onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                        placeholder="Apt 4B, Suite 100, etc."
                      />
                    </div>

                    {/* City, State, ZIP */}
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-200">
                          City *
                        </label>
                        <Input
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          error={errors.city}
                          placeholder="San Francisco"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-200">
                          State *
                        </label>
                        <Select
                          value={formData.state}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          error={errors.state || undefined}
                        >
                          <option value="">Select State</option>
                          {US_STATES.map((state) => (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ))}
                        </Select>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-200">
                          ZIP Code *
                        </label>
                        <Input
                          value={formData.postalCode}
                          onChange={(e) => handleInputChange('postalCode', e.target.value)}
                          error={errors.postalCode}
                          placeholder="94102"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-200">
                        Phone Number
                      </label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        error={errors.phone}
                        placeholder="(555) 123-4567"
                      />
                    </div>

                    {/* Error Message */}
                    {errors.submit && (
                      <div className="bg-accent-danger/10 border-accent-danger/30 rounded-lg border p-3 text-sm text-accent-danger">
                        {errors.submit}
                      </div>
                    )}

                    {/* Form Actions */}
                    <div className="flex gap-3 pt-4">
                      <Button type="submit" loading={isPending} disabled={isPending}>
                        {editingId ? 'Update Address' : 'Add Address'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isPending}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Addresses List */}
        {addresses.length === 0 ? (
          <Card className="py-16 text-center">
            <CardContent>
              <div className="mb-6 text-6xl">
                <MapPin className="mx-auto h-16 w-16 text-slate-600" />
              </div>
              <h2 className="mb-2 text-2xl font-bold">No addresses yet</h2>
              <p className="mb-8 text-slate-400">Add a shipping address to make checkout faster.</p>
              {!showForm && (
                <Button onClick={() => setShowForm(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Your First Address
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
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
                          onClick={() => handleEdit(address)}
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
        )}
      </div>
    </div>
  )
}
