/**
 * Social Sharing Components - Usage Examples
 *
 * This file demonstrates how to use the social sharing components
 */

import { ShareButton, ShareModal } from '@/components/social'
import { useState } from 'react'

// Example 1: Basic Share Button with Dropdown
export function ProductShareExample() {
  const product = {
    name: 'Premium Wireless Headphones',
    slug: 'premium-wireless-headphones',
    image: '/images/products/headphones.jpg',
    price: '$299.99',
    rating: 4.5,
    description: 'High-quality wireless headphones with noise cancellation',
  }

  return (
    <div className="flex gap-4">
      {/* Default button with dropdown */}
      <ShareButton product={product} />

      {/* Icon only variant */}
      <ShareButton product={product} variant="icon" />

      {/* Small size */}
      <ShareButton product={product} size="sm" />

      {/* Without label */}
      <ShareButton product={product} showLabel={false} />
    </div>
  )
}

// Example 2: Share Modal
export function ProductShareModalExample() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const product = {
    name: 'Premium Wireless Headphones',
    slug: 'premium-wireless-headphones',
    image: '/images/products/headphones.jpg',
    price: '$299.99',
    rating: 4.5,
    description: 'High-quality wireless headphones with noise cancellation',
  }

  return (
    <>
      <button onClick={() => setIsModalOpen(true)}>Open Share Modal</button>

      <ShareModal product={product} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}

// Example 3: Integration in Product Card
export function ProductCardWithShare() {
  const product = {
    name: 'Premium Wireless Headphones',
    slug: 'premium-wireless-headphones',
    image: '/images/products/headphones.jpg',
    price: '$299.99',
    rating: 4.5,
  }

  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p>{product.price}</p>

      <div className="flex gap-2">
        <button>Add to Cart</button>
        <ShareButton product={product} variant="icon" />
      </div>
    </div>
  )
}

// Example 4: Integration in Product Detail Page
export function ProductDetailWithShare() {
  const [showShareModal, setShowShareModal] = useState(false)

  const product = {
    name: 'Premium Wireless Headphones',
    slug: 'premium-wireless-headphones',
    image: '/images/products/headphones.jpg',
    price: '$299.99',
    rating: 4.5,
    description:
      'High-quality wireless headphones with active noise cancellation, 30-hour battery life, and premium sound quality.',
  }

  return (
    <div className="product-detail">
      <div className="product-actions">
        <button>Add to Cart</button>
        <button>Add to Wishlist</button>

        {/* Share button that opens modal */}
        <button onClick={() => setShowShareModal(true)}>Share Product</button>
      </div>

      <ShareModal
        product={product}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
    </div>
  )
}
