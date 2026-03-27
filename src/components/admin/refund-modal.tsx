"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCcw, AlertTriangle, DollarSign, XCircle } from "lucide-react";

interface RefundModalProps {
  orderId: string;
  total: number;
}

const refundReasons = [
  { value: "defective", label: "Product defective or damaged" },
  { value: "wrong_item", label: "Wrong item received" },
  { value: "not_as_described", label: "Item not as described" },
  { value: "changed_mind", label: "Customer changed mind" },
  { value: "late_delivery", label: "Delivery too late" },
  { value: "other", label: "Other reason" },
];

export function RefundModal({ orderId, total }: RefundModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [refundType, setRefundType] = useState<"full" | "partial">("full");
  const [amount, setAmount] = useState(total.toFixed(2));
  const [reason, setReason] = useState("");
  const [additionalNote, setAdditionalNote] = useState("");
  const [step, setStep] = useState<"details" | "confirm">("details");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleOpen = () => {
    setRefundType("full");
    setAmount(total.toFixed(2));
    setReason("");
    setAdditionalNote("");
    setStep("details");
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setIsOpen(false);
    // In a real app, you would process the refund here
  };

  const isValid =
    (refundType === "full" || parseFloat(amount) > 0) &&
    parseFloat(amount) <= total &&
    reason !== "";

  return (
    <>
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 text-slate-300 font-medium border border-slate-700 hover:bg-slate-700/50 transition-colors"
      >
        <RefreshCcw size={18} />
        Issue Refund
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={handleClose}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
            >
              <div className="bg-slate-800/95 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
                  <h2 className="text-xl font-semibold text-white">
                    {step === "details" ? "Issue Refund" : "Confirm Refund"}
                  </h2>
                  <button
                    onClick={handleClose}
                    className="p-2 rounded-lg bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                  >
                    <XCircle size={20} />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6">
                  {step === "details" ? (
                    <div className="space-y-6">
                      {/* Warning */}
                      <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                        <AlertTriangle className="text-amber-400 flex-shrink-0" size={20} />
                        <div>
                          <p className="text-amber-400 font-medium">
                            Refund will be processed via Stripe
                          </p>
                          <p className="text-amber-400/70 text-sm mt-1">
                            The customer will receive the refund within 5-10 business
                            days.
                          </p>
                        </div>
                      </div>

                      {/* Refund Type */}
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-slate-300">
                          Refund Type
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => {
                              setRefundType("full");
                              setAmount(total.toFixed(2));
                            }}
                            className={`p-4 rounded-xl border transition-all ${
                              refundType === "full"
                                ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400"
                                : "bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-600"
                            }`}
                          >
                            <p className="font-medium">Full Refund</p>
                            <p className="text-sm mt-1">${total.toFixed(2)}</p>
                          </button>
                          <button
                            onClick={() => setRefundType("partial")}
                            className={`p-4 rounded-xl border transition-all ${
                              refundType === "partial"
                                ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400"
                                : "bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-600"
                            }`}
                          >
                            <p className="font-medium">Partial Refund</p>
                            <p className="text-sm mt-1">Custom amount</p>
                          </button>
                        </div>
                      </div>

                      {/* Amount (for partial) */}
                      {refundType === "partial" && (
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
                              max={total}
                              step="0.01"
                              className="w-full pl-8 pr-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                            />
                          </div>
                          <p className="text-xs text-slate-500">
                            Maximum: ${total.toFixed(2)}
                          </p>
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
                          className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 cursor-pointer"
                        >
                          <option value="">Select a reason</option>
                          {refundReasons.map((r) => (
                            <option key={r.value} value={r.value}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Additional Note */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-300">
                          Additional Notes
                        </label>
                        <textarea
                          value={additionalNote}
                          onChange={(e) => setAdditionalNote(e.target.value)}
                          rows={3}
                          placeholder="Any additional information about this refund..."
                          className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
                        />
                      </div>

                      {/* Continue Button */}
                      <button
                        onClick={() => setStep("confirm")}
                        disabled={!isValid}
                        className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Continue
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Summary */}
                      <div className="p-4 bg-slate-900/50 rounded-xl space-y-3">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Order ID</span>
                          <span className="text-white font-medium">{orderId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Refund Type</span>
                          <span className="text-white">
                            {refundType === "full" ? "Full Refund" : "Partial Refund"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Amount</span>
                          <span className="text-cyan-400 font-semibold text-lg">
                            ${parseFloat(amount).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Reason</span>
                          <span className="text-white">
                            {refundReasons.find((r) => r.value === reason)?.label}
                          </span>
                        </div>
                      </div>

                      {/* Stripe Processing Info */}
                      <div className="flex items-start gap-3 p-4 bg-slate-700/30 rounded-xl">
                        <DollarSign className="text-slate-400 flex-shrink-0" size={20} />
                        <div>
                          <p className="text-slate-300 font-medium">
                            Stripe Payment Processing
                          </p>
                          <p className="text-slate-400 text-sm mt-1">
                            The refund will be processed through Stripe and may take
                            5-10 business days to appear on the customer&apos;s statement.
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => setStep("details")}
                          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800/50 text-slate-300 font-medium border border-slate-700 hover:bg-slate-700/50 transition-colors"
                        >
                          Back
                        </button>
                        <button
                          onClick={handleConfirm}
                          disabled={isProcessing}
                          className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                          {isProcessing ? (
                            <span className="flex items-center justify-center gap-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Processing...
                            </span>
                          ) : (
                            "Issue Refund"
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
