import { Metadata } from "next";
import Link from "next/link";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Clock,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { StatsCard } from "@/components/admin/stats-card";
import { ChartContainer } from "@/components/admin/chart-container";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Mock data - will be replaced by server actions from phase7-backend-admin
const statsData = {
  revenueToday: 12450,
  revenueChange: 12.5,
  ordersToday: 47,
  ordersChange: 8.2,
  visitorsToday: 1234,
  visitorsChange: -2.1,
  pendingOrders: 23,
  pendingChange: 5,
};

const salesData = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return {
    date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    revenue: Math.floor(Math.random() * 5000) + 3000,
    orders: Math.floor(Math.random() * 40) + 20,
  };
});

const recentOrders = [
  { id: "ORD-001", customer: "Sarah Mitchell", date: "2024-01-15", status: "processing", total: 249.99 },
  { id: "ORD-002", customer: "James Wilson", date: "2024-01-15", status: "shipped", total: 189.5 },
  { id: "ORD-003", customer: "Emily Brown", date: "2024-01-15", status: "delivered", total: 459.0 },
  { id: "ORD-004", customer: "Michael Davis", date: "2024-01-14", status: "pending", total: 89.99 },
  { id: "ORD-005", customer: "Lisa Anderson", date: "2024-01-14", status: "processing", total: 324.5 },
  { id: "ORD-006", customer: "Robert Taylor", date: "2024-01-14", status: "delivered", total: 156.0 },
  { id: "ORD-007", customer: "Jennifer Martinez", date: "2024-01-13", status: "shipped", total: 278.99 },
  { id: "ORD-008", customer: "David Johnson", date: "2024-01-13", status: "delivered", total: 99.5 },
  { id: "ORD-009", customer: "Amanda White", date: "2024-01-13", status: "processing", total: 445.0 },
  { id: "ORD-010", customer: "Christopher Lee", date: "2024-01-12", status: "pending", total: 189.99 },
];

const lowStockProducts = [
  { name: "Wireless Headphones Pro", stock: 3, threshold: 10 },
  { name: "Smart Watch Series 5", stock: 5, threshold: 15 },
  { name: "Portable Charger 20000mAh", stock: 8, threshold: 20 },
  { name: "Bluetooth Speaker Mini", stock: 2, threshold: 25 },
  { name: "USB-C Hub 7-in-1", stock: 12, threshold: 30 },
];

const statusColors = {
  pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  processing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  shipped: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  delivered: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
};

export const metadata: Metadata = {
  title: "Dashboard | Admin",
  description: "E-Commerce Admin Dashboard",
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">Welcome back, Admin</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium hover:opacity-90 transition-opacity"
          >
            View All Orders
            <ArrowRight size={18} />
          </Link>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 text-slate-300 font-medium border border-slate-700 hover:bg-slate-700/50 transition-colors"
          >
            Manage Products
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatsCard
          title="Revenue Today"
          value={`$${statsData.revenueToday.toLocaleString()}`}
          trend={statsData.revenueChange}
          trendDirection="up"
          icon={DollarSign}
        />
        <StatsCard
          title="Orders Today"
          value={statsData.ordersToday.toString()}
          trend={statsData.ordersChange}
          trendDirection="up"
          icon={ShoppingCart}
        />
        <StatsCard
          title="Visitors Today"
          value={statsData.visitorsToday.toLocaleString()}
          trend={statsData.visitorsChange}
          trendDirection="down"
          icon={Users}
        />
        <StatsCard
          title="Pending Orders"
          value={statsData.pendingOrders.toString()}
          trend={statsData.pendingChange}
          trendDirection="up"
          icon={Clock}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2">
          <ChartContainer
            title="Sales Overview (30 Days)"
            actions={
              <select className="text-sm bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50">
                <option>Last 30 Days</option>
                <option>Last 7 Days</option>
                <option>Last 90 Days</option>
              </select>
            }
          >
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.95)",
                      border: "1px solid rgba(148, 163, 184, 0.2)",
                      borderRadius: "12px",
                      backdropFilter: "blur(8px)",
                    }}
                    labelStyle={{ color: "#e2e8f0" }}
                    itemStyle={{ color: "#06b6d4" }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fill="url(#revenueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartContainer>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="text-amber-400" size={20} />
            <h3 className="text-lg font-semibold text-white">Low Stock Alerts</h3>
          </div>
          <div className="space-y-4">
            {lowStockProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="text-slate-200 font-medium text-sm">{product.name}</p>
                  <p className="text-slate-500 text-xs">Threshold: {product.threshold}</p>
                </div>
                <div className="text-right">
                  <span className="text-amber-400 font-semibold">{product.stock} left</span>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/admin/products?filter=low-stock"
            className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-slate-700/50 text-slate-300 text-sm font-medium hover:bg-slate-700 transition-colors"
          >
            View All Alerts
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Recent Orders</h3>
            <Link
              href="/admin/orders"
              className="text-cyan-400 text-sm font-medium hover:text-cyan-300 transition-colors"
            >
              View All
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Order #
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {recentOrders.map((order, index) => (
                <tr
                  key={order.id}
                  className={`hover:bg-slate-700/20 transition-colors cursor-pointer ${
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
                  <td className="px-6 py-4 text-slate-300">{order.customer}</td>
                  <td className="px-6 py-4 text-slate-400">{order.date}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${
                        statusColors[order.status as keyof typeof statusColors]
                      }`}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-slate-300 font-medium">
                    ${order.total.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
