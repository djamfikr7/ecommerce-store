# API Documentation

Complete API reference for the E-Commerce Web Store.

## Base URL

```
Development: http://localhost:3000/api
Production: https://yourdomain.com/api
```

## Authentication

Most endpoints require authentication via NextAuth session cookies. Include credentials in requests:

```typescript
fetch('/api/endpoint', {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
})
```

### Admin Endpoints

Admin endpoints require `ADMIN` or `SUPERADMIN` role.

## Response Format

### Success Response

```json
{
  "data": { ... },
  "message": "Success message"
}
```

### Error Response

```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## Authentication Endpoints

### POST /api/auth/register

Register a new user account.

**Request:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

**Response:**

```json
{
  "message": "Registration successful. Please check your email to verify your account.",
  "userId": "clx123..."
}
```

**Errors:**

- `400`: Invalid input
- `409`: Email already exists

### POST /api/auth/verify-email

Verify email address with token.

**Request:**

```json
{
  "token": "verification-token-here"
}
```

**Response:**

```json
{
  "message": "Email verified successfully"
}
```

### POST /api/auth/resend-verification

Resend verification email.

**Request:**

```json
{
  "email": "user@example.com"
}
```

**Response:**

```json
{
  "message": "Verification email sent"
}
```

## Product Endpoints

### GET /api/products

Get paginated product list with filters.

**Query Parameters:**

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `category` (string): Filter by category slug
- `minPrice` (number): Minimum price in cents
- `maxPrice` (number): Maximum price in cents
- `search` (string): Search query
- `sort` (string): Sort order (`newest`, `price-asc`, `price-desc`, `rating`)
- `featured` (boolean): Filter featured products

**Example:**

```
GET /api/products?page=1&limit=20&category=electronics&sort=price-asc
```

**Response:**

```json
{
  "products": [
    {
      "id": "clx123...",
      "name": "Product Name",
      "slug": "product-name",
      "description": "Product description",
      "price": 9999,
      "compareAtPrice": 12999,
      "sku": "PROD-001",
      "stockQuantity": 50,
      "isFeatured": true,
      "isActive": true,
      "images": [
        {
          "url": "https://...",
          "alt": "Product image"
        }
      ],
      "category": {
        "name": "Electronics",
        "slug": "electronics"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### GET /api/products/[slug]

Get single product by slug.

**Response:**

```json
{
  "id": "clx123...",
  "name": "Product Name",
  "slug": "product-name",
  "description": "Detailed product description",
  "price": 9999,
  "compareAtPrice": 12999,
  "sku": "PROD-001",
  "stockQuantity": 50,
  "images": [...],
  "variants": [
    {
      "id": "clx456...",
      "name": "Size: Large",
      "sku": "PROD-001-L",
      "price": 10999,
      "stockQuantity": 20,
      "attributes": {
        "size": "L",
        "color": "Blue"
      }
    }
  ],
  "category": {...},
  "reviews": [...],
  "averageRating": 4.5,
  "reviewCount": 42
}
```

### GET /api/products/[slug]/related

Get related products.

**Query Parameters:**

- `limit` (number): Number of products (default: 4)

**Response:**

```json
{
  "products": [...]
}
```

### GET /api/products/featured

Get featured products.

**Query Parameters:**

- `limit` (number): Number of products (default: 8)

**Response:**

```json
{
  "products": [...]
}
```

## Cart Endpoints

### GET /api/cart

Get current user's cart.

**Response:**

```json
{
  "cart": {
    "id": "clx123...",
    "items": [
      {
        "id": "clx456...",
        "product": {...},
        "variant": {...},
        "quantity": 2,
        "priceAtAdd": 9999
      }
    ],
    "currency": "USD",
    "estimatedShipping": 500,
    "estimatedTax": 800
  }
}
```

### POST /api/cart/items

Add item to cart.

**Request:**

```json
{
  "productId": "clx123...",
  "variantId": "clx456...",
  "quantity": 1
}
```

**Response:**

```json
{
  "message": "Item added to cart",
  "cart": {...}
}
```

**Errors:**

- `400`: Invalid input
- `404`: Product not found
- `409`: Insufficient stock

### PATCH /api/cart/items/[itemId]

Update cart item quantity.

**Request:**

```json
{
  "quantity": 3
}
```

**Response:**

```json
{
  "message": "Cart updated",
  "cart": {...}
}
```

### DELETE /api/cart/items/[itemId]

Remove item from cart.

**Response:**

```json
{
  "message": "Item removed from cart",
  "cart": {...}
}
```

### GET /api/cart/totals

Calculate cart totals with shipping and tax.

**Query Parameters:**

- `shippingCountry` (string): Country code for tax calculation
- `shippingState` (string): State/province for tax calculation

**Response:**

```json
{
  "subtotal": 19998,
  "shipping": 500,
  "tax": 1640,
  "total": 22138,
  "currency": "USD"
}
```

## Checkout Endpoints

### POST /api/checkout

Create checkout session.

**Request:**

```json
{
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "addressLine1": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "US",
    "phone": "+1234567890"
  },
  "billingAddress": {...},
  "paymentMethod": "CREDIT_CARD"
}
```

**Response:**

```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "orderId": "clx123...",
  "orderNumber": "ORD-20260330-001"
}
```

### POST /api/checkout/verify

Verify payment and complete order.

**Request:**

```json
{
  "paymentIntentId": "pi_xxx"
}
```

**Response:**

```json
{
  "message": "Order completed successfully",
  "order": {...}
}
```

### POST /api/checkout/webhook

Stripe webhook endpoint (internal use).

## Order Endpoints

### GET /api/orders

Get user's order history.

**Query Parameters:**

- `page` (number): Page number
- `limit` (number): Items per page
- `status` (string): Filter by status

**Response:**

```json
{
  "orders": [
    {
      "id": "clx123...",
      "orderNumber": "ORD-20260330-001",
      "status": "DELIVERED",
      "paymentStatus": "SUCCEEDED",
      "total": 22138,
      "currency": "USD",
      "items": [...],
      "createdAt": "2026-03-30T10:00:00Z"
    }
  ],
  "pagination": {...}
}
```

### GET /api/orders/[id]

Get order details.

**Response:**

```json
{
  "order": {
    "id": "clx123...",
    "orderNumber": "ORD-20260330-001",
    "status": "DELIVERED",
    "paymentStatus": "SUCCEEDED",
    "items": [...],
    "subtotal": 19998,
    "shippingCost": 500,
    "tax": 1640,
    "total": 22138,
    "currency": "USD",
    "shippingAddress": {...},
    "billingAddress": {...},
    "createdAt": "2026-03-30T10:00:00Z",
    "updatedAt": "2026-03-31T15:30:00Z"
  }
}
```

### GET /api/orders/[id]/tracking

Get order tracking information.

**Response:**

```json
{
  "tracking": {
    "carrier": "UPS",
    "trackingNumber": "1Z999AA10123456784",
    "status": "IN_TRANSIT",
    "estimatedDelivery": "2026-04-05T00:00:00Z",
    "events": [
      {
        "status": "SHIPPED",
        "location": "New York, NY",
        "timestamp": "2026-03-31T10:00:00Z"
      }
    ]
  }
}
```

### POST /api/orders/[id]/cancel

Cancel an order.

**Response:**

```json
{
  "message": "Order cancelled successfully",
  "order": {...}
}
```

**Errors:**

- `400`: Order cannot be cancelled (already shipped)

### GET /api/orders/[id]/invoice

Download order invoice (PDF).

## Review Endpoints

### POST /api/reviews

Create product review.

**Request:**

```json
{
  "productId": "clx123...",
  "orderItemId": "clx456...",
  "rating": 5,
  "title": "Great product!",
  "content": "This product exceeded my expectations...",
  "images": ["https://..."]
}
```

**Response:**

```json
{
  "message": "Review submitted successfully",
  "review": {...}
}
```

**Errors:**

- `400`: Invalid input
- `401`: Must be logged in
- `403`: Must purchase product to review

### PATCH /api/reviews/[id]

Update review.

**Request:**

```json
{
  "rating": 4,
  "title": "Updated title",
  "content": "Updated content"
}
```

### DELETE /api/reviews/[id]

Delete review.

### POST /api/reviews/[id]/helpful

Mark review as helpful.

**Response:**

```json
{
  "message": "Review marked as helpful",
  "helpfulCount": 15
}
```

## Wishlist Endpoints

### GET /api/wishlist

Get user's wishlist.

**Response:**

```json
{
  "wishlist": {
    "id": "clx123...",
    "items": [
      {
        "id": "clx456...",
        "product": {...},
        "variant": {...},
        "addedAt": "2026-03-30T10:00:00Z"
      }
    ]
  }
}
```

### POST /api/wishlist/items

Add item to wishlist.

**Request:**

```json
{
  "productId": "clx123...",
  "variantId": "clx456..."
}
```

### DELETE /api/wishlist/items/[itemId]

Remove item from wishlist.

## Search Endpoints

### GET /api/search

Search products.

**Query Parameters:**

- `q` (string): Search query
- `limit` (number): Results limit

**Response:**

```json
{
  "results": [
    {
      "id": "clx123...",
      "name": "Product Name",
      "slug": "product-name",
      "price": 9999,
      "image": "https://...",
      "category": "Electronics"
    }
  ]
}
```

## Category Endpoints

### GET /api/categories

Get all categories.

**Response:**

```json
{
  "categories": [
    {
      "id": "clx123...",
      "name": "Electronics",
      "slug": "electronics",
      "image": "https://...",
      "children": [
        {
          "id": "clx456...",
          "name": "Smartphones",
          "slug": "smartphones"
        }
      ]
    }
  ]
}
```

## Recommendations Endpoints

### GET /api/recommendations

Get personalized product recommendations.

**Query Parameters:**

- `limit` (number): Number of recommendations

**Response:**

```json
{
  "recommendations": [...]
}
```

## Currency Endpoints

### GET /api/currency/rates

Get current exchange rates.

**Response:**

```json
{
  "rates": {
    "USD": 1.0,
    "EUR": 0.92,
    "GBP": 0.79,
    "JPY": 149.5
  },
  "base": "USD",
  "updatedAt": "2026-03-30T00:00:00Z"
}
```

### POST /api/currency/convert

Convert amount between currencies.

**Request:**

```json
{
  "amount": 9999,
  "from": "USD",
  "to": "EUR"
}
```

**Response:**

```json
{
  "amount": 9199,
  "from": "USD",
  "to": "EUR",
  "rate": 0.92
}
```

## Analytics Endpoints

### POST /api/analytics/events

Track analytics event.

**Request:**

```json
{
  "type": "VIEW_PRODUCT",
  "productId": "clx123...",
  "metadata": {
    "source": "homepage"
  }
}
```

### POST /api/analytics/vitals

Track Web Vitals.

**Request:**

```json
{
  "name": "LCP",
  "value": 1234,
  "rating": "good"
}
```

## Social Media Endpoints

### POST /api/social/posts

Create social media post.

**Auth Required:** Admin

**Request:**

```json
{
  "platform": "INSTAGRAM",
  "content": "Check out our new product!",
  "imageUrl": "https://...",
  "productId": "clx123...",
  "scheduledFor": "2026-04-01T10:00:00Z"
}
```

**Response:**

```json
{
  "message": "Post scheduled successfully",
  "post": {...}
}
```

### GET /api/social/posts

Get social media posts.

**Auth Required:** Admin

**Query Parameters:**

- `platform` (string): Filter by platform
- `status` (string): Filter by status

### GET /api/social/posts/[id]

Get post details.

### PATCH /api/social/posts/[id]

Update post.

### DELETE /api/social/posts/[id]

Delete post.

### GET /api/social/posts/[id]/analytics

Get post analytics.

**Response:**

```json
{
  "analytics": {
    "impressions": 5000,
    "reach": 3500,
    "likes": 250,
    "comments": 42,
    "shares": 18,
    "clicks": 120,
    "engagementRate": 0.084
  }
}
```

### POST /api/social/campaigns

Create marketing campaign.

**Auth Required:** Admin

### GET /api/social/campaigns

Get campaigns.

### POST /api/social/connections

Connect social media account.

**Auth Required:** Admin

### GET /api/social/stats/[productId]

Get social stats for product.

### POST /api/share

Generate shareable link with tracking.

**Request:**

```json
{
  "productId": "clx123...",
  "platform": "FACEBOOK"
}
```

**Response:**

```json
{
  "shareUrl": "https://yourdomain.com/products/product-name?utm_source=facebook&utm_medium=social&utm_campaign=share"
}
```

## Admin Endpoints

All admin endpoints require `ADMIN` or `SUPERADMIN` role.

### GET /api/admin/dashboard

Get dashboard statistics.

**Response:**

```json
{
  "stats": {
    "revenue": {
      "today": 15000,
      "week": 85000,
      "month": 350000
    },
    "orders": {
      "today": 25,
      "week": 180,
      "month": 750
    },
    "customers": {
      "total": 1250,
      "new": 45
    },
    "products": {
      "total": 500,
      "lowStock": 12
    }
  }
}
```

### GET /api/admin/analytics

Get detailed analytics.

**Query Parameters:**

- `startDate` (string): Start date (ISO 8601)
- `endDate` (string): End date (ISO 8601)
- `metric` (string): Metric type

### POST /api/admin/products

Create product.

**Request:**

```json
{
  "name": "New Product",
  "slug": "new-product",
  "description": "Product description",
  "price": 9999,
  "sku": "PROD-NEW-001",
  "stockQuantity": 100,
  "categoryId": "clx123...",
  "images": [...]
}
```

### PATCH /api/admin/products/[id]

Update product.

### DELETE /api/admin/products/[id]

Delete product.

### PATCH /api/admin/products/[id]/inventory

Update product inventory.

**Request:**

```json
{
  "stockQuantity": 150
}
```

### GET /api/admin/orders

Get all orders.

**Query Parameters:**

- `page`, `limit`, `status`

### PATCH /api/admin/orders/[id]

Update order status.

**Request:**

```json
{
  "status": "SHIPPED",
  "trackingNumber": "1Z999AA10123456784",
  "carrier": "UPS"
}
```

### POST /api/admin/orders/[id]/refund

Refund order.

**Request:**

```json
{
  "amount": 22138,
  "reason": "Customer request"
}
```

### GET /api/admin/users

Get all users.

### PATCH /api/admin/users/[id]

Update user (change role, etc.).

## Rate Limits

- **Anonymous**: 100 requests/minute
- **Authenticated**: 300 requests/minute
- **Admin**: 1000 requests/minute

## Webhooks

### POST /api/webhooks/stripe

Stripe webhook for payment events.

**Events:**

- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.refunded`

## Error Codes

| Code                  | Description                         |
| --------------------- | ----------------------------------- |
| `UNAUTHORIZED`        | Authentication required             |
| `FORBIDDEN`           | Insufficient permissions            |
| `NOT_FOUND`           | Resource not found                  |
| `VALIDATION_ERROR`    | Invalid input data                  |
| `CONFLICT`            | Resource conflict (e.g., duplicate) |
| `RATE_LIMIT_EXCEEDED` | Too many requests                   |
| `INTERNAL_ERROR`      | Server error                        |
| `PAYMENT_FAILED`      | Payment processing failed           |
| `INSUFFICIENT_STOCK`  | Product out of stock                |

## Example Usage

### Fetch Products with Filters

```typescript
const response = await fetch('/api/products?category=electronics&sort=price-asc&page=1')
const { products, pagination } = await response.json()
```

### Add to Cart

```typescript
const response = await fetch('/api/cart/items', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    productId: 'clx123...',
    quantity: 1,
  }),
})
const { cart } = await response.json()
```

### Complete Checkout

```typescript
// 1. Create checkout session
const checkoutResponse = await fetch('/api/checkout', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    shippingAddress: {...},
    billingAddress: {...},
  }),
});
const { clientSecret, orderId } = await checkoutResponse.json();

// 2. Confirm payment with Stripe
const { error } = await stripe.confirmCardPayment(clientSecret, {
  payment_method: {...},
});

// 3. Verify payment
if (!error) {
  await fetch('/api/checkout/verify', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentIntentId }),
  });
}
```
