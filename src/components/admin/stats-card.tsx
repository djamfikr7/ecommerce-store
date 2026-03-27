"use client";

import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  trend?: number;
  trendDirection?: "up" | "down";
  icon?: LucideIcon;
}

export function StatsCard({
  title,
  value,
  trend,
  trendDirection,
  icon: Icon,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 shadow-xl relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-full blur-3xl transform translate-x-16 -translate-y-16" />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-slate-400 text-sm font-medium">{title}</p>
            <motion.p
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="text-2xl lg:text-3xl font-bold text-white mt-2"
            >
              {value}
            </motion.p>
          </div>
          {Icon && (
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20">
              <Icon className="text-cyan-400" size={24} />
            </div>
          )}
        </div>

        {trend !== undefined && trendDirection && (
          <div className="flex items-center gap-1.5 mt-3">
            {trendDirection === "up" ? (
              <TrendingUp size={16} className="text-emerald-400" />
            ) : (
              <TrendingDown size={16} className="text-red-400" />
            )}
            <span
              className={`text-sm font-medium ${
                trendDirection === "up" ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {trend > 0 ? "+" : ""}
              {trend}%
            </span>
            <span className="text-slate-500 text-sm">vs last period</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
