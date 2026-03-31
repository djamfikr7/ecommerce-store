'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import { useNotificationStore } from '@/lib/stores/notification-store'
import {
  SettingsForm,
  SettingsField,
  SettingsInput,
  SettingsToggle,
} from '@/components/admin/settings-form'

interface PaymentSettings {
  stripePublishableKey: string
  stripeSecretKey: string
  testMode: boolean
}

const defaultSettings: PaymentSettings = {
  stripePublishableKey: '',
  stripeSecretKey: '',
  testMode: true,
}

function maskKey(key: string): string {
  if (!key || key.length < 12) return key
  return `${key.slice(0, 7)}${'\u2022'.repeat(Math.min(key.length - 11, 20))}${key.slice(-4)}`
}

export default function PaymentsSettingsPage() {
  const addToast = useNotificationStore((s) => s.addToast)
  const [settings, setSettings] = useState<PaymentSettings>(defaultSettings)
  const [original, setOriginal] = useState<PaymentSettings>(defaultSettings)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showSecretKey, setShowSecretKey] = useState(false)
  const [showPublishableKey, setShowPublishableKey] = useState(false)

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/settings?group=payments')
      const json = await res.json()
      if (json.success && json.data) {
        const loaded: PaymentSettings = {
          stripePublishableKey: json.data.stripePublishableKey ?? '',
          stripeSecretKey: json.data.stripeSecretKey ?? '',
          testMode: json.data.testMode ?? true,
        }
        setSettings(loaded)
        setOriginal(loaded)
      }
    } catch (err) {
      console.error('Failed to load payment settings:', err)
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
    if (settings.stripePublishableKey && !settings.stripePublishableKey.startsWith('pk_')) {
      errs.stripePublishableKey = 'Publishable key must start with pk_'
    }
    if (settings.stripeSecretKey && !settings.stripeSecretKey.startsWith('sk_')) {
      errs.stripeSecretKey = 'Secret key must start with sk_'
    }
    if (
      settings.stripePublishableKey &&
      settings.testMode &&
      !settings.stripePublishableKey.startsWith('pk_test_')
    ) {
      errs.stripePublishableKey =
        'Test mode is enabled but key does not appear to be a test key (pk_test_)'
    }
    if (
      settings.stripeSecretKey &&
      settings.testMode &&
      !settings.stripeSecretKey.startsWith('sk_test_')
    ) {
      errs.stripeSecretKey =
        'Test mode is enabled but key does not appear to be a test key (sk_test_)'
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
        body: JSON.stringify({ group: 'payments', settings }),
      })
      const json = await res.json()
      if (!json.success) throw new Error('Save failed')
      setOriginal(settings)
      addToast({
        type: 'success',
        title: 'Settings saved',
        message: 'Payment settings have been updated',
      })
    } catch {
      addToast({
        type: 'error',
        title: 'Save failed',
        message: 'Could not save payment settings',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setSettings(original)
    setErrors({})
    setShowSecretKey(false)
    setShowPublishableKey(false)
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
          <h1 className="text-2xl font-bold text-white lg:text-3xl">Payment Settings</h1>
          <p className="mt-1 text-slate-400">Configure Stripe payment integration</p>
        </div>
      </div>

      {/* Test Mode Warning */}
      {settings.testMode && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <AlertTriangle size={20} className="mt-0.5 flex-shrink-0 text-amber-400" />
          <div>
            <p className="text-sm font-medium text-amber-400">Test Mode Active</p>
            <p className="mt-1 text-xs text-amber-300/70">
              Payments are processed using Stripe test keys. No real charges will be made. Use test
              card 4242 4242 4242 4242 for testing.
            </p>
          </div>
        </div>
      )}

      <SettingsForm
        title="Stripe Configuration"
        description="Enter your Stripe API keys to accept payments"
        onSave={handleSave}
        onReset={handleReset}
        isSaving={isSaving}
        hasChanges={hasChanges}
        errors={errors}
      >
        <SettingsToggle
          label="Test Mode"
          description="Use Stripe test keys for development and testing"
          checked={settings.testMode}
          onChange={(checked) => setSettings((s) => ({ ...s, testMode: checked }))}
        />

        <div className="space-y-6 border-t border-slate-700/50 pt-6">
          <SettingsField
            label="Publishable Key"
            description={
              settings.testMode
                ? 'Your pk_test_... key from the Stripe dashboard'
                : 'Your pk_live_... key from the Stripe dashboard'
            }
            error={errors.stripePublishableKey}
          >
            <div className="relative">
              <SettingsInput
                error={!!errors.stripePublishableKey}
                type={showPublishableKey ? 'text' : 'password'}
                value={settings.stripePublishableKey}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    stripePublishableKey: e.target.value,
                  }))
                }
                placeholder={settings.testMode ? 'pk_test_...' : 'pk_live_...'}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPublishableKey(!showPublishableKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-200"
              >
                {showPublishableKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {settings.stripePublishableKey && !showPublishableKey && (
              <p className="mt-1 text-xs text-slate-500">
                Current: {maskKey(settings.stripePublishableKey)}
              </p>
            )}
          </SettingsField>

          <SettingsField
            label="Secret Key"
            description="Your secret key. Never share this with anyone."
            error={errors.stripeSecretKey}
          >
            <div className="relative">
              <SettingsInput
                error={!!errors.stripeSecretKey}
                type={showSecretKey ? 'text' : 'password'}
                value={settings.stripeSecretKey}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    stripeSecretKey: e.target.value,
                  }))
                }
                placeholder={settings.testMode ? 'sk_test_...' : 'sk_live_...'}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowSecretKey(!showSecretKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-200"
              >
                {showSecretKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {settings.stripeSecretKey && !showSecretKey && (
              <p className="mt-1 text-xs text-slate-500">
                Current: {maskKey(settings.stripeSecretKey)}
              </p>
            )}
          </SettingsField>
        </div>
      </SettingsForm>
    </div>
  )
}
