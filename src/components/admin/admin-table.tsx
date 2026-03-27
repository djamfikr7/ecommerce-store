"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { ChevronUp, ChevronDown, Package } from "lucide-react";

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => ReactNode;
  className?: string;
}

interface AdminTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  sortField?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (field: string) => void;
}

export function AdminTable<T extends { id: string | number }>({
  columns,
  data,
  onRowClick,
  isLoading,
  emptyMessage = "No data found",
  sortField,
  sortDirection,
  onSort,
}: AdminTableProps<T>) {
  if (isLoading) {
    return (
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
        <div className="p-8">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4">
                {columns.map((col) => (
                  <div
                    key={col.key}
                    className="h-4 bg-slate-700/50 rounded animate-pulse"
                    style={{ width: "100px" }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-12 text-center">
        <Package className="mx-auto text-slate-500 mb-4" size={48} />
        <p className="text-slate-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-900/50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider ${
                    column.className || ""
                  }`}
                >
                  {column.sortable && onSort ? (
                    <button
                      onClick={() => onSort(column.key)}
                      className="flex items-center gap-2 hover:text-white transition-colors"
                    >
                      {column.header}
                      <span className="flex flex-col">
                        <ChevronUp
                          size={12}
                          className={`-mb-1 ${
                            sortField === column.key && sortDirection === "asc"
                              ? "text-cyan-400"
                              : "text-slate-600"
                          }`}
                        />
                        <ChevronDown
                          size={12}
                          className={`${
                            sortField === column.key && sortDirection === "desc"
                              ? "text-cyan-400"
                              : "text-slate-600"
                          }`}
                        />
                      </span>
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {data.map((item, index) => (
              <motion.tr
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`hover:bg-slate-700/20 transition-colors ${
                  onRowClick ? "cursor-pointer" : ""
                } ${index % 2 === 0 ? "bg-slate-800/20" : ""}`}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-4 py-4 text-slate-300 ${
                      column.className || ""
                    }`}
                  >
                    {column.render
                      ? column.render(item)
                      : (item as Record<string, unknown>)[column.key]?.toString()}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
