"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";

type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

interface OrderStatusModalProps {
  orderId: string;
  currentStatus: OrderStatus;
}

const statusConfig: Record<
  OrderStatus,
  { icon: typeof Clock; label: string; color: string }
> = {
  pending: { icon: Clock, label: "Pending", color: "text-amber-400" },
  processing: { icon: Package, label: "Processing", color: "text-blue-400" },
  shipped: { icon: Truck, label: "Shipped", color: "text-purple-400" },
  delivered: { icon: CheckCircle, label: "Delivered", color: "text-emerald-400" },
  cancelled: { icon: XCircle, label: "Cancelled", color: "text-red-400" },
};

const statusFlow: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
];

const irreversibleStatuses: OrderStatus[] = ["cancelled", "refunded"];

export function OrderStatusModal({ orderId, currentStatus }: OrderStatusModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null);
  const [note, setNote] = useState("");
  const [step, setStep] = useState<"select" | "confirm">("select");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleOpen = () => {
    setSelectedStatus(null);
    setNote("");
    setStep("select");
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSelectStatus = (status: OrderStatus) => {
    setSelectedStatus(status);
    setStep("confirm");
  };

  const handleConfirm = async () => {
    if (!selectedStatus) return;

    setIsUpdating(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsUpdating(false);
    setIsOpen(false);
    // In a real app, you would update the order status here
  };

  const isIrreversible = selectedStatus
    ? irreversibleStatuses.includes(selectedStatus)
    : false;

  const CurrentStatusIcon = statusConfig[currentStatus].icon;

  return (
    <>
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium hover:opacity-90 transition-opacity"
      >
        <CurrentStatusIcon size={18} />
        Update Status
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
                    {step === "select" ? "Update Order Status" : "Confirm Status Change"}
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
                  {step === "select" ? (
                    <div className="space-y-3">
                      <p className="text-slate-400 text-sm mb-4">
                        Select a new status for order {orderId}
                      </p>
                      {statusFlow.map((status) => {
                        const config = statusConfig[status];
                        const Icon = config.icon;
                        const isCurrent = status === currentStatus;

                        return (
                          <button
                            key={status}
                            onClick={() => handleSelectStatus(status)}
                            disabled={isCurrent}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                              isCurrent
                                ? "bg-slate-700/50 border-slate-600 cursor-not-allowed opacity-50"
                                : "bg-slate-900/50 border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800/50"
                            }`}
                          >
                            <div className={`p-2 rounded-lg ${config.color.replace("text-", "bg-")}/20`}>
                              <Icon className={config.color} size={20} />
                            </div>
                            <div className="flex-1 text-left">
                              <p className="text-white font-medium">{config.label}</p>
                              {isCurrent && (
                                <p className="text-slate-500 text-sm">Current status</p>
                              )}
                            </div>
                            {!isCurrent && <ChevronRight size={18} className="text-slate-500" />}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {selectedStatus && (
                        <>
                          <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-xl">
                            <div
                              className={`p-3 rounded-lg ${
                                statusConfig[selectedStatus].color.replace("text-", "bg-")
                              }/20`}
                            >
                              {(() => {
                                const Icon = statusConfig[selectedStatus].icon;
                                return (
                                  <Icon
                                    className={statusConfig[selectedStatus].color}
                                    size={24}
                                  />
                                );
                              })()}
                            </div>
                            <div>
                              <p className="text-white font-medium">
                                Change status to{" "}
                                <span className={statusConfig[selectedStatus].color}>
                                  {statusConfig[selectedStatus].label}
                                </span>
                              </p>
                              <p className="text-slate-500 text-sm">
                                Order: {orderId}
                              </p>
                            </div>
                          </div>

                          {isIrreversible && (
                            <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                              <AlertTriangle className="text-amber-400 flex-shrink-0" size={20} />
                              <div>
                                <p className="text-amber-400 font-medium">
                                  Warning: This action cannot be undone
                                </p>
                                <p className="text-amber-400/70 text-sm mt-1">
                                  Setting status to &quot;{selectedStatus}&quot; will permanently
                                  affect this order.
                                </p>
                              </div>
                            </div>
                          )}

                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-300">
                              Note (optional)
                            </label>
                            <textarea
                              value={note}
                              onChange={(e) => setNote(e.target.value)}
                              rows={3}
                              placeholder="Add a note about this status change..."
                              className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
                            />
                          </div>

                          <div className="flex gap-3">
                            <button
                              onClick={() => setStep("select")}
                              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800/50 text-slate-300 font-medium border border-slate-700 hover:bg-slate-700/50 transition-colors"
                            >
                              Back
                            </button>
                            <button
                              onClick={handleConfirm}
                              disabled={isUpdating}
                              className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-all ${
                                isIrreversible
                                  ? "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                                  : "bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:opacity-90"
                              } ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                              {isUpdating ? (
                                <span className="flex items-center justify-center gap-2">
                                  <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                                  Updating...
                                </span>
                              ) : (
                                "Confirm"
                              )}
                            </button>
                          </div>
                        </>
                      )}
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
