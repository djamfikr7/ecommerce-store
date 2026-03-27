"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Upload,
  X,
  Plus,
  Package,
  DollarSign,
  Image,
  Layers,
  Search,
} from "lucide-react";

type TabType = "basic" | "pricing" | "images" | "variants" | "seo";

interface ProductVariant {
  id: string;
  name: string;
  options: string[];
  priceModifier: number;
  stock: number;
}

interface ProductFormData {
  name: string;
  description: string;
  category: string;
  sku: string;
  price: number;
  compareAtPrice: number;
  costPrice: number;
  stock: number;
  lowStockThreshold: number;
  status: "active" | "inactive" | "draft";
  images: string[];
  variants: ProductVariant[];
  metaTitle: string;
  metaDescription: string;
  tags: string[];
}

// Mock existing product data
const existingProduct: ProductFormData = {
  name: "Wireless Headphones Pro",
  description: "Premium wireless headphones with active noise cancellation, 40-hour battery life, and superior sound quality.",
  category: "Electronics",
  sku: "WHP-001",
  price: 199.99,
  compareAtPrice: 249.99,
  costPrice: 89.99,
  stock: 45,
  lowStockThreshold: 10,
  status: "active",
  images: [],
  variants: [
    { id: "1", name: "Color", options: ["Black", "White", "Silver"], priceModifier: 0, stock: 20 },
    { id: "2", name: "Storage", options: ["64GB", "128GB", "256GB"], priceModifier: 20, stock: 15 },
  ],
  metaTitle: "Wireless Headphones Pro - Premium ANC Headphones",
  metaDescription: "Experience premium sound with our Wireless Headphones Pro featuring active noise cancellation and 40-hour battery.",
  tags: ["wireless", "headphones", "premium", "noise-cancelling"],
};

const categories = ["Electronics", "Accessories", "Audio", "Wearables", "Storage"];
const tabs: { id: TabType; label: string; icon: typeof Package }[] = [
  { id: "basic", label: "Basic Info", icon: Package },
  { id: "pricing", label: "Pricing", icon: DollarSign },
  { id: "images", label: "Images", icon: Image },
  { id: "variants", label: "Variants", icon: Layers },
  { id: "seo", label: "SEO", icon: Search },
];

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("basic");
  const [formData, setFormData] = useState<ProductFormData>(existingProduct);
  const [isSaving, setIsSaving] = useState(false);
  const [newVariantName, setNewVariantName] = useState("");
  const [newVariantOptions, setNewVariantOptions] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSaving(false);
    router.push("/admin/products");
  };

  const addVariant = () => {
    if (!newVariantName.trim() || !newVariantOptions.trim()) return;
    const newVariant: ProductVariant = {
      id: Date.now().toString(),
      name: newVariantName.trim(),
      options: newVariantOptions.split(",").map((o) => o.trim()),
      priceModifier: 0,
      stock: 0,
    };
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, newVariant],
    }));
    setNewVariantName("");
    setNewVariantOptions("");
  };

  const removeVariant = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((v) => v.id !== id),
    }));
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/products"
            className="p-2 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">Edit Product</h1>
            <p className="text-slate-400 mt-1">SKU: {formData.sku}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/products"
            className="px-4 py-2 rounded-xl bg-slate-800/50 text-slate-300 font-medium border border-slate-700 hover:bg-slate-700/50 transition-colors"
          >
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-2">
        <div className="flex overflow-x-auto gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                    : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
        {/* Basic Info Tab */}
        {activeTab === "basic" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  SKU
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                  placeholder="SKU-001"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 resize-none"
                placeholder="Enter product description"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 cursor-pointer"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags.join(", ")}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    tags: e.target.value.split(",").map((t) => t.trim()),
                  }))
                }
                className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                placeholder="wireless, headphones, premium"
              />
            </div>
          </div>
        )}

        {/* Pricing Tab */}
        {activeTab === "pricing" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Price
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    $
                  </span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Compare at Price
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    $
                  </span>
                  <input
                    type="number"
                    name="compareAtPrice"
                    value={formData.compareAtPrice}
                    onChange={handleInputChange}
                    step="0.01"
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Shows original price with strikethrough
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Cost Price
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    $
                  </span>
                  <input
                    type="number"
                    name="costPrice"
                    value={formData.costPrice}
                    onChange={handleInputChange}
                    step="0.01"
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Internal use only, not shown to customers
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Low Stock Threshold
                </label>
                <input
                  type="number"
                  name="lowStockThreshold"
                  value={formData.lowStockThreshold}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                  placeholder="10"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Alert when stock falls below this level
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Images Tab */}
        {activeTab === "images" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Product Images</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {formData.images.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-700 rounded-xl">
                    <Image className="text-slate-500 mb-4" size={48} />
                    <p className="text-slate-400 text-center mb-4">
                      No images uploaded yet
                    </p>
                    <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-400 font-medium border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors">
                      <Upload size={18} />
                      Upload Images
                    </button>
                  </div>
                ) : (
                  formData.images.map((img, index) => (
                    <div
                      key={index}
                      className="relative aspect-square bg-slate-900/50 rounded-xl overflow-hidden group"
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Package className="text-slate-600" size={32} />
                      </div>
                      <button className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/20 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <X size={16} />
                      </button>
                    </div>
                  ))
                )}
                {formData.images.length > 0 && (
                  <button className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-xl text-slate-500 hover:border-cyan-500/50 hover:text-cyan-400 transition-colors">
                    <Plus size={24} />
                    <span className="text-sm mt-2">Add Image</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Variants Tab */}
        {activeTab === "variants" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Product Variants</h3>
              <div className="space-y-4">
                {formData.variants.map((variant) => (
                  <div
                    key={variant.id}
                    className="p-4 bg-slate-900/50 rounded-xl border border-slate-700"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-slate-200 font-medium">{variant.name}</h4>
                        <p className="text-slate-500 text-sm">
                          Options: {variant.options.join(", ")}
                        </p>
                      </div>
                      <button
                        onClick={() => removeVariant(variant.id)}
                        className="p-2 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {variant.options.map((option) => (
                        <span
                          key={option}
                          className="px-3 py-1 bg-slate-800 rounded-full text-slate-300 text-sm"
                        >
                          {option}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
              <h4 className="text-slate-200 font-medium mb-4">Add New Variant</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Variant Name
                  </label>
                  <input
                    type="text"
                    value={newVariantName}
                    onChange={(e) => setNewVariantName(e.target.value)}
                    placeholder="e.g., Color, Size"
                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-600 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Options (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newVariantOptions}
                    onChange={(e) => setNewVariantOptions(e.target.value)}
                    placeholder="e.g., Red, Blue, Green"
                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-600 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                  />
                </div>
              </div>
              <button
                onClick={addVariant}
                disabled={!newVariantName.trim() || !newVariantOptions.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-400 font-medium border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={18} />
                Add Variant
              </button>
            </div>
          </div>
        )}

        {/* SEO Tab */}
        {activeTab === "seo" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">SEO Settings</h3>
              <p className="text-slate-400 text-sm mb-6">
                Optimize your product listing for search engines
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Meta Title
              </label>
              <input
                type="text"
                name="metaTitle"
                value={formData.metaTitle}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                placeholder="Enter meta title"
              />
              <p className="text-xs text-slate-500 mt-1">
                {formData.metaTitle.length}/60 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Meta Description
              </label>
              <textarea
                name="metaDescription"
                value={formData.metaDescription}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 resize-none"
                placeholder="Enter meta description"
              />
              <p className="text-xs text-slate-500 mt-1">
                {formData.metaDescription.length}/160 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                URL Slug
              </label>
              <input
                type="text"
                value={generateSlug(formData.name)}
                readOnly
                className="w-full px-4 py-2.5 bg-slate-900/30 border border-slate-700 rounded-xl text-slate-400"
              />
              <p className="text-xs text-slate-500 mt-1">
                URL: /products/{generateSlug(formData.name)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
