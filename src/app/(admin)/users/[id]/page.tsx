import { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingCart,
  DollarSign,
  UserCog,
  Ban,
  Shield,
} from "lucide-react";

type UserRole = "customer" | "admin" | "moderator";
type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

interface Address {
  id: string;
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface Order {
  id: string;
  date: string;
  status: OrderStatus;
  total: number;
  items: number;
}

// Mock user data
const user = {
  id: "1",
  name: "Sarah Mitchell",
  email: "sarah.m@email.com",
  phone: "+1 (555) 123-4567",
  role: "customer" as UserRole,
  joined: "June 15, 2023",
  totalOrders: 12,
  totalSpent: 2450.99,
  addresses: [
    {
      id: "1",
      name: "Home",
      line1: "123 Oak Street",
      line2: "Apt 4B",
      city: "San Francisco",
      state: "CA",
      postalCode: "94102",
      country: "United States",
      isDefault: true,
    },
    {
      id: "2",
      name: "Work",
      line1: "456 Market Street",
      line2: "Floor 12",
      city: "San Francisco",
      state: "CA",
      postalCode: "94105",
      country: "United States",
      isDefault: false,
    },
  ] as Address[],
  orders: [
    { id: "ORD-001", date: "January 15, 2024", status: "processing", total: 249.99, items: 3 },
    { id: "ORD-008", date: "January 13, 2024", status: "delivered", total: 99.5, items: 2 },
    { id: "ORD-015", date: "December 20, 2023", status: "delivered", total: 189.99, items: 1 },
    { id: "ORD-022", date: "November 15, 2023", status: "delivered", total: 450.0, items: 4 },
  ] as Order[],
};

const roleColors: Record<UserRole, string> = {
  customer: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  admin: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  moderator: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
};

const statusColors: Record<OrderStatus, string> = {
  pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  processing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  shipped: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  delivered: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
};

export const metadata: Metadata = {
  title: `User ${user.name} | Admin`,
  description: "User Details",
};

export default function UserDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/users"
            className="p-2 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
              {user.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl lg:text-3xl font-bold text-white">{user.name}</h1>
                <span
                  className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${roleColors[user.role]}`}
                >
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
              </div>
              <p className="text-slate-400 mt-1">Customer since {user.joined}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 text-slate-300 font-medium border border-slate-700 hover:bg-slate-700/50 transition-colors">
            <Mail size={18} />
            Send Email
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 text-slate-300 font-medium border border-slate-700 hover:bg-slate-700/50 transition-colors">
            <UserCog size={18} />
            Edit User
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-cyan-500/20">
              <ShoppingCart className="text-cyan-400" size={24} />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Orders</p>
              <p className="text-2xl font-bold text-white">{user.totalOrders}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/20">
              <DollarSign className="text-emerald-400" size={24} />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Spent</p>
              <p className="text-2xl font-bold text-white">${user.totalSpent.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-500/20">
              <Calendar className="text-purple-400" size={24} />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Average Order</p>
              <p className="text-2xl font-bold text-white">
                ${(user.totalSpent / user.totalOrders).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order History */}
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
            <div className="p-6 border-b border-slate-700/50">
              <h2 className="text-lg font-semibold text-white">Order History</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {user.orders.map((order, index) => (
                    <tr
                      key={order.id}
                      className={`hover:bg-slate-700/20 transition-colors ${
                        index % 2 === 0 ? "bg-slate-800/20" : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-cyan-400 font-medium hover:text-cyan-300"
                        >
                          {order.id}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-slate-400">{order.date}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${
                            statusColors[order.status]
                          }`}
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400">{order.items}</td>
                      <td className="px-6 py-4 text-right text-slate-200 font-medium">
                        ${order.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Info */}
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
            <div className="p-6 border-b border-slate-700/50">
              <h2 className="text-lg font-semibold text-white">Contact Information</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-slate-400" />
                <a
                  href={`mailto:${user.email}`}
                  className="text-slate-200 hover:text-cyan-400 transition-colors"
                >
                  {user.email}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-slate-400" />
                <a
                  href={`tel:${user.phone}`}
                  className="text-slate-200 hover:text-cyan-400 transition-colors"
                >
                  {user.phone}
                </a>
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
            <div className="p-6 border-b border-slate-700/50">
              <h2 className="text-lg font-semibold text-white">Saved Addresses</h2>
            </div>
            <div className="p-6 space-y-4">
              {user.addresses.map((address) => (
                <div
                  key={address.id}
                  className="p-4 bg-slate-900/50 rounded-xl border border-slate-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-200 font-medium">{address.name}</span>
                    {address.isDefault && (
                      <span className="text-xs text-cyan-400 bg-cyan-500/20 px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="text-slate-500 mt-0.5" />
                    <div className="text-slate-400 text-sm">
                      <p>{address.line1}</p>
                      {address.line2 && <p>{address.line2}</p>}
                      <p>
                        {address.city}, {address.state} {address.postalCode}
                      </p>
                      <p>{address.country}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Account Actions */}
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
            <div className="p-6 border-b border-slate-700/50">
              <h2 className="text-lg font-semibold text-white">Account Actions</h2>
            </div>
            <div className="p-6 space-y-3">
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/50 text-slate-300 hover:bg-slate-800 transition-colors">
                <Shield size={18} />
                Change Role
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/50 text-slate-300 hover:bg-slate-800 transition-colors">
                <UserCog size={18} />
                Reset Password
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                <Ban size={18} />
                Disable Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
