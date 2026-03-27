"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface ChartContainerProps {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}

export function ChartContainer({ title, children, actions }: ChartContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 shadow-xl"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {actions}
      </div>
      {children}
    </motion.div>
  );
}
