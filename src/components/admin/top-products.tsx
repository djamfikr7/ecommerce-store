'use client'

import { TopProduct, formatCurrency } from '@/lib/analytics/calculations'

interface TopProductsProps {
  products: TopProduct[]
  currency?: string
}

export function TopProducts({ products, currency = 'USD' }: TopProductsProps) {
  const maxRevenue = Math.max(...products.map((p) => p.revenue))

  return (
    <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-6 shadow-[inset_0_2px_8px_rgba(0,0,0,0.3),0_8px_24px_rgba(0,0,0,0.4)]">
      <h3 className="mb-6 text-xl font-bold text-white">Top Products</h3>

      <div className="space-y-4">
        {products.map((product, index) => {
          const revenuePercentage = (product.revenue / maxRevenue) * 100

          return (
            <div
              key={product.id}
              className="rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 p-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold text-white">
                      {index + 1}
                    </span>
                    <h4 className="font-semibold text-white">{product.name}</h4>
                  </div>
                  <div className="ml-11 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Revenue</p>
                      <p className="font-semibold text-white">
                        {formatCurrency(product.revenue, currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Quantity Sold</p>
                      <p className="font-semibold text-white">
                        {product.quantity.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Orders</p>
                      <p className="font-semibold text-white">{product.orders.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="ml-11">
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
                    style={{ width: `${revenuePercentage}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {products.length === 0 && (
        <div className="py-8 text-center text-gray-400">No product data available</div>
      )}
    </div>
  )
}
