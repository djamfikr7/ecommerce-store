'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MapPin, Check } from 'lucide-react';

const shippingSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address1: z.string().min(1, 'Address is required'),
  address2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(5, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  sameAsBilling: z.boolean().optional(),
});

type ShippingFormData = z.infer<typeof shippingSchema>;

interface ShippingFormProps {
  onSubmit: (data: ShippingFormData) => void;
  defaultValues?: Partial<ShippingFormData>;
  savedAddresses?: Array<ShippingFormData & { id: string }>;
}

export function ShippingForm({ onSubmit, defaultValues, savedAddresses }: ShippingFormProps) {
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    savedAddresses && savedAddresses.length > 0 ? savedAddresses[0].id : null
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: defaultValues || {
      country: 'US',
      sameAsBilling: true,
    },
  });

  const handleFormSubmit = async (data: ShippingFormData) => {
    await onSubmit(data);
  };

  const handleSelectAddress = (address: ShippingFormData & { id: string }) => {
    setSelectedAddressId(address.id);
    Object.entries(address).forEach(([key, value]) => {
      if (key !== 'id') {
        // This would require using setValue from react-hook-form
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Saved Addresses */}
      {savedAddresses && savedAddresses.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-white/70 mb-3">Saved Addresses</h3>
          <div className="grid gap-3">
            {savedAddresses.map((address) => (
              <button
                key={address.id}
                type="button"
                onClick={() => handleSelectAddress(address)}
                className={`
                  flex items-start gap-3 p-4 rounded-xl text-left transition-all
                  ${selectedAddressId === address.id
                    ? 'bg-accent/20 border-2 border-accent'
                    : 'bg-white/5 border-2 border-transparent hover:bg-white/8'
                  }
                `}
              >
                <div className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5
                  ${selectedAddressId === address.id ? 'border-accent bg-accent' : 'border-white/30'}
                `}>
                  {selectedAddressId === address.id && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-white">
                    {address.firstName} {address.lastName}
                  </p>
                  <p className="text-sm text-white/60">
                    {address.address1}
                    {address.address2 && `, ${address.address2}`}
                  </p>
                  <p className="text-sm text-white/60">
                    {address.city}, {address.state} {address.postalCode}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Shipping Form */}
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-accent" />
          <h3 className="text-lg font-semibold text-white">Shipping Address</h3>
        </div>

        {/* Contact Information */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-white/70 mb-2">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              autoComplete="given-name"
              className={`
                w-full px-4 py-3 rounded-xl bg-white/5 border text-white
                placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-accent
                ${errors.firstName ? 'border-red-500' : 'border-white/10'}
              `}
              placeholder="John"
              {...register('firstName')}
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-400">{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-white/70 mb-2">
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              autoComplete="family-name"
              className={`
                w-full px-4 py-3 rounded-xl bg-white/5 border text-white
                placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-accent
                ${errors.lastName ? 'border-red-500' : 'border-white/10'}
              `}
              placeholder="Doe"
              {...register('lastName')}
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-400">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={`
                w-full px-4 py-3 rounded-xl bg-white/5 border text-white
                placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-accent
                ${errors.email ? 'border-red-500' : 'border-white/10'}
              `}
              placeholder="john@example.com"
              {...register('email')}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-white/70 mb-2">
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              className={`
                w-full px-4 py-3 rounded-xl bg-white/5 border text-white
                placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-accent
                ${errors.phone ? 'border-red-500' : 'border-white/10'}
              `}
              placeholder="+1 (555) 123-4567"
              {...register('phone')}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-400">{errors.phone.message}</p>
            )}
          </div>
        </div>

        {/* Address */}
        <div>
          <label htmlFor="address1" className="block text-sm font-medium text-white/70 mb-2">
            Address
          </label>
          <input
            id="address1"
            type="text"
            autoComplete="address-line1"
            className={`
              w-full px-4 py-3 rounded-xl bg-white/5 border text-white
              placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-accent
              ${errors.address1 ? 'border-red-500' : 'border-white/10'}
            `}
            placeholder="123 Main Street"
            {...register('address1')}
          />
          {errors.address1 && (
            <p className="mt-1 text-sm text-red-400">{errors.address1.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="address2" className="block text-sm font-medium text-white/70 mb-2">
            Apartment, suite, etc. (optional)
          </label>
          <input
            id="address2"
            type="text"
            autoComplete="address-line2"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="Apt 4B"
            {...register('address2')}
          />
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-white/70 mb-2">
              City
            </label>
            <input
              id="city"
              type="text"
              autoComplete="address-level2"
              className={`
                w-full px-4 py-3 rounded-xl bg-white/5 border text-white
                placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-accent
                ${errors.city ? 'border-red-500' : 'border-white/10'}
              `}
              placeholder="New York"
              {...register('city')}
            />
            {errors.city && (
              <p className="mt-1 text-sm text-red-400">{errors.city.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="state" className="block text-sm font-medium text-white/70 mb-2">
              State
            </label>
            <input
              id="state"
              type="text"
              autoComplete="address-level1"
              className={`
                w-full px-4 py-3 rounded-xl bg-white/5 border text-white
                placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-accent
                ${errors.state ? 'border-red-500' : 'border-white/10'}
              `}
              placeholder="NY"
              {...register('state')}
            />
            {errors.state && (
              <p className="mt-1 text-sm text-red-400">{errors.state.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-white/70 mb-2">
              ZIP Code
            </label>
            <input
              id="postalCode"
              type="text"
              autoComplete="postal-code"
              className={`
                w-full px-4 py-3 rounded-xl bg-white/5 border text-white
                placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-accent
                ${errors.postalCode ? 'border-red-500' : 'border-white/10'}
              `}
              placeholder="10001"
              {...register('postalCode')}
            />
            {errors.postalCode && (
              <p className="mt-1 text-sm text-red-400">{errors.postalCode.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="country" className="block text-sm font-medium text-white/70 mb-2">
            Country
          </label>
          <select
            id="country"
            autoComplete="country"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-accent"
            {...register('country')}
          >
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="GB">United Kingdom</option>
            <option value="AU">Australia</option>
            <option value="DE">Germany</option>
            <option value="FR">France</option>
          </select>
        </div>

        {/* Same as Billing */}
        <div className="flex items-center gap-3">
          <input
            id="sameAsBilling"
            type="checkbox"
            className="w-5 h-5 rounded border-white/20 bg-white/5 text-accent focus:ring-accent"
            {...register('sameAsBilling')}
          />
          <label htmlFor="sameAsBilling" className="text-sm text-white/70">
            Billing address same as shipping address
          </label>
        </div>
      </form>
    </motion.div>
  );
}

export default ShippingForm;
