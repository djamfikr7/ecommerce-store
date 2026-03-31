'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export interface ShippingFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  postalCode: string
  country: string
}

interface SavedAddress {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  addressLine1: string
  addressLine2?: string | null
  city: string
  state: string
  postalCode: string
  country: string
}

interface ShippingStepProps {
  onSubmit: (data: ShippingFormData) => void
  defaultValues?: Partial<ShippingFormData>
  savedAddresses?: SavedAddress[]
  isGuest?: boolean
  isLoading?: boolean
}

const COUNTRIES = [
  { code: 'US', label: 'United States' },
  { code: 'CA', label: 'Canada' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'AU', label: 'Australia' },
  { code: 'DE', label: 'Germany' },
  { code: 'FR', label: 'France' },
  { code: 'NL', label: 'Netherlands' },
  { code: 'BE', label: 'Belgium' },
]

const emptyForm: ShippingFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'US',
}

export function ShippingStep({
  onSubmit,
  defaultValues,
  savedAddresses = [],
  isGuest = false,
  isLoading = false,
}: ShippingStepProps) {
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [formData, setFormData] = useState<ShippingFormData>({
    ...emptyForm,
    ...defaultValues,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof ShippingFormData, string>>>({})

  const handleSelectAddress = (address: SavedAddress) => {
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
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!formData.addressLine1.trim()) newErrors.addressLine1 = 'Street address is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.state.trim()) newErrors.state = 'State is required'
    if (!formData.postalCode.trim()) newErrors.postalCode = 'ZIP code is required'

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
      key="shipping"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.35, ease: [0.33, 1, 0.68, 1] }}
      className="space-y-6"
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="bg-accent-primary/20 flex h-10 w-10 items-center justify-center rounded-xl">
          <MapPin className="h-5 w-5 text-accent-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Shipping Address</h3>
          <p className="text-sm text-white/50">Where should we deliver your order?</p>
        </div>
      </div>

      {/* Saved Addresses */}
      {savedAddresses.length > 0 && (
        <div className="mb-6">
          <h4 className="mb-3 text-sm font-medium text-slate-300">Saved Addresses</h4>
          <div className="grid gap-3 sm:grid-cols-2">
            {savedAddresses.map((address) => (
              <button
                key={address.id}
                type="button"
                onClick={() => handleSelectAddress(address)}
                className={`neo-flat flex items-start gap-3 rounded-xl p-4 text-left transition-all ${
                  selectedAddressId === address.id
                    ? 'bg-accent-primary/20 border-2 border-accent-primary'
                    : 'border-2 border-transparent bg-surface-elevated hover:bg-surface-overlay'
                }`}
              >
                <div
                  className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                    selectedAddressId === address.id
                      ? 'border-accent-primary bg-accent-primary'
                      : 'border-slate-400'
                  }`}
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
          <div className="mt-4 text-center text-sm text-white/40">or enter a new address below</div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              First Name <span className="text-accent-danger">*</span>
            </label>
            <Input
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              placeholder="John"
              error={errors.firstName}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Last Name <span className="text-accent-danger">*</span>
            </label>
            <Input
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              placeholder="Doe"
              error={errors.lastName}
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Email <span className="text-accent-danger">*</span>
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="john@example.com"
              error={errors.email}
              disabled={!isGuest && !!defaultValues?.email}
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
              placeholder="+1 (555) 123-4567"
              error={errors.phone}
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Street Address <span className="text-accent-danger">*</span>
          </label>
          <Input
            value={formData.addressLine1}
            onChange={(e) => handleChange('addressLine1', e.target.value)}
            placeholder="123 Main Street"
            error={errors.addressLine1}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Apt, Suite, etc. <span className="text-white/30">(optional)</span>
          </label>
          <Input
            value={formData.addressLine2}
            onChange={(e) => handleChange('addressLine2', e.target.value)}
            placeholder="Apt 4B"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              City <span className="text-accent-danger">*</span>
            </label>
            <Input
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="New York"
              error={errors.city}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              State <span className="text-accent-danger">*</span>
            </label>
            <Input
              value={formData.state}
              onChange={(e) => handleChange('state', e.target.value)}
              placeholder="NY"
              error={errors.state}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              ZIP Code <span className="text-accent-danger">*</span>
            </label>
            <Input
              value={formData.postalCode}
              onChange={(e) => handleChange('postalCode', e.target.value)}
              placeholder="10001"
              error={errors.postalCode}
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">Country</label>
          <select
            value={formData.country}
            onChange={(e) => handleChange('country', e.target.value)}
            className="neo-flat focus:ring-accent-primary/50 w-full rounded-xl border border-white/10 bg-surface-elevated px-4 py-3 text-white transition-colors focus:border-accent-primary focus:outline-none focus:ring-2"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Validation errors summary */}
        <AnimatePresence>
          {Object.keys(errors).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="border-accent-danger/20 bg-accent-danger/10 flex items-start gap-3 rounded-xl border p-4"
            >
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent-danger" />
              <div>
                <p className="text-sm font-medium text-accent-danger">
                  Please fix the following errors:
                </p>
                <ul className="text-accent-danger/70 mt-1 list-inside list-disc text-sm">
                  {Object.entries(errors).map(([key, msg]) => (
                    <li key={key}>{msg}</li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-4 pt-2">
          <Button type="submit" size="lg" className="flex-1" loading={isLoading}>
            Continue to Payment
          </Button>
        </div>
      </form>
    </motion.div>
  )
}

export default ShippingStep
