'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export interface ShippingFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
}

interface ShippingFormProps {
  onSubmit: (data: ShippingFormData) => void
  onBack?: () => void
  defaultValues?: Partial<ShippingFormData>
  savedAddresses?: Array<ShippingFormData & { id: string }>
  isGuest?: boolean
}

export function ShippingForm({
  onSubmit,
  onBack,
  defaultValues,
  savedAddresses,
  isGuest = false,
}: ShippingFormProps) {
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [formData, setFormData] = useState<ShippingFormData>({
    firstName: defaultValues?.firstName || '',
    lastName: defaultValues?.lastName || '',
    email: defaultValues?.email || '',
    phone: defaultValues?.phone || '',
    addressLine1: defaultValues?.addressLine1 || '',
    addressLine2: defaultValues?.addressLine2 || '',
    city: defaultValues?.city || '',
    state: defaultValues?.state || '',
    postalCode: defaultValues?.postalCode || '',
    country: defaultValues?.country || 'US',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof ShippingFormData, string>>>({})

  const handleSelectAddress = (address: ShippingFormData & { id: string }) => {
    setSelectedAddressId(address.id)
    setFormData({
      firstName: address.firstName,
      lastName: address.lastName,
      email: address.email,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
    })
    setErrors({})
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ShippingFormData, string>> = {}

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address'
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required'
    if (!formData.addressLine1.trim()) newErrors.addressLine1 = 'Address is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.state.trim()) newErrors.state = 'State is required'
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const handleChange = (field: keyof ShippingFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="mb-4 flex items-center gap-2">
        <MapPin className="h-5 w-5 text-accent-primary" />
        <h3 className="text-lg font-semibold text-white">Shipping Address</h3>
      </div>

      {/* Saved Addresses */}
      {savedAddresses && savedAddresses.length > 0 && (
        <div className="mb-6">
          <h4 className="mb-3 text-sm font-medium text-slate-300">Saved Addresses</h4>
          <div className="grid gap-3">
            {savedAddresses.map((address) => (
              <button
                key={address.id}
                type="button"
                onClick={() => handleSelectAddress(address)}
                className={`neo-flat flex items-start gap-3 rounded-xl p-4 text-left transition-all ${
                  selectedAddressId === address.id
                    ? 'bg-accent-primary/20 border-2 border-accent-primary'
                    : 'border-2 border-transparent bg-surface-elevated hover:bg-surface-overlay'
                } `}
              >
                <div
                  className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 ${selectedAddressId === address.id ? 'border-accent-primary bg-accent-primary' : 'border-slate-400'} `}
                >
                  {selectedAddressId === address.id && <Check className="h-3 w-3 text-white" />}
                </div>
                <div>
                  <p className="font-medium text-white">
                    {address.firstName} {address.lastName}
                  </p>
                  <p className="text-sm text-slate-400">
                    {address.addressLine1}
                    {address.addressLine2 && `, ${address.addressLine2}`}
                  </p>
                  <p className="text-sm text-slate-400">
                    {address.city}, {address.state} {address.postalCode}
                  </p>
                </div>
              </button>
            ))}
          </div>
          <div className="mt-4 text-center text-sm text-slate-400">
            or enter a new address below
          </div>
        </div>
      )}

      {/* Shipping Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Contact Information */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              First Name <span className="text-accent-danger">*</span>
            </label>
            <Input
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              error={errors.firstName}
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Last Name <span className="text-accent-danger">*</span>
            </label>
            <Input
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              error={errors.lastName}
              required
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Email <span className="text-accent-danger">*</span>
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              error={errors.email}
              required
              disabled={!isGuest}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Phone <span className="text-accent-danger">*</span>
            </label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              error={errors.phone}
              required
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Address <span className="text-accent-danger">*</span>
          </label>
          <Input
            value={formData.addressLine1}
            onChange={(e) => handleChange('addressLine1', e.target.value)}
            error={errors.addressLine1}
            placeholder="123 Main Street"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Apartment, suite, etc. (optional)
          </label>
          <Input
            value={formData.addressLine2}
            onChange={(e) => handleChange('addressLine2', e.target.value)}
            placeholder="Apt 4B"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              City <span className="text-accent-danger">*</span>
            </label>
            <Input
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              error={errors.city}
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              State <span className="text-accent-danger">*</span>
            </label>
            <Input
              value={formData.state}
              onChange={(e) => handleChange('state', e.target.value)}
              error={errors.state}
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              ZIP Code <span className="text-accent-danger">*</span>
            </label>
            <Input
              value={formData.postalCode}
              onChange={(e) => handleChange('postalCode', e.target.value)}
              error={errors.postalCode}
              required
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">Country</label>
          <select
            value={formData.country}
            onChange={(e) => handleChange('country', e.target.value)}
            className="border-border-default neo-flat w-full rounded-xl border bg-surface-elevated px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent-primary"
          >
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="GB">United Kingdom</option>
            <option value="AU">Australia</option>
            <option value="DE">Germany</option>
            <option value="FR">France</option>
            <option value="NL">Netherlands</option>
            <option value="BE">Belgium</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-4">
          {onBack && (
            <Button type="button" variant="outline" size="lg" onClick={onBack}>
              Back
            </Button>
          )}
          <Button type="submit" size="lg" className="flex-1">
            Continue to Payment
          </Button>
        </div>
      </form>
    </motion.div>
  )
}
