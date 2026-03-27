"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Plus,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  MoreHorizontal,
  Package,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

type ProductStatus = "active" | "inactive" | "draft";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: ProductStatus;
  sku: string;
}

// Mock data
const mockProducts: Product[] = [
  { id: "1", name: "Wireless Headphones Pro", category: "Electronics", price: 199.99, stock: 45, status: "active", sku: "WHP-001" },
  { id: "2", name: "Smart Watch Series 5", category: "Electronics", price: 349.99, stock: 12, status: "active", sku: "SWS-005" },
  { id: "3", name: "Portable Charger 20000mAh", category: "Accessories", price: 49.99, stock: 8, status: "active", sku: "PC-200" },
  { id: "4", name: "Bluetooth Speaker Mini", category: "Electronics", price: 79.99, stock: 2, status: "active", sku: "BSM-001" },
  { id: "5", name: "USB-C Hub 7-in-1", category: "Accessories", price: 59.99, stock: 28, status: "active", sku: "UCH-007" },
  { id: "6", name: "Mechanical Keyboard RGB", category: "Electronics", price: 129.99, stock: 0, status: "inactive", sku: "MKR-001" },
  { id: "7", name: "Wireless Mouse Ergonomic", category: "Accessories", price: 39.99, stock: 67, status: "active", sku: "WME-001" },
  { id: "8", name: "Laptop Stand Aluminum", category: "Accessories", price: 89.99, stock: 34, status: "active", sku: "LSA-001" },
  { id: "9", name: "Webcam 4K Ultra HD", category: "Electronics", price: 159.99, stock: 15, status: "draft", sku: "WC4-001" },
  { id: "10", name: "Monitor Light Bar", category: "Electronics", price: 69.99, stock: 42, status: "active", sku: "MLB-001" },
  { id: "11", name: "Cable Management Kit", category: "Accessories", price: 24.99, stock: 89, status: "active", sku: "CMK-001" },
  { id: "12", name: "Phone Stand Adjustable", category: "Accessories", price: 19.99, stock: 120, status: "active", sku: "PSA-001" },
];

const statusColors: Record<ProductStatus, string> = {
  active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  inactive: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  draft: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

const categories = ["All Categories", "Electronics", "Accessories"];
const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "draft", label: "Draft" },
];

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState(mockProducts);

  const ITEMS_PER_PAGE = 10;

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "All Categories" || product.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || product.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const toggleProductStatus = (id: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: p.status === "active" ? "inactive" : "active" }
          : p
      )
    );
  };

  const handleStockAdjustment = (id: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Products</h1>
          <p className="text-slate-400 mt-1">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={18} />
          Add Product
        </Link>
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
              placeholder="Search products by name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <Filter
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              size={16}
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
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
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {paginatedProducts.map((product, index) => (
                <tr
                  key={product.id}
                  className={`hover:bg-slate-700/20 transition-colors ${
                    index % 2 === 0 ? "bg-slate-800/20" : ""
                  }`}
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-700/50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="text-slate-500" size={20} />
                      </div>
                      <div>
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="text-slate-200 font-medium hover:text-cyan-400 transition-colors"
                        >
                          {product.name}
                        </Link>
                        <p className="text-slate-500 text-sm">SKU: {product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-400">{product.category}</td>
                  <td className="px-4 py-4 text-slate-200 font-medium">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStockAdjustment(product.id, -1)}
                        className="w-6 h-6 rounded bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors text-sm font-bold"
                      >
                        -
                      </button>
                      <span
                        className={`w-12 text-center font-medium ${
                          product.stock === 0
                            ? "text-red-400"
                            : product.stock < 10
                            ? "text-amber-400"
                            : "text-slate-200"
                        }`}
                      >
                        {product.stock}
                      </span>
                      <button
                        onClick={() => handleStockAdjustment(product.id, 1)}
                        className="w-6 h-6 rounded bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors text-sm font-bold"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => toggleProductStatus(product.id)}
                      className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                        statusColors[product.status]
                      }`}
                    >
                      {product.status === "active" ? (
                        <ToggleRight size={14} />
                      ) : (
                        <ToggleLeft size={14} />
                      )}
                      {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                    </button>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                      >
                        <Edit size={16} />
                      </Link>
                      <button className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
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
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} of{" "}
            {filteredProducts.length} products
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
