'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, MapPin, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Container } from '@/components/ui/container'

const sampleAddresses = [
  {
    id: '1',
    name: 'Home',
    firstName: 'John',
    lastName: 'Doe',
    address: '123 Main Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
    country: 'United States',
    phone: '+1 (555) 123-4567',
    isDefault: true,
  },
  {
    id: '2',
    name: 'Work',
    firstName: 'John',
    lastName: 'Doe',
    address: '456 Market Street, Suite 100',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94105',
    country: 'United States',
    phone: '+1 (555) 987-6543',
    isDefault: false,
  },
]

export default function AddressesPage() {
  const t = useTranslations()
  const [addresses, setAddresses] = useState(sampleAddresses)
  const [showForm, setShowForm] = useState(false)

  const handleDelete = (id: string) => {
    setAddresses(addresses.filter(addr => addr.id !== id))
  }

  const handleSetDefault = (id: string) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id,
    })))
  }

  return (
    <div className="min-h-screen">
      <Container className="py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">{t('nav.addresses')}</h1>
            <p className="text-slate-400">Manage your shipping addresses</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Address
          </Button>
        </div>

        {/* Addresses Grid */}
        {addresses.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <div className="text-6xl mb-6">
                <MapPin className="w-16 h-16 mx-auto text-slate-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">No addresses yet</h2>
              <p className="text-slate-400 mb-8">
                Add a shipping address to make checkout faster.
              </p>
              <Button onClick={() => setShowForm(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Your First Address
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {addresses.map((address, index) => (
              <motion.div
                key={address.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card hoverable className="h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{address.name}</h3>
                        {address.isDefault && (
                          <Badge variant="default" className="text-xs">
                            Default
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-400 hover:text-red-300"
                          onClick={() => handleDelete(address.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-1 text-slate-300 mb-4">
                      <p className="font-medium">{address.firstName} {address.lastName}</p>
                      <p>{address.address}</p>
                      <p>{address.city}, {address.state} {address.zipCode}</p>
                      <p>{address.country}</p>
                      <p className="text-slate-500">{address.phone}</p>
                    </div>

                    {!address.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleSetDefault(address.id)}
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
      </Container>
    </div>
  )
}
