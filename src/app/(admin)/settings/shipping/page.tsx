'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, DollarSign } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotificationStore } from '@/lib/stores/notification-store'
import {
  SettingsForm,
  SettingsField,
  SettingsInput,
  SettingsToggle,
} from '@/components/admin/settings-form'

interface ShippingRate {
  id: string
  name: string
  minWeight: number
  maxWeight: number
  price: number
}

interface ShippingZone {
  id: string
  name: string
  countries: string
  rates: ShippingRate[]
}

interface ShippingSettings {
  zones: ShippingZone[]
  freeShippingEnabled: boolean
  freeShippingThreshold: number
}

const defaultSettings: ShippingSettings = {
  zones: [
    {
      id: 'domestic',
      name: 'Domestic',
      countries: 'US',
      rates: [
        { id: 'std', name: 'Standard', minWeight: 0, maxWeight: 5000, price: 599 },
        { id: 'exp', name: 'Express', minWeight: 0, maxWeight: 5000, price: 1299 },
      ],
    },
    {
      id: 'international',
      name: 'International',
      countries: 'CA, GB, AU, EU',
      rates: [
        { id: 'intl-std', name: 'Standard', minWeight: 0, maxWeight: 5000, price: 1499 },
        { id: 'intl-exp', name: 'Express', minWeight: 0, maxWeight: 5000, price: 2999 },
      ],
    },
  ],
  freeShippingEnabled: false,
  freeShippingThreshold: 5000,
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

export default function ShippingSettingsPage() {
  const addToast = useNotificationStore((s) => s.addToast)
  const [settings, setSettings] = useState<ShippingSettings>(defaultSettings)
  const [original, setOriginal] = useState<ShippingSettings>(defaultSettings)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/settings?group=shipping')
      const json = await res.json()
      if (json.success && json.data && json.data.zones) {
        const loaded: ShippingSettings = {
          zones: json.data.zones ?? defaultSettings.zones,
          freeShippingEnabled: json.data.freeShippingEnabled ?? false,
          freeShippingThreshold: json.data.freeShippingThreshold ?? 5000,
        }
        setSettings(loaded)
        setOriginal(loaded)
      }
    } catch (err) {
      console.error('Failed to load shipping settings:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(original)

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {}
    if (settings.zones.length === 0) {
      errs.zones = 'At least one shipping zone is required'
    }
    settings.zones.forEach((zone, zi) => {
      if (!zone.name.trim()) {
        errs[`zone-${zi}-name`] = `Zone ${zi + 1}: Name is required`
      }
      if (!zone.countries.trim()) {
        errs[`zone-${zi}-countries`] = `Zone ${zi + 1}: Countries are required`
      }
      if (zone.rates.length === 0) {
        errs[`zone-${zi}-rates`] = `Zone ${zi + 1}: At least one rate is required`
      }
      zone.rates.forEach((rate, ri) => {
        if (!rate.name.trim()) {
          errs[`rate-${zi}-${ri}-name`] = `Zone ${zi + 1}, Rate ${ri + 1}: Name is required`
        }
        if (rate.price < 0) {
          errs[`rate-${zi}-${ri}-price`] =
            `Zone ${zi + 1}, Rate ${ri + 1}: Price cannot be negative`
        }
      })
    })
    if (settings.freeShippingEnabled && settings.freeShippingThreshold <= 0) {
      errs.freeShippingThreshold = 'Free shipping threshold must be greater than 0'
    }
    return errs
  }

  const handleSave = async () => {
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setIsSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          group: 'shipping',
          settings: {
            zones: settings.zones,
            freeShippingEnabled: settings.freeShippingEnabled,
            freeShippingThreshold: settings.freeShippingThreshold,
          },
        }),
      })
      const json = await res.json()
      if (!json.success) throw new Error('Save failed')
      setOriginal(settings)
      addToast({
        type: 'success',
        title: 'Settings saved',
        message: 'Shipping settings have been updated',
      })
    } catch {
      addToast({
        type: 'error',
        title: 'Save failed',
        message: 'Could not save shipping settings',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setSettings(original)
    setErrors({})
  }

  const addZone = () => {
    const id = `zone-${Date.now()}`
    setSettings((s) => ({
      ...s,
      zones: [
        ...s.zones,
        {
          id,
          name: '',
          countries: '',
          rates: [{ id: `${id}-rate`, name: 'Standard', minWeight: 0, maxWeight: 5000, price: 0 }],
        },
      ],
    }))
  }

  const removeZone = (id: string) => {
    setSettings((s) => ({
      ...s,
      zones: s.zones.filter((z) => z.id !== id),
    }))
  }

  const updateZone = (id: string, field: string, value: string) => {
    setSettings((s) => ({
      ...s,
      zones: s.zones.map((z) => (z.id === id ? { ...z, [field]: value } : z)),
    }))
  }

  const addRate = (zoneId: string) => {
    const rateId = `rate-${Date.now()}`
    setSettings((s) => ({
      ...s,
      zones: s.zones.map((z) =>
        z.id === zoneId
          ? {
              ...z,
              rates: [
                ...z.rates,
                { id: rateId, name: '', minWeight: 0, maxWeight: 5000, price: 0 },
              ],
            }
          : z,
      ),
    }))
  }

  const removeRate = (zoneId: string, rateId: string) => {
    setSettings((s) => ({
      ...s,
      zones: s.zones.map((z) =>
        z.id === zoneId ? { ...z, rates: z.rates.filter((r) => r.id !== rateId) } : z,
      ),
    }))
  }

  const updateRate = (zoneId: string, rateId: string, field: string, value: string | number) => {
    setSettings((s) => ({
      ...s,
      zones: s.zones.map((z) =>
        z.id === zoneId
          ? {
              ...z,
              rates: z.rates.map((r) => (r.id === rateId ? { ...r, [field]: value } : r)),
            }
          : z,
      ),
    }))
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500/30 border-t-cyan-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/settings"
          className="rounded-xl bg-slate-800/50 p-2 text-slate-400 transition-colors hover:bg-slate-700/50 hover:text-white"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white lg:text-3xl">Shipping Settings</h1>
          <p className="mt-1 text-slate-400">
            Configure shipping zones, rates, and free shipping rules
          </p>
        </div>
      </div>

      <SettingsForm
        title="Shipping Zones & Rates"
        description="Define shipping regions and their associated shipping rates"
        onSave={handleSave}
        onReset={handleReset}
        isSaving={isSaving}
        hasChanges={hasChanges}
        errors={errors}
      >
        {/* Free Shipping */}
        <div className="space-y-4">
          <SettingsToggle
            label="Free Shipping"
            description="Offer free shipping when order subtotal exceeds a threshold"
            checked={settings.freeShippingEnabled}
            onChange={(checked) => setSettings((s) => ({ ...s, freeShippingEnabled: checked }))}
          />

          {settings.freeShippingEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <SettingsField
                label="Free Shipping Threshold"
                description="Minimum order subtotal (in cents) to qualify for free shipping"
                error={errors.freeShippingThreshold}
              >
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <DollarSign size={16} />
                  </span>
                  <SettingsInput
                    error={!!errors.freeShippingThreshold}
                    type="number"
                    value={settings.freeShippingThreshold / 100}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        freeShippingThreshold: Math.round((parseFloat(e.target.value) || 0) * 100),
                      }))
                    }
                    className="pl-10"
                    placeholder="50.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Current: {formatCents(settings.freeShippingThreshold)}
                </p>
              </SettingsField>
            </motion.div>
          )}
        </div>

        {/* Shipping Zones */}
        <div className="border-t border-slate-700/50 pt-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-300">
              Shipping Zones ({settings.zones.length})
            </h3>
            <button
              onClick={addZone}
              className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/20 px-3 py-1.5 text-sm font-medium text-cyan-400 transition-colors hover:bg-cyan-500/30"
            >
              <Plus size={14} />
              Add Zone
            </button>
          </div>

          <AnimatePresence>
            {settings.zones.map((zone, zi) => (
              <motion.div
                key={zone.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-4 space-y-4 rounded-xl border border-slate-700/50 bg-slate-900/30 p-5"
              >
                {/* Zone Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
                    <SettingsField label="Zone Name" error={errors[`zone-${zi}-name`]}>
                      <SettingsInput
                        error={!!errors[`zone-${zi}-name`]}
                        value={zone.name}
                        onChange={(e) => updateZone(zone.id, 'name', e.target.value)}
                        placeholder="e.g., Domestic, Europe"
                      />
                    </SettingsField>
                    <SettingsField
                      label="Countries"
                      description="Comma-separated country codes"
                      error={errors[`zone-${zi}-countries`]}
                    >
                      <SettingsInput
                        error={!!errors[`zone-${zi}-countries`]}
                        value={zone.countries}
                        onChange={(e) => updateZone(zone.id, 'countries', e.target.value)}
                        placeholder="US, CA, MX"
                      />
                    </SettingsField>
                  </div>
                  <button
                    onClick={() => removeZone(zone.id)}
                    className="mt-6 rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-500/20 hover:text-red-400"
                    aria-label="Remove zone"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Rates */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-slate-400">
                      Shipping Rates ({zone.rates.length})
                    </span>
                    <button
                      onClick={() => addRate(zone.id)}
                      className="inline-flex items-center gap-1 rounded-md bg-slate-800/50 px-2 py-1 text-xs text-slate-400 transition-colors hover:bg-slate-700/50 hover:text-slate-200"
                    >
                      <Plus size={12} />
                      Add Rate
                    </button>
                  </div>

                  <div className="space-y-3">
                    {zone.rates.map((rate, ri) => (
                      <div
                        key={rate.id}
                        className="grid grid-cols-1 items-end gap-3 rounded-lg border border-slate-700/30 bg-slate-800/30 p-3 sm:grid-cols-4"
                      >
                        <SettingsField label="Name" error={errors[`rate-${zi}-${ri}-name`]}>
                          <SettingsInput
                            error={!!errors[`rate-${zi}-${ri}-name`]}
                            value={rate.name}
                            onChange={(e) => updateRate(zone.id, rate.id, 'name', e.target.value)}
                            placeholder="Standard"
                            className="py-2 text-sm"
                          />
                        </SettingsField>
                        <SettingsField label="Price ($)">
                          <SettingsInput
                            type="number"
                            value={rate.price / 100}
                            onChange={(e) =>
                              updateRate(
                                zone.id,
                                rate.id,
                                'price',
                                Math.round((parseFloat(e.target.value) || 0) * 100),
                              )
                            }
                            placeholder="5.99"
                            min="0"
                            step="0.01"
                            className="py-2 text-sm"
                          />
                        </SettingsField>
                        <SettingsField label="Max Weight (g)">
                          <SettingsInput
                            type="number"
                            value={rate.maxWeight}
                            onChange={(e) =>
                              updateRate(
                                zone.id,
                                rate.id,
                                'maxWeight',
                                parseInt(e.target.value) || 0,
                              )
                            }
                            placeholder="5000"
                            min="0"
                            className="py-2 text-sm"
                          />
                        </SettingsField>
                        <button
                          onClick={() => removeRate(zone.id, rate.id)}
                          disabled={zone.rates.length <= 1}
                          className="self-end rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-500/20 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
                          aria-label="Remove rate"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {settings.zones.length === 0 && (
            <div className="rounded-xl border-2 border-dashed border-slate-700 py-12 text-center">
              <p className="mb-3 text-slate-500">No shipping zones configured</p>
              <button
                onClick={addZone}
                className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/20 px-4 py-2 font-medium text-cyan-400 transition-colors hover:bg-cyan-500/30"
              >
                <Plus size={16} />
                Add Your First Zone
              </button>
            </div>
          )}
        </div>
      </SettingsForm>
    </div>
  )
}
