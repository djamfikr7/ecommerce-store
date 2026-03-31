'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCcw, AlertTriangle, DollarSign, XCircle, CheckCircle, Package } from 'lucide-react'

interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
}

interface OrderRefundProps {
  orderId: string
  orderTotal: number
  items: OrderItem[]
  onRefund?: (
    type: 'full' | 'partial' | 'item',
    amount: number,
    reason: string,
    note: string,
    itemIds?: string[],
  ) => void
}

const refundReasons = [
  { value: 'defective', label: 'Product defective or damaged' },
  { value: 'wrong_item', label: 'Wrong item received' },
  { value: 'not_as_described', label: 'Item not as described' },
  { value: 'changed_mind', label: 'Customer changed mind' },
  { value: 'late_delivery', label: 'Delivery too late' },
  { value: 'duplicate', label: 'Duplicate charge' },
  { value: 'other', label: 'Other reason' },
]

export function OrderRefund({ orderId, orderTotal, items, onRefund }: OrderRefundProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [refundType, setRefundType] = useState<'full' | 'partial' | 'item'>('full')
  const [amount, setAmount] = useState(orderTotal.toFixed(2))
  const [reason, setReason] = useState('')
  const [additionalNote, setAdditionalNote] = useState('')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [step, setStep] = useState<'type' | 'details' | 'confirm' | 'success'>('type')
  const [isProcessing, setIsProcessing] = useState(false)

  const resetState = () => {
    setRefundType('full')
    setAmount(orderTotal.toFixed(2))
    setReason('')
    setAdditionalNote('')
    setSelectedItems([])
    setStep('type')
  }

  const handleOpen = () => {
    resetState()
    setIsOpen(true)
  }

  const handleClose = () => setIsOpen(false)

  const toggleItem = (id: string) => {
    setSelectedItems((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const selectedItemTotal = items
    .filter((i) => selectedItems.includes(i.id))
    .reduce((sum, i) => sum + i.price * i.quantity, 0)

  const computedAmount =
    refundType === 'full'
      ? orderTotal
      : refundType === 'item'
        ? selectedItemTotal
        : parseFloat(amount) || 0

  const isValid =
    reason !== '' &&
    computedAmount > 0 &&
    computedAmount <= orderTotal &&
    (refundType !== 'item' || selectedItems.length > 0)

  const handleConfirm = async () => {
    setIsProcessing(true)
    await new Promise((r) => setTimeout(r, 2000))
    onRefund?.(
      refundType,
      computedAmount,
      reason,
      additionalNote,
      refundType === 'item' ? selectedItems : undefined,
    )
    setIsProcessing(false)
    setStep('success')
  }

  return (
    <>
      {/* Trigger */}
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2 font-medium text-slate-300 transition-colors hover:bg-slate-700/50"
      >
        <RefreshCcw size={18} />
        Issue Refund
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
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2"
            >
              <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/95 shadow-2xl backdrop-blur-md">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-700/50 p-6">
                  <h2 className="text-xl font-semibold text-white">
                    {step === 'success' ? 'Refund Issued' : 'Issue Refund'}
                  </h2>
                  <button
                    onClick={handleClose}
                    className="rounded-lg bg-slate-700/50 p-2 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
                  >
                    <XCircle size={20} />
                  </button>
                </div>

                {/* Content */}
                <div className="max-h-[70vh] overflow-y-auto p-6">
                  {/* STEP: TYPE */}
                  {step === 'type' && (
                    <div className="space-y-4">
                      <p className="text-sm text-slate-400">
                        Choose refund type for order{' '}
                        <span className="font-medium text-cyan-400">{orderId}</span>
                      </p>

                      {[
                        {
                          type: 'full' as const,
                          title: 'Full Refund',
                          desc: `Refund entire order ($${orderTotal.toFixed(2)})`,
                        },
                        {
                          type: 'partial' as const,
                          title: 'Partial Refund',
                          desc: 'Enter a custom refund amount',
                        },
                        {
                          type: 'item' as const,
                          title: 'Item Refund',
                          desc: 'Select specific items to refund',
                        },
                      ].map((opt) => (
                        <button
                          key={opt.type}
                          onClick={() => {
                            setRefundType(opt.type)
                            if (opt.type === 'full') setAmount(orderTotal.toFixed(2))
                            setStep('details')
                          }}
                          className="flex w-full items-center gap-4 rounded-xl border border-slate-700 bg-slate-900/50 p-4 text-left transition-all hover:border-cyan-500/50 hover:bg-slate-800/50"
                        >
                          <div className="rounded-lg bg-cyan-500/20 p-2">
                            <DollarSign className="text-cyan-400" size={20} />
                          </div>
                          <div>
                            <p className="font-medium text-white">{opt.title}</p>
                            <p className="text-sm text-slate-500">{opt.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* STEP: DETAILS */}
                  {step === 'details' && (
                    <div className="space-y-5">
                      {/* Warning */}
                      <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                        <AlertTriangle className="mt-0.5 flex-shrink-0 text-amber-400" size={18} />
                        <div>
                          <p className="text-sm font-medium text-amber-400">
                            Refund processed via Stripe
                          </p>
                          <p className="mt-1 text-sm text-amber-400/70">
                            Customer receives refund within 5-10 business days.
                          </p>
                        </div>
                      </div>

                      {/* Item Selection */}
                      {refundType === 'item' && (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-slate-300">
                            Select Items to Refund
                          </label>
                          <div className="space-y-2">
                            {items.map((item) => (
                              <button
                                key={item.id}
                                onClick={() => toggleItem(item.id)}
                                className={`flex w-full items-center gap-3 rounded-xl border p-3 transition-all ${
                                  selectedItems.includes(item.id)
                                    ? 'border-cyan-500/40 bg-cyan-500/10'
                                    : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
                                }`}
                              >
                                <div
                                  className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
                                    selectedItems.includes(item.id)
                                      ? 'border-cyan-500 bg-cyan-500'
                                      : 'border-slate-600'
                                  }`}
                                >
                                  {selectedItems.includes(item.id) && (
                                    <CheckCircle size={14} className="text-white" />
                                  )}
                                </div>
                                <div className="flex-1 text-left">
                                  <p className="text-sm font-medium text-slate-200">{item.name}</p>
                                  <p className="text-xs text-slate-500">
                                    Qty: {item.quantity} × ${item.price.toFixed(2)}
                                  </p>
                                </div>
                                <p className="text-sm font-medium text-slate-300">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </p>
                              </button>
                            ))}
                          </div>
                          {selectedItems.length > 0 && (
                            <p className="pt-1 text-right text-sm font-medium text-cyan-400">
                              Selected: ${selectedItemTotal.toFixed(2)}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Partial Amount */}
                      {refundType === 'partial' && (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-slate-300">
                            Refund Amount
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                              $
                            </span>
                            <input
                              type="number"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              min="0.01"
                              max={orderTotal}
                              step="0.01"
                              className="w-full rounded-xl border border-slate-700 bg-slate-900/50 py-2.5 pl-8 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                            />
                          </div>
                          <p className="text-xs text-slate-500">Max: ${orderTotal.toFixed(2)}</p>
                        </div>
                      )}

                      {/* Reason */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-300">
                          Reason <span className="text-red-400">*</span>
                        </label>
                        <select
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          className="w-full cursor-pointer rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                        >
                          <option value="">Select a reason</option>
                          {refundReasons.map((r) => (
                            <option key={r.value} value={r.value}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Note */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-300">
                          Additional Notes
                        </label>
                        <textarea
                          value={additionalNote}
                          onChange={(e) => setAdditionalNote(e.target.value)}
                          rows={2}
                          placeholder="Additional details..."
                          className="w-full resize-none rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-2.5 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 pt-1">
                        <button
                          onClick={() => setStep('type')}
                          className="flex-1 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2.5 font-medium text-slate-300 transition-colors hover:bg-slate-700/50"
                        >
                          Back
                        </button>
                        <button
                          onClick={() => setStep('confirm')}
                          disabled={!isValid}
                          className="flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 px-4 py-2.5 font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Continue
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP: CONFIRM */}
                  {step === 'confirm' && (
                    <div className="space-y-5">
                      <div className="space-y-3 rounded-xl bg-slate-900/50 p-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Order ID</span>
                          <span className="font-medium text-white">{orderId}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Type</span>
                          <span className="text-white">
                            {refundType === 'full'
                              ? 'Full Refund'
                              : refundType === 'partial'
                                ? 'Partial Refund'
                                : 'Item Refund'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Reason</span>
                          <span className="text-white">
                            {refundReasons.find((r) => r.value === reason)?.label}
                          </span>
                        </div>
                        <div className="flex justify-between border-t border-slate-700/50 pt-2">
                          <span className="font-medium text-slate-300">Refund Amount</span>
                          <span className="text-lg font-bold text-cyan-400">
                            ${computedAmount.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 rounded-xl bg-slate-700/30 p-4">
                        <DollarSign className="flex-shrink-0 text-slate-400" size={18} />
                        <p className="text-sm text-slate-400">
                          Refund will be processed via Stripe and may take 5-10 business days.
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => setStep('details')}
                          className="flex-1 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2.5 font-medium text-slate-300 transition-colors hover:bg-slate-700/50"
                        >
                          Back
                        </button>
                        <button
                          onClick={handleConfirm}
                          disabled={isProcessing}
                          className="flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 px-4 py-2.5 font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
                        >
                          {isProcessing ? (
                            <span className="flex items-center justify-center gap-2">
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                              Processing...
                            </span>
                          ) : (
                            'Issue Refund'
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP: SUCCESS */}
                  {step === 'success' && (
                    <div className="space-y-4 py-6 text-center">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
                        <CheckCircle className="text-emerald-400" size={32} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          Refund Issued Successfully
                        </h3>
                        <p className="mt-1 text-sm text-slate-400">
                          ${computedAmount.toFixed(2)} refunded to customer
                        </p>
                      </div>
                      <button
                        onClick={handleClose}
                        className="rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 px-6 py-2.5 font-medium text-white transition-opacity hover:opacity-90"
                      >
                        Done
                      </button>
                    </div>
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
