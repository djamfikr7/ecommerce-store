"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  MoreHorizontal,
} from "lucide-react";

type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

interface Order {
  id: string;
  customer: string;
  email: string;
  date: string;
  status: OrderStatus;
  items: number;
  total: number;
}

// Mock data
const mockOrders: Order[] = [
  { id: "ORD-001", customer: "Sarah Mitchell", email: "sarah.m@email.com", date: "2024-01-15", status: "processing", items: 3, total: 249.99 },
  { id: "ORD-002", customer: "James Wilson", email: "james.w@email.com", date: "2024-01-15", status: "shipped", items: 1, total: 189.5 },
  { id: "ORD-003", customer: "Emily Brown", email: "emily.b@email.com", date: "2024-01-15", status: "delivered", items: 5, total: 459.0 },
  { id: "ORD-004", customer: "Michael Davis", email: "michael.d@email.com", date: "2024-01-14", status: "pending", items: 2, total: 89.99 },
  { id: "ORD-005", customer: "Lisa Anderson", email: "lisa.a@email.com", date: "2024-01-14", status: "processing", items: 4, total: 324.5 },
  { id: "ORD-006", customer: "Robert Taylor", email: "robert.t@email.com", date: "2024-01-14", status: "delivered", items: 1, total: 156.0 },
  { id: "ORD-007", customer: "Jennifer Martinez", email: "jennifer.m@email.com", date: "2024-01-13", status: "shipped", items: 2, total: 278.99 },
  { id: "ORD-008", customer: "David Johnson", email: "david.j@email.com", date: "2024-01-13", status: "delivered", items: 3, total: 99.5 },
  { id: "ORD-009", customer: "Amanda White", email: "amanda.w@email.com", date: "2024-01-13", status: "processing", items: 6, total: 445.0 },
  { id: "ORD-010", customer: "Christopher Lee", email: "chris.l@email.com", date: "2024-01-12", status: "pending", items: 2, total: 189.99 },
  { id: "ORD-011", customer: "Jessica Garcia", email: "jessica.g@email.com", date: "2024-01-12", status: "cancelled", items: 1, total: 79.99 },
  { id: "ORD-012", customer: "Daniel Rodriguez", email: "daniel.r@email.com", date: "2024-01-12", status: "shipped", items: 4, total: 312.5 },
];

const statusColors: Record<OrderStatus, string> = {
  pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  processing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  shipped: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  delivered: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
};

const statusOptions: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [dateRange, setDateRange] = useState("all");
  const [sortField, setSortField] = useState<keyof Order>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  const ITEMS_PER_PAGE = 10;

  // Filter and sort orders
  const filteredOrders = mockOrders
    .filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const direction = sortDirection === "asc" ? 1 : -1;
      if (typeof aValue === "string" && typeof bValue === "string") {
        return aValue.localeCompare(bValue) * direction;
      }
      return ((aValue as number) - (bValue as number)) * direction;
    });

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSort = (field: keyof Order) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const toggleSelectAll = () => {
    if (selectedOrders.length === paginatedOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(paginatedOrders.map((o) => o.id));
    }
  };

  const toggleSelectOrder = (id: string) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleExportCSV = () => {
    console.log("Exporting CSV with orders:", selectedOrders);
    // Implementation would go here
  };

  const handlePrintLabels = () => {
    console.log("Printing labels for:", selectedOrders);
    // Implementation would go here
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Orders</h1>
        <p className="text-slate-400 mt-1">Manage and track all customer orders</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search orders, customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "all")}
              className="appearance-none pl-4 pr-10 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 cursor-pointer"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Filter
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              size={16}
            />
          </div>

          {/* Date Range */}
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 cursor-pointer"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>
            <Filter
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              size={16}
            />
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedOrders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center gap-4 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl"
          >
            <span className="text-slate-300 text-sm">
              {selectedOrders.length} order{selectedOrders.length > 1 ? "s" : ""} selected
            </span>
            <div className="flex-1" />
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-300 hover:text-white transition-colors"
            >
              <Download size={16} />
              Export CSV
            </button>
            <button
              onClick={handlePrintLabels}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-300 hover:text-white transition-colors"
            >
              <Printer size={16} />
              Print Labels
            </button>
            <button
              onClick={() => setSelectedOrders([])}
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              Clear
            </button>
          </motion.div>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-4 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedOrders.length === paginatedOrders.length && paginatedOrders.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500/50"
                  />
                </th>
                <th className="px-4 py-4 text-left">
                  <button
                    onClick={() => handleSort("id")}
                    className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-white transition-colors"
                  >
                    Order #
                    <ArrowUpDown size={14} />
                  </button>
                </th>
                <th className="px-4 py-4 text-left">
                  <button
                    onClick={() => handleSort("customer")}
                    className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-white transition-colors"
                  >
                    Customer
                    <ArrowUpDown size={14} />
                  </button>
                </th>
                <th className="px-4 py-4 text-left">
                  <button
                    onClick={() => handleSort("date")}
                    className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-white transition-colors"
                  >
                    Date
                    <ArrowUpDown size={14} />
                  </button>
                </th>
                <th className="px-4 py-4 text-left">
                  <button
                    onClick={() => handleSort("status")}
                    className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-white transition-colors"
                  >
                    Status
                    <ArrowUpDown size={14} />
                  </button>
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-4 py-4 text-right">
                  <button
                    onClick={() => handleSort("total")}
                    className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-white transition-colors ml-auto"
                  >
                    Total
                    <ArrowUpDown size={14} />
                  </button>
                </th>
                <th className="px-4 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {paginatedOrders.map((order, index) => (
                <tr
                  key={order.id}
                  className={`hover:bg-slate-700/20 transition-colors ${
                    index % 2 === 0 ? "bg-slate-800/20" : ""
                  } ${selectedOrders.includes(order.id) ? "bg-cyan-500/5" : ""}`}
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => toggleSelectOrder(order.id)}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500/50"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-cyan-400 font-medium hover:text-cyan-300 transition-colors"
                    >
                      {order.id}
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <p className="text-slate-200 font-medium">{order.customer}</p>
                      <p className="text-slate-500 text-sm">{order.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-400">{order.date}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${
                        statusColors[order.status]
                      }`}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-400">{order.items}</td>
                  <td className="px-4 py-4 text-right text-slate-200 font-medium">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                    >
                      <MoreHorizontal size={18} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-700/50">
          <p className="text-slate-400 text-sm">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)} of{" "}
            {filteredOrders.length} orders
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                  page === currentPage
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                    : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
