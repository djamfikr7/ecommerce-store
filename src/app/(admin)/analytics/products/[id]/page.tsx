import { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Package,
  Calendar,
} from "lucide-react";
import { ChartContainer } from "@/components/admin/chart-container";
import { StatsCard } from "@/components/admin/stats-card";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Mock data
const product = {
  id: "1",
  name: "Wireless Headphones Pro",
  sku: "WHP-001",
};

const viewsData = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return {
    date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    views: Math.floor(Math.random() * 200) + 100,
  };
});

const conversionData = Array.from({ length: 7 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (6 - i));
  return {
    day: date.toLocaleDateString("en-US", { weekday: "short" }),
    addToCart: Math.floor(Math.random() * 30) + 10,
    purchases: Math.floor(Math.random() * 15) + 5,
  };
});

const revenueData = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return {
    date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    revenue: Math.floor(Math.random() * 1000) + 500,
  };
});

const statsData = {
  totalViews: 4520,
  viewsChange: 12.5,
  addToCartRate: 28.4,
  cartChange: 5.2,
  purchaseRate: 12.3,
  purchaseChange: 3.1,
  totalRevenue: 15420,
  revenueChange: 15.8,
};

const trafficSources = [
  { source: "Organic Search", value: 1850, percentage: 41 },
  { source: "Direct", value: 1120, percentage: 25 },
  { source: "Social Media", value: 890, percentage: 20 },
  { source: "Referral", value: 450, percentage: 10 },
  { source: "Email", value: 210, percentage: 4 },
];

export const metadata: Metadata = {
  title: `Product Analytics - ${product.name} | Admin`,
  description: "Product Performance Analytics",
};

export default function ProductAnalyticsPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/analytics"
            className="p-2 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl lg:text-3xl font-bold text-white">{product.name}</h1>
            </div>
            <p className="text-slate-400 mt-1">SKU: {product.sku}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/products/${product.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 text-slate-300 font-medium border border-slate-700 hover:bg-slate-700/50 transition-colors"
          >
            <Package size={18} />
            Edit Product
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatsCard
          title="Total Views"
          value={statsData.totalViews.toLocaleString()}
          trend={statsData.viewsChange}
          trendDirection="up"
          icon={Eye}
        />
        <StatsCard
          title="Add to Cart Rate"
          value={`${statsData.addToCartRate}%`}
          trend={statsData.cartChange}
          trendDirection="up"
          icon={ShoppingCart}
        />
        <StatsCard
          title="Purchase Rate"
          value={`${statsData.purchaseRate}%`}
          trend={statsData.purchaseChange}
          trendDirection="up"
          icon={TrendingUp}
        />
        <StatsCard
          title="Total Revenue"
          value={`$${statsData.totalRevenue.toLocaleString()}`}
          trend={statsData.revenueChange}
          trendDirection="up"
          icon={DollarSign}
        />
      </div>

      {/* Views Chart */}
      <ChartContainer title="Product Views (30 Days)">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={viewsData}>
              <defs>
                <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
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
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                  borderRadius: "12px",
                }}
                labelStyle={{ color: "#e2e8f0" }}
                itemStyle={{ color: "#6366f1" }}
              />
              <Area
                type="monotone"
                dataKey="views"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#viewsGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartContainer>

      {/* Conversion Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer
          title="Add to Cart vs Purchases"
          actions={
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-500" />
                <span className="text-slate-400">Add to Cart</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-slate-400">Purchases</span>
              </div>
            </div>
          }
        >
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conversionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    border: "1px solid rgba(148, 163, 184, 0.2)",
                    borderRadius: "12px",
                  }}
                />
                <Bar dataKey="addToCart" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                <Bar dataKey="purchases" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>

        {/* Traffic Sources */}
        <ChartContainer title="Traffic Sources">
          <div className="space-y-4">
            {trafficSources.map((source, index) => (
              <div key={source.source} className="flex items-center gap-4">
                <span className="w-6 text-slate-500 text-sm font-medium">{index + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-200 text-sm">{source.source}</span>
                    <span className="text-slate-400 text-sm">{source.value.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${source.percentage}%` }}
                    />
                  </div>
                </div>
                <span className="text-cyan-400 text-sm font-medium w-12 text-right">
                  {source.percentage}%
                </span>
              </div>
            ))}
          </div>
        </ChartContainer>
      </div>

      {/* Revenue Chart */}
      <ChartContainer title="Revenue Over Time">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
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
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                  borderRadius: "12px",
                }}
                labelStyle={{ color: "#e2e8f0" }}
                itemStyle={{ color: "#10b981" }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartContainer>
    </div>
  );
}
