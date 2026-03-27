import { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  User,
  MapPin,
  CreditCard,
  FileText,
  RefreshCcw,
  Printer,
  MoreHorizontal,
} from "lucide-react";
import { AdminModal } from "@/components/admin/admin-modal";
import { OrderStatusModal } from "@/components/admin/order-status-modal";
import { RefundModal } from "@/components/admin/refund-modal";

type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

interface OrderItem {
  id: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
}

interface TimelineEvent {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

// Mock data
const order = {
  id: "ORD-001",
  date: "January 15, 2024 at 2:34 PM",
  status: "processing" as OrderStatus,
  customer: {
    name: "Sarah Mitchell",
    email: "sarah.m@email.com",
    phone: "+1 (555) 123-4567",
  },
  shippingAddress: {
    line1: "123 Oak Street",
    line2: "Apt 4B",
    city: "San Francisco",
    state: "CA",
    postalCode: "94102",
    country: "United States",
  },
  payment: {
    method: "Visa",
    last4: "4242",
    brand: "stripe",
  },
  items: [
    { id: "1", name: "Wireless Headphones Pro", image: "/products/headphones.jpg", quantity: 1, price: 199.99 },
    { id: "2", name: "USB-C Charging Cable", image: "/products/cable.jpg", quantity: 2, price: 24.99 },
  ] as OrderItem[],
  subtotal: 249.97,
  shipping: 0,
  tax: 20.02,
  total: 269.99,
  timeline: [
    { status: "pending", timestamp: "January 15, 2024 at 2:34 PM", note: "Order placed" },
    { status: "processing", timestamp: "January 15, 2024 at 4:00 PM", note: "Payment confirmed" },
  ] as TimelineEvent[],
};

const statusConfig: Record<OrderStatus, { icon: typeof Clock; color: string; label: string }> = {
  pending: { icon: Clock, color: "text-amber-400", label: "Pending" },
  processing: { icon: Package, color: "text-blue-400", label: "Processing" },
  shipped: { icon: Truck, color: "text-purple-400", label: "Shipped" },
  delivered: { icon: CheckCircle, color: "text-emerald-400", label: "Delivered" },
  cancelled: { icon: XCircle, color: "text-red-400", label: "Cancelled" },
};

export const metadata: Metadata = {
  title: `Order ${order.id} | Admin`,
  description: "Order Details",
};

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const currentStatusConfig = statusConfig[order.status];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/orders"
            className="p-2 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl lg:text-3xl font-bold text-white">{order.id}</h1>
              <span
                className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full border ${
                  order.status === "pending"
                    ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                    : order.status === "processing"
                    ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                    : order.status === "shipped"
                    ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                    : order.status === "delivered"
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    : "bg-red-500/20 text-red-400 border-red-500/30"
                }`}
              >
                <currentStatusConfig.icon size={14} />
                {currentStatusConfig.label}
              </span>
            </div>
            <p className="text-slate-400 mt-1">{order.date}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <OrderStatusModal orderId={order.id} currentStatus={order.status} />
          <RefundModal orderId={order.id} total={order.total} />
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 text-slate-300 font-medium border border-slate-700 hover:bg-slate-700/50 transition-colors">
            <Printer size={18} />
            Print Invoice
          </button>
          {order.status !== "cancelled" && order.status !== "delivered" && (
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 font-medium border border-red-500/30 hover:bg-red-500/30 transition-colors">
              <XCircle size={18} />
              Cancel Order
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
            <div className="p-6 border-b border-slate-700/50">
              <h2 className="text-lg font-semibold text-white">Order Items</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-xl"
                  >
                    <div className="w-16 h-16 bg-slate-700/50 rounded-lg flex items-center justify-center">
                      <Package className="text-slate-500" size={24} />
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-200 font-medium">{item.name}</p>
                      <p className="text-slate-500 text-sm">SKU: SKU-{item.id.padStart(4, "0")}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-200 font-medium">${item.price.toFixed(2)}</p>
                      <p className="text-slate-500 text-sm">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-cyan-400 font-semibold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Totals */}
              <div className="mt-6 pt-6 border-t border-slate-700/50 space-y-3">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Shipping</span>
                  <span>{order.shipping === 0 ? "Free" : `$${order.shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Tax</span>
                  <span>${order.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold text-white pt-3 border-t border-slate-700/50">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
            <div className="p-6 border-b border-slate-700/50">
              <h2 className="text-lg font-semibold text-white">Order Timeline</h2>
            </div>
            <div className="p-6">
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-700" />
                <div className="space-y-6">
                  {order.timeline.map((event, index) => {
                    const config = statusConfig[event.status];
                    const Icon = config.icon;
                    return (
                      <div key={index} className="relative flex gap-4">
                        <div
                          className={`relative z-10 w-8 h-8 rounded-full ${config.color.replace(
                            "text-",
                            "bg-"
                          )}/20 border-2 ${config.color.replace("text-", "border-")} flex items-center justify-center`}
                        >
                          <Icon size={14} />
                        </div>
                        <div className="flex-1 pb-6">
                          <p className={`font-medium ${config.color}`}>
                            {config.label}
                            {event.note && <span className="text-slate-400 font-normal ml-2">- {event.note}</span>}
                          </p>
                          <p className="text-slate-500 text-sm mt-1">{event.timestamp}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div className="relative flex gap-4">
                    <div className="relative z-10 w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center">
                      <Clock size={14} className="text-slate-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-400 font-medium">Order Created</p>
                      <p className="text-slate-500 text-sm mt-1">{order.date}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
            <div className="p-6 border-b border-slate-700/50">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <User size={18} />
                Customer
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-slate-200 font-medium">{order.customer.name}</p>
                <p className="text-slate-400 text-sm">{order.customer.email}</p>
                <p className="text-slate-400 text-sm">{order.customer.phone}</p>
              </div>
              <Link
                href={`/admin/users/${order.customer.email}`}
                className="inline-flex items-center gap-2 text-cyan-400 text-sm font-medium hover:text-cyan-300 transition-colors"
              >
                View Customer Profile
              </Link>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
            <div className="p-6 border-b border-slate-700/50">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <MapPin size={18} />
                Shipping Address
              </h2>
            </div>
            <div className="p-6">
              <p className="text-slate-200">{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && (
                <p className="text-slate-400">{order.shippingAddress.line2}</p>
              )}
              <p className="text-slate-400">
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.postalCode}
              </p>
              <p className="text-slate-400">{order.shippingAddress.country}</p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
            <div className="p-6 border-b border-slate-700/50">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <CreditCard size={18} />
                Payment
              </h2>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-8 bg-slate-700/50 rounded flex items-center justify-center">
                  <CreditCard size={20} className="text-slate-400" />
                </div>
                <div>
                  <p className="text-slate-200 font-medium">
                    {order.payment.method} ending in {order.payment.last4}
                  </p>
                  <p className="text-slate-500 text-sm">Processed via Stripe</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
