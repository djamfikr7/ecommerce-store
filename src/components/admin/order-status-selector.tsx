'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  ChevronDown,
  AlertTriangle,
  TruckIcon,
} from 'lucide-react'

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

interface OrderStatusSelectorProps {
  orderId: string
  currentStatus: OrderStatus
  onStatusChange?: (status: OrderStatus, note: string, trackingNumber?: string) => void
}

const statusConfig: Record<
  OrderStatus,
  { icon: typeof Clock; label: string; color: string; bgColor: string; borderColor: string }
> = {
  pending: {
    icon: Clock,
    label: 'Pending',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
    borderColor: 'border-amber-500/30',
  },
  processing: {
    icon: Package,
    label: 'Processing',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/30',
  },
  shipped: {
    icon: Truck,
    label: 'Shipped',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/30',
  },
  delivered: {
    icon: CheckCircle,
    label: 'Delivered',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
    borderColor: 'border-emerald-500/30',
  },
  cancelled: {
    icon: XCircle,
    label: 'Cancelled',
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/30',
  },
}

const statusFlow: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered']

export function OrderStatusSelector({
  orderId,
  currentStatus,
  onStatusChange,
}: OrderStatusSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null)
  const [note, setNote] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [sendNotification, setSendNotification] = useState(true)
  const [step, setStep] = useState<'select' | 'confirm'>('select')
  const [isUpdating, setIsUpdating] = useState(false)

  const currentIndex = statusFlow.indexOf(currentStatus)
  const availableStatuses = statusFlow.filter(
    (s, i) => i > currentIndex && currentStatus !== 'cancelled',
  )

  const handleOpen = () => {
    setSelectedStatus(null)
    setNote('')
    setTrackingNumber('')
    setSendNotification(true)
    setStep('select')
    setIsOpen(true)
  }

  const handleClose = () => setIsOpen(false)

  const handleSelectStatus = (status: OrderStatus) => {
    setSelectedStatus(status)
    setStep('confirm')
  }

  const handleConfirm = async () => {
    if (!selectedStatus) return
    setIsUpdating(true)
    await new Promise((r) => setTimeout(r, 1200))
    onStatusChange?.(
      selectedStatus,
      note,
      selectedStatus === 'shipped' ? trackingNumber : undefined,
    )
    setIsUpdating(false)
    setIsOpen(false)
  }

  const config = statusConfig[currentStatus]
  const CurrentIcon = config.icon

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={handleOpen}
        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 font-medium transition-all ${config.bgColor} ${config.color} border ${config.borderColor} hover:brightness-110`}
      >
        <CurrentIcon size={16} />
        {config.label}
        <ChevronDown size={14} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={handleClose}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2"
            >
              <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/95 shadow-2xl backdrop-blur-md">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-700/50 p-6">
                  <h2 className="text-xl font-semibold text-white">
                    {step === 'select' ? 'Update Status' : 'Confirm Change'}
                  </h2>
                  <button
                    onClick={handleClose}
                    className="rounded-lg bg-slate-700/50 p-2 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
                  >
                    <XCircle size={20} />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6">
                  {step === 'select' ? (
                    <div className="space-y-3">
                      <p className="mb-4 text-sm text-slate-400">
                        Select new status for order{' '}
                        <span className="font-medium text-cyan-400">{orderId}</span>
                      </p>

                      {availableStatuses.length === 0 && currentStatus !== 'cancelled' ? (
                        <div className="p-6 text-center">
                          <CheckCircle className="mx-auto mb-3 text-emerald-400" size={32} />
                          <p className="font-medium text-slate-300">Order is at final status</p>
                          <p className="mt-1 text-sm text-slate-500">
                            No further status transitions available.
                          </p>
                        </div>
                      ) : (
                        <>
                          {availableStatuses.map((status) => {
                            const cfg = statusConfig[status]
                            const Icon = cfg.icon
                            return (
                              <button
                                key={status}
                                onClick={() => handleSelectStatus(status)}
                                className="flex w-full items-center gap-4 rounded-xl border border-slate-700 bg-slate-900/50 p-4 transition-all hover:border-cyan-500/50 hover:bg-slate-800/50"
                              >
                                <div className={`rounded-lg p-2 ${cfg.bgColor}`}>
                                  <Icon className={cfg.color} size={20} />
                                </div>
                                <div className="flex-1 text-left">
                                  <p className="font-medium text-white">{cfg.label}</p>
                                  <p className="text-sm text-slate-500">
                                    {status === 'shipped'
                                      ? 'Requires tracking number'
                                      : status === 'delivered'
                                        ? 'Mark as completed'
                                        : 'Begin processing'}
                                  </p>
                                </div>
                              </button>
                            )
                          })}

                          {currentStatus !== 'cancelled' && (
                            <button
                              onClick={() => handleSelectStatus('cancelled')}
                              className="flex w-full items-center gap-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4 transition-all hover:border-red-500/50 hover:bg-red-500/10"
                            >
                              <div className="rounded-lg bg-red-500/20 p-2">
                                <XCircle className="text-red-400" size={20} />
                              </div>
                              <div className="flex-1 text-left">
                                <p className="font-medium text-red-400">Cancel Order</p>
                                <p className="text-sm text-slate-500">
                                  This action cannot be undone
                                </p>
                              </div>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  ) : (
                    selectedStatus && (
                      <div className="space-y-5">
                        {/* Status Preview */}
                        <div className="flex items-center gap-4 rounded-xl bg-slate-900/50 p-4">
                          <div className={`rounded-lg p-3 ${statusConfig[selectedStatus].bgColor}`}>
                            {(() => {
                              const Icon = statusConfig[selectedStatus].icon
                              return (
                                <Icon className={statusConfig[selectedStatus].color} size={24} />
                              )
                            })()}
                          </div>
                          <div>
                            <p className="font-medium text-white">
                              Set to{' '}
                              <span className={statusConfig[selectedStatus].color}>
                                {statusConfig[selectedStatus].label}
                              </span>
                            </p>
                            <p className="text-sm text-slate-500">
                              {statusConfig[currentStatus].label} →{' '}
                              {statusConfig[selectedStatus].label}
                            </p>
                          </div>
                        </div>

                        {/* Cancel Warning */}
                        {selectedStatus === 'cancelled' && (
                          <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                            <AlertTriangle
                              className="mt-0.5 flex-shrink-0 text-amber-400"
                              size={18}
                            />
                            <p className="text-sm text-amber-400/80">
                              Cancelling this order will release reserved inventory and notify the
                              customer. This cannot be undone.
                            </p>
                          </div>
                        )}

                        {/* Tracking Number for Shipped */}
                        {selectedStatus === 'shipped' && (
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-300">
                              Tracking Number <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                              <TruckIcon
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                                size={18}
                              />
                              <input
                                type="text"
                                value={trackingNumber}
                                onChange={(e) => setTrackingNumber(e.target.value)}
                                placeholder="Enter tracking number..."
                                className="w-full rounded-xl border border-slate-700 bg-slate-900/50 py-2.5 pl-10 pr-4 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                              />
                            </div>
                          </div>
                        )}

                        {/* Note */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-slate-300">
                            Note (optional)
                          </label>
                          <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={2}
                            placeholder="Add a note about this change..."
                            className="w-full resize-none rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-2.5 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                          />
                        </div>

                        {/* Notification Toggle */}
                        <label className="flex cursor-pointer items-center gap-3">
                          <div
                            onClick={() => setSendNotification(!sendNotification)}
                            className={`relative h-6 w-10 rounded-full transition-colors ${
                              sendNotification ? 'bg-cyan-500' : 'bg-slate-600'
                            }`}
                          >
                            <div
                              className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                                sendNotification ? 'translate-x-5' : 'translate-x-1'
                              }`}
                            />
                          </div>
                          <span className="text-sm text-slate-300">
                            Send email notification to customer
                          </span>
                        </label>

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={() => setStep('select')}
                            className="flex-1 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2.5 font-medium text-slate-300 transition-colors hover:bg-slate-700/50"
                          >
                            Back
                          </button>
                          <button
                            onClick={handleConfirm}
                            disabled={
                              isUpdating || (selectedStatus === 'shipped' && !trackingNumber.trim())
                            }
                            className={`flex-1 rounded-xl px-4 py-2.5 font-medium transition-all ${
                              selectedStatus === 'cancelled'
                                ? 'border border-red-500/30 bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                : 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:opacity-90'
                            } disabled:cursor-not-allowed disabled:opacity-50`}
                          >
                            {isUpdating ? (
                              <span className="flex items-center justify-center gap-2">
                                <div className="border-current/30 h-4 w-4 animate-spin rounded-full border-2 border-t-current" />
                                Updating...
                              </span>
                            ) : (
                              'Confirm'
                            )}
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
