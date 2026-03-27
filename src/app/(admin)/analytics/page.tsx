"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Eye,
  Package,
  ArrowRight,
} from "lucide-react";
import { ChartContainer } from "@/components/admin/chart-container";
import { StatsCard } from "@/components/admin/stats-card";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Mock data
const revenueData = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return {
    date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    revenue: Math.floor(Math.random() * 5000) + 3000,
    orders: Math.floor(Math.random() * 40) + 20,
  };
});

const ordersData = Array.from({ length: 7 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (6 - i));
  return {
    day: date.toLocaleDateString("en-US", { weekday: "short" }),
    orders: Math.floor(Math.random() * 100) + 50,
  };
});

const topProducts = [
  { name: "Wireless Headphones Pro", revenue: 15420, units: 77 },
  { name: "Smart Watch Series 5", revenue: 12350, units: 35 },
  { name: "USB-C Hub 7-in-1", revenue: 8940, units: 149 },
  { name: "Bluetooth Speaker Mini", revenue: 7560, units: 94 },
  { name: "Portable Charger 20000mAh", revenue: 6240, units: 124 },
];

const funnelData = [
  { name: "Views", value: 15420, fill: "#6366f1" },
  { name: "Add to Cart", value: 4280, fill: "#8b5cf6" },
  { name: "Checkout", value: 2450, fill: "#a855f7" },
  { name: "Purchase", value: 1890, fill: "#06b6d4" },
];

const conversionData = [
  { name: "Mon", value: 12.4 },
  { name: "Tue", value: 14.2 },
  { name: "Wed", value: 11.8 },
  { name: "Thu", value: 15.6 },
  { name: "Fri", value: 13.9 },
  { name: "Sat", value: 18.2 },
  { name: "Sun", value: 16.5 },
];

const statsData = {
  totalRevenue: 124580,
  revenueChange: 12.5,
  totalOrders: 1847,
  ordersChange: 8.2,
  totalVisitors: 45678,
  visitorsChange: -2.1,
  conversionRate: 14.2,
  conversionChange: 3.5,
};

const COLORS = ["#06b6d4", "#8b5cf6", "#6366f1", "#ec4899"];

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("30days");

  const handleExport = () => {
    console.log("Exporting analytics data...");
    // Implementation would go here
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Analytics</h1>
          <p className="text-slate-400 mt-1">Track your store performance</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 cursor-pointer"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="12months">Last 12 Months</option>
          </select>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/50 text-slate-300 font-medium border border-slate-700 hover:bg-slate-700/50 transition-colors"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatsCard
          title="Total Revenue"
          value={`$${statsData.totalRevenue.toLocaleString()}`}
          trend={statsData.revenueChange}
          trendDirection="up"
          icon={DollarSign}
        />
        <StatsCard
          title="Total Orders"
          value={statsData.totalOrders.toLocaleString()}
          trend={statsData.ordersChange}
          trendDirection="up"
          icon={ShoppingCart}
        />
        <StatsCard
          title="Total Visitors"
          value={statsData.totalVisitors.toLocaleString()}
          trend={statsData.visitorsChange}
          trendDirection="down"
          icon={Eye}
        />
        <StatsCard
          title="Conversion Rate"
          value={`${statsData.conversionRate}%`}
          trend={statsData.conversionChange}
          trendDirection="up"
          icon={TrendingUp}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2">
          <ChartContainer
            title="Revenue Overview"
            actions={
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-cyan-500" />
                  <span className="text-slate-400">Revenue</span>
                </div>
              </div>
            }
          >
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
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

        {/* Orders Chart */}
        <ChartContainer title="Orders This Week">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ordersData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    border: "1px solid rgba(148, 163, 184, 0.2)",
                    borderRadius: "12px",
                  }}
                  labelStyle={{ color: "#e2e8f0" }}
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                />
                <Bar dataKey="orders" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>

        {/* Conversion Funnel */}
        <ChartContainer title="Conversion Funnel">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={funnelData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    border: "1px solid rgba(148, 163, 184, 0.2)",
                    borderRadius: "12px",
                  }}
                  formatter={(value: number) => [value.toLocaleString(), ""]}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => <span className="text-slate-300 text-sm">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>

        {/* Top Products by Revenue */}
        <ChartContainer title="Top Products by Revenue">
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={product.name} className="flex items-center gap-4">
                <span className="w-6 text-slate-500 text-sm font-medium">{index + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-200 text-sm">{product.name}</span>
                    <span className="text-cyan-400 font-medium">${product.revenue.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(product.revenue / topProducts[0].revenue) * 100}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ChartContainer>

        {/* Top Products by Units */}
        <ChartContainer title="Top Products by Units Sold">
          <div className="space-y-4">
            {[...topProducts]
              .sort((a, b) => b.units - a.units)
              .slice(0, 5)
              .map((product, index) => (
                <div key={product.name} className="flex items-center gap-4">
                  <span className="w-6 text-slate-500 text-sm font-medium">{index + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-200 text-sm">{product.name}</span>
                      <span className="text-emerald-400 font-medium">{product.units} units</span>
                    </div>
                    <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(product.units / [...topProducts].sort((a, b) => b.units - a.units)[0].units) * 100}%`,
                        }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </ChartContainer>

        {/* Daily Conversion Rate */}
        <div className="lg:col-span-2">
          <ChartContainer
            title="Daily Conversion Rate (%)"
            actions={
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <TrendingUp size={16} className="text-emerald-400" />
                <span>+{statsData.conversionChange}% vs last period</span>
              </div>
            }
          >
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={conversionData}>
                  <defs>
                    <linearGradient id="conversionGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.95)",
                      border: "1px solid rgba(148, 163, 184, 0.2)",
                      borderRadius: "12px",
                    }}
                    formatter={(value: number) => [`${value}%`, "Conversion"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#conversionGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
}
