'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useNotificationStore } from '@/lib/stores/notification-store'
import { SettingsForm, SettingsField, SettingsInput } from '@/components/admin/settings-form'

interface GeneralSettings {
  storeName: string
  tagline: string
  logoUrl: string
  faviconUrl: string
  contactEmail: string
  contactPhone: string
}

const defaultSettings: GeneralSettings = {
  storeName: '',
  tagline: '',
  logoUrl: '',
  faviconUrl: '',
  contactEmail: '',
  contactPhone: '',
}

export default function GeneralSettingsPage() {
  const addToast = useNotificationStore((s) => s.addToast)
  const [settings, setSettings] = useState<GeneralSettings>(defaultSettings)
  const [original, setOriginal] = useState<GeneralSettings>(defaultSettings)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/settings?group=general')
      const json = await res.json()
      if (json.success && json.data) {
        const loaded: GeneralSettings = {
          storeName: json.data.storeName ?? '',
          tagline: json.data.tagline ?? '',
          logoUrl: json.data.logoUrl ?? '',
          faviconUrl: json.data.faviconUrl ?? '',
          contactEmail: json.data.contactEmail ?? '',
          contactPhone: json.data.contactPhone ?? '',
        }
        setSettings(loaded)
        setOriginal(loaded)
      }
    } catch (err) {
      console.error('Failed to load general settings:', err)
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
    if (!settings.storeName.trim()) {
      errs.storeName = 'Store name is required'
    }
    if (settings.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.contactEmail)) {
      errs.contactEmail = 'Invalid email address'
    }
    if (settings.logoUrl && !/^https?:\/\/.+/.test(settings.logoUrl)) {
      errs.logoUrl = 'Logo URL must start with http:// or https://'
    }
    if (settings.faviconUrl && !/^https?:\/\/.+/.test(settings.faviconUrl)) {
      errs.faviconUrl = 'Favicon URL must start with http:// or https://'
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
        body: JSON.stringify({ group: 'general', settings }),
      })
      const json = await res.json()
      if (!json.success) throw new Error('Save failed')
      setOriginal(settings)
      addToast({
        type: 'success',
        title: 'Settings saved',
        message: 'General settings have been updated',
      })
    } catch {
      addToast({
        type: 'error',
        title: 'Save failed',
        message: 'Could not save general settings',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setSettings(original)
    setErrors({})
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
          <h1 className="text-2xl font-bold text-white lg:text-3xl">General Settings</h1>
          <p className="mt-1 text-slate-400">
            Configure your store identity and contact information
          </p>
        </div>
      </div>

      <SettingsForm
        title="Store Information"
        description="Basic details about your store that appear across the site"
        onSave={handleSave}
        onReset={handleReset}
        isSaving={isSaving}
        hasChanges={hasChanges}
        errors={errors}
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SettingsField label="Store Name" error={errors.storeName}>
            <SettingsInput
              error={!!errors.storeName}
              value={settings.storeName}
              onChange={(e) => setSettings((s) => ({ ...s, storeName: e.target.value }))}
              placeholder="My Awesome Store"
            />
          </SettingsField>

          <SettingsField label="Tagline" description="Short slogan shown on the storefront">
            <SettingsInput
              value={settings.tagline}
              onChange={(e) => setSettings((s) => ({ ...s, tagline: e.target.value }))}
              placeholder="Quality products, fast delivery"
            />
          </SettingsField>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SettingsField
            label="Logo URL"
            description="URL to your store logo image"
            error={errors.logoUrl}
          >
            <SettingsInput
              error={!!errors.logoUrl}
              value={settings.logoUrl}
              onChange={(e) => setSettings((s) => ({ ...s, logoUrl: e.target.value }))}
              placeholder="https://example.com/logo.png"
            />
          </SettingsField>

          <SettingsField
            label="Favicon URL"
            description="URL to your site favicon"
            error={errors.faviconUrl}
          >
            <SettingsInput
              error={!!errors.faviconUrl}
              value={settings.faviconUrl}
              onChange={(e) => setSettings((s) => ({ ...s, faviconUrl: e.target.value }))}
              placeholder="https://example.com/favicon.ico"
            />
          </SettingsField>
        </div>

        <div className="border-t border-slate-700/50 pt-6">
          <h3 className="mb-4 text-sm font-semibold text-slate-300">Contact Information</h3>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SettingsField label="Contact Email" error={errors.contactEmail}>
              <SettingsInput
                type="email"
                error={!!errors.contactEmail}
                value={settings.contactEmail}
                onChange={(e) => setSettings((s) => ({ ...s, contactEmail: e.target.value }))}
                placeholder="support@example.com"
              />
            </SettingsField>

            <SettingsField label="Contact Phone">
              <SettingsInput
                type="tel"
                value={settings.contactPhone}
                onChange={(e) => setSettings((s) => ({ ...s, contactPhone: e.target.value }))}
                placeholder="+1 (555) 123-4567"
              />
            </SettingsField>
          </div>
        </div>
      </SettingsForm>
    </div>
  )
}
