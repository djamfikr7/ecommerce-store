'use client'

import { useState, useTransition } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit2, X } from 'lucide-react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { addAddressAction, editAddressAction } from '@/lib/actions/auth'
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

const addressSchema = z.object({
  type: z.enum(['SHIPPING', 'BILLING', 'BOTH']),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  addressLine1: z.string().min(1, 'Address is required').max(100),
  addressLine2: z.string().max(100).optional(),
  city: z.string().min(1, 'City is required').max(50),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format'),
  country: z.string().min(1, 'Country is required'),
  phone: z
    .string()
    .regex(/^\+?1?\s*\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/, 'Invalid phone format')
    .optional()
    .or(z.literal('')),
})

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

interface AddressFormProps {
  userId: string
  editingAddress?: Address | null
  onSuccess: () => void
  onCancel: () => void
}

export function AddressForm({ userId, editingAddress, onSuccess, onCancel }: AddressFormProps) {
  const addToast = useNotificationStore((state) => state.addToast)
  const [formData, setFormData] = useState<FormData>(() => {
    if (editingAddress) {
      return {
        type: editingAddress.type,
        firstName: editingAddress.firstName,
        lastName: editingAddress.lastName,
        addressLine1: editingAddress.addressLine1,
        addressLine2: editingAddress.addressLine2 || '',
        city: editingAddress.city,
        state: editingAddress.state || '',
        postalCode: editingAddress.postalCode,
        country: editingAddress.country,
        phone: editingAddress.phone || '',
      }
    }
    return initialFormData
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isPending, startTransition] = useTransition()

  const validateForm = (): boolean => {
    try {
      addressSchema.parse(formData)
      setErrors({})
      return true
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        err.errors.forEach((e) => {
          const field = e.path[0] as string
          if (!newErrors[field]) newErrors[field] = e.message
        })
        setErrors(newErrors)
      }
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

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
        if (editingAddress) {
          result = await editAddressAction(editingAddress.id, userId, formDataObj)
        } else {
          result = await addAddressAction(userId, formDataObj)
        }

        if (result.success) {
          addToast({
            type: 'success',
            title: editingAddress ? 'Address Updated' : 'Address Added',
            message: editingAddress
              ? 'Your address has been updated successfully'
              : 'Your address has been added successfully',
          })
          onSuccess()
        } else {
          setErrors({ submit: result.error || 'Failed to save address' })
          addToast({
            type: 'error',
            title: 'Error',
            message: result.error || 'Failed to save address',
          })
        }
      } catch (error) {
        setErrors({ submit: 'An error occurred. Please try again.' })
        addToast({ type: 'error', title: 'Error', message: 'An error occurred. Please try again.' })
      }
    })
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

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-8"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {editingAddress ? (
              <>
                <Edit2 className="h-5 w-5" />
                Edit Address
              </>
            ) : (
              <>
                <Plus className="h-5 w-5" />
                Add New Address
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Address Type</label>
              <Select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value as AddressType)}
                error={errors.type}
              >
                <option value="SHIPPING">Shipping</option>
                <option value="BILLING">Billing</option>
                <option value="BOTH">Both</option>
              </Select>
            </div>

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
                <label className="mb-2 block text-sm font-medium text-slate-200">Last Name *</label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  error={errors.lastName}
                  placeholder="Doe"
                />
              </div>
            </div>

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

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">City *</label>
                <Input
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  error={errors.city}
                  placeholder="San Francisco"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">State *</label>
                <Select
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  error={errors.state}
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
                <label className="mb-2 block text-sm font-medium text-slate-200">ZIP Code *</label>
                <Input
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  error={errors.postalCode}
                  placeholder="94102"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Phone Number</label>
              <Input
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                error={errors.phone}
                placeholder="(555) 123-4567"
              />
            </div>

            {errors.submit && (
              <div className="bg-accent-danger/10 border-accent-danger/30 rounded-lg border p-3 text-sm text-accent-danger">
                {errors.submit}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="submit" loading={isPending} disabled={isPending}>
                {editingAddress ? 'Update Address' : 'Add Address'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
