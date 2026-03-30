# Component Library Guide

Complete guide to using components in the E-Commerce Web Store.

## Component Architecture

Components are organized by feature and responsibility:

```
src/components/
├── ui/                   # Primitive UI components (buttons, inputs, cards)
├── design-system/        # Design system components (3D buttons, transitions)
├── layout/               # Layout components (header, footer, sidebar)
├── product/              # Product-related components
├── cart/                 # Shopping cart components
├── checkout/             # Checkout flow components
├── auth/                 # Authentication components
├── reviews/              # Review system components
├── wishlist/             # Wishlist components
├── admin/                # Admin dashboard components
├── currency/             # Currency components
├── i18n/                 # Internationalization components
└── providers/            # Context providers
```

## Design System Components

### Button3D

3D animated button with depth and hover effects.

**Location:** `src/components/design-system/button-3d.tsx`

**Usage:**

```tsx
import { Button3D } from '@/components/design-system/button-3d'

;<Button3D onClick={handleClick} variant="primary" size="lg">
  Add to Cart
</Button3D>
```

**Props:**

- `variant`: `'primary' | 'secondary' | 'outline'`
- `size`: `'sm' | 'md' | 'lg'`
- `disabled`: `boolean`
- `loading`: `boolean`
- All standard button props

**Features:**

- 3D depth effect using CSS transforms
- Smooth hover animations
- Press animation on click
- Loading state with spinner
- Accessible (keyboard navigation, ARIA labels)

### PageTransition

Smooth page transitions with Framer Motion.

**Location:** `src/components/design-system/page-transition.tsx`

**Usage:**

```tsx
import { PageTransition } from '@/components/design-system/page-transition'

;<PageTransition>
  <YourPageContent />
</PageTransition>
```

**Props:**

- `children`: React node
- `duration`: Animation duration (default: 0.3s)

## UI Primitives

### Button

Standard button component with variants.

**Location:** `src/components/ui/button.tsx`

**Usage:**

```tsx
import { Button } from '@/components/ui/button'

;<Button variant="default" size="md" onClick={handleClick}>
  Click Me
</Button>
```

**Variants:**

- `default`: Primary button
- `destructive`: Danger/delete actions
- `outline`: Outlined button
- `secondary`: Secondary actions
- `ghost`: Minimal button
- `link`: Link-styled button

**Sizes:**

- `sm`: Small (32px height)
- `md`: Medium (40px height)
- `lg`: Large (48px height)
- `icon`: Square icon button

### Input

Text input with validation states.

**Location:** `src/components/ui/input.tsx`

**Usage:**

```tsx
import { Input } from '@/components/ui/input'

;<Input
  type="text"
  placeholder="Enter your email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
/>
```

**Props:**

- `type`: Input type
- `placeholder`: Placeholder text
- `error`: Error message (shows red border)
- `disabled`: Disabled state
- All standard input props

### Card

Container component with shadow and border.

**Location:** `src/components/ui/card.tsx`

**Usage:**

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

;<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>Card content goes here</CardContent>
</Card>
```

### Badge

Small label for status, tags, etc.

**Location:** `src/components/ui/badge.tsx`

**Usage:**

```tsx
import { Badge } from '@/components/ui/badge';

<Badge variant="success">In Stock</Badge>
<Badge variant="warning">Low Stock</Badge>
<Badge variant="destructive">Out of Stock</Badge>
```

### Spinner

Loading spinner.

**Location:** `src/components/ui/spinner.tsx`

**Usage:**

```tsx
import { Spinner } from '@/components/ui/spinner'

;<Spinner size="md" />
```

### Skeleton

Loading placeholder.

**Location:** `src/components/ui/skeleton.tsx`

**Usage:**

```tsx
import { Skeleton } from '@/components/ui/skeleton';

<Skeleton className="h-4 w-full" />
<Skeleton className="h-8 w-32" />
```

## Product Components

### ProductCard

Product card for grid/list views.

**Location:** `src/components/product/product-card.tsx`

**Usage:**

```tsx
import { ProductCard } from '@/components/product/product-card'

;<ProductCard
  product={{
    id: 'clx123',
    name: 'Product Name',
    slug: 'product-name',
    price: 9999,
    compareAtPrice: 12999,
    images: [{ url: '...', alt: '...' }],
    stockQuantity: 50,
  }}
/>
```

**Features:**

- Product image with lazy loading
- Price display with compare-at price
- Add to cart button
- Wishlist button
- Stock status badge
- Hover effects

### ProductGallery

Image gallery with thumbnails and zoom.

**Location:** `src/components/product/product-gallery.tsx`

**Usage:**

```tsx
import { ProductGallery } from '@/components/product/product-gallery'

;<ProductGallery
  images={[
    { url: 'https://...', alt: 'Product image 1' },
    { url: 'https://...', alt: 'Product image 2' },
  ]}
/>
```

**Features:**

- Main image display
- Thumbnail navigation
- Click to zoom
- Keyboard navigation
- Touch/swipe support

### ProductInfo

Product details section.

**Location:** `src/components/product/product-info.tsx`

**Usage:**

```tsx
import { ProductInfo } from '@/components/product/product-info'

;<ProductInfo
  product={product}
  onAddToCart={handleAddToCart}
  onAddToWishlist={handleAddToWishlist}
/>
```

**Features:**

- Product name and description
- Price display
- Variant selector
- Quantity selector
- Add to cart/wishlist buttons
- Stock status
- SKU display

### VariantSelector

Product variant selector (size, color, etc.).

**Location:** `src/components/product/variant-selector.tsx`

**Usage:**

```tsx
import { VariantSelector } from '@/components/product/variant-selector'

;<VariantSelector
  variants={product.variants}
  selectedVariant={selectedVariant}
  onSelect={setSelectedVariant}
/>
```

### QuantitySelector

Quantity input with +/- buttons.

**Location:** `src/components/product/quantity-selector.tsx`

**Usage:**

```tsx
import { QuantitySelector } from '@/components/product/quantity-selector'

;<QuantitySelector value={quantity} onChange={setQuantity} min={1} max={product.stockQuantity} />
```

### ProductFilters

Filter sidebar for product listing.

**Location:** `src/components/product/product-filters.tsx`

**Usage:**

```tsx
import { ProductFilters } from '@/components/product/product-filters'

;<ProductFilters categories={categories} filters={filters} onFilterChange={handleFilterChange} />
```

**Features:**

- Category filter
- Price range slider
- Attribute filters (size, color, etc.)
- Clear filters button

### ProductSort

Sort dropdown for product listing.

**Location:** `src/components/product/product-sort.tsx`

**Usage:**

```tsx
import { ProductSort } from '@/components/product/product-sort'

;<ProductSort value={sortBy} onChange={setSortBy} />
```

**Options:**

- Newest
- Price: Low to High
- Price: High to Low
- Best Rating
- Most Popular

### ProductGrid

Responsive product grid.

**Location:** `src/components/product/product-grid.tsx`

**Usage:**

```tsx
import { ProductGrid } from '@/components/product/product-grid'

;<ProductGrid products={products} />
```

**Features:**

- Responsive grid (1-4 columns)
- Loading skeletons
- Empty state
- Pagination

### SearchAutocomplete

Search input with autocomplete.

**Location:** `src/components/product/search-autocomplete.tsx`

**Usage:**

```tsx
import { SearchAutocomplete } from '@/components/product/search-autocomplete'

;<SearchAutocomplete onSelect={handleProductSelect} />
```

**Features:**

- Real-time search
- Product suggestions
- Keyboard navigation
- Recent searches

## Cart Components

### CartDrawer

Slide-out cart drawer.

**Location:** `src/components/cart/cart-drawer.tsx`

**Usage:**

```tsx
import { CartDrawer } from '@/components/cart/cart-drawer'

;<CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
```

**Features:**

- Cart items list
- Quantity controls
- Remove item button
- Cart totals
- Checkout button
- Empty cart state

### CartItem

Individual cart item row.

**Location:** `src/components/cart/cart-item.tsx`

**Usage:**

```tsx
import { CartItem } from '@/components/cart/cart-item'

;<CartItem item={cartItem} onUpdateQuantity={handleUpdateQuantity} onRemove={handleRemove} />
```

### CartSummary

Cart totals summary.

**Location:** `src/components/cart/cart-summary.tsx`

**Usage:**

```tsx
import { CartSummary } from '@/components/cart/cart-summary'

;<CartSummary subtotal={subtotal} shipping={shipping} tax={tax} total={total} currency={currency} />
```

### EmptyCart

Empty cart state.

**Location:** `src/components/cart/empty-cart.tsx`

**Usage:**

```tsx
import { EmptyCart } from '@/components/cart/empty-cart'

{
  cart.items.length === 0 && <EmptyCart />
}
```

## Checkout Components

### StepIndicator

Checkout progress indicator.

**Location:** `src/components/checkout/step-indicator.tsx`

**Usage:**

```tsx
import { StepIndicator } from '@/components/checkout/step-indicator'

;<StepIndicator steps={['Shipping', 'Payment', 'Review']} currentStep={1} />
```

### ShippingForm

Shipping address form.

**Location:** `src/components/checkout/shipping-form.tsx`

**Usage:**

```tsx
import { ShippingForm } from '@/components/checkout/shipping-form'

;<ShippingForm onSubmit={handleShippingSubmit} initialValues={savedAddress} />
```

**Features:**

- Address fields with validation
- Save address checkbox
- Address autocomplete (optional)
- Form error handling

### PaymentForm

Payment method form.

**Location:** `src/components/checkout/payment-form.tsx`

**Usage:**

```tsx
import { PaymentForm } from '@/components/checkout/payment-form'

;<PaymentForm
  clientSecret={clientSecret}
  onSuccess={handlePaymentSuccess}
  onError={handlePaymentError}
/>
```

**Features:**

- Stripe Elements integration
- Card input with validation
- Billing address
- Payment error handling

### StripeCheckoutButton

Stripe checkout button.

**Location:** `src/components/checkout/stripe-checkout-button.tsx`

**Usage:**

```tsx
import { StripeCheckoutButton } from '@/components/checkout/stripe-checkout-button'

;<StripeCheckoutButton amount={total} onSuccess={handleSuccess} />
```

## Authentication Components

### AuthForms

Login and registration forms.

**Location:** `src/components/auth/auth-forms.tsx`

**Usage:**

```tsx
import { LoginForm, RegisterForm } from '@/components/auth/auth-forms';

<LoginForm onSuccess={handleLoginSuccess} />
<RegisterForm onSuccess={handleRegisterSuccess} />
```

**Features:**

- Email/password validation
- Error handling
- Loading states
- Social login buttons

### UserButton

User profile dropdown button.

**Location:** `src/components/auth/user-button.tsx`

**Usage:**

```tsx
import { UserButton } from '@/components/auth/user-button'

;<UserButton />
```

**Features:**

- User avatar
- Dropdown menu (Profile, Orders, Logout)
- Login button (when not authenticated)

### PasswordInput

Password input with show/hide toggle.

**Location:** `src/components/auth/password-input.tsx`

**Usage:**

```tsx
import { PasswordInput } from '@/components/auth/password-input'

;<PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} />
```

### PasswordStrength

Password strength indicator.

**Location:** `src/components/auth/password-strength.tsx`

**Usage:**

```tsx
import { PasswordStrength } from '@/components/auth/password-strength'

;<PasswordStrength password={password} />
```

### SocialLoginButton

Social OAuth login button.

**Location:** `src/components/auth/social-login-button.tsx`

**Usage:**

```tsx
import { SocialLoginButton } from '@/components/auth/social-login-button';

<SocialLoginButton provider="google" />
<SocialLoginButton provider="facebook" />
```

## Review Components

### ReviewList

List of product reviews.

**Location:** `src/components/reviews/review-list.tsx`

**Usage:**

```tsx
import { ReviewList } from '@/components/reviews/review-list'

;<ReviewList productId={product.id} reviews={reviews} />
```

### ReviewCard

Individual review card.

**Location:** `src/components/reviews/review-card.tsx`

**Usage:**

```tsx
import { ReviewCard } from '@/components/reviews/review-card'

;<ReviewCard review={review} />
```

**Features:**

- Star rating
- Review title and content
- Review images
- Verified purchase badge
- Helpful button
- Date

### ReviewForm

Review submission form.

**Location:** `src/components/reviews/review-form.tsx`

**Usage:**

```tsx
import { ReviewForm } from '@/components/reviews/review-form'

;<ReviewForm productId={product.id} onSubmit={handleReviewSubmit} />
```

**Features:**

- Star rating selector
- Title and content inputs
- Image upload
- Validation

### RatingSummary

Rating distribution summary.

**Location:** `src/components/reviews/rating-summary.tsx`

**Usage:**

```tsx
import { RatingSummary } from '@/components/reviews/rating-summary'

;<RatingSummary
  averageRating={4.5}
  totalReviews={142}
  distribution={{
    5: 80,
    4: 40,
    3: 15,
    2: 5,
    1: 2,
  }}
/>
```

### RatingStars

Star rating display.

**Location:** `src/components/reviews/rating-stars.tsx`

**Usage:**

```tsx
import { RatingStars } from '@/components/reviews/rating-stars'

;<RatingStars rating={4.5} size="md" />
```

## Wishlist Components

### WishlistButton

Add to wishlist button.

**Location:** `src/components/wishlist/wishlist-button.tsx`

**Usage:**

```tsx
import { WishlistButton } from '@/components/wishlist/wishlist-button'

;<WishlistButton productId={product.id} variantId={variant?.id} />
```

**Features:**

- Heart icon
- Filled when in wishlist
- Optimistic updates
- Login prompt for guests

### WishlistDrawer

Wishlist drawer.

**Location:** `src/components/wishlist/wishlist-drawer.tsx`

**Usage:**

```tsx
import { WishlistDrawer } from '@/components/wishlist/wishlist-drawer'

;<WishlistDrawer isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
```

## Currency Components

### CurrencySelector

Currency dropdown selector.

**Location:** `src/components/currency/currency-selector.tsx`

**Usage:**

```tsx
import { CurrencySelector } from '@/components/currency/currency-selector'

;<CurrencySelector />
```

### FormattedPrice

Price display with currency formatting.

**Location:** `src/components/currency/formatted-price.tsx`

**Usage:**

```tsx
import { FormattedPrice } from '@/components/currency/formatted-price'

;<FormattedPrice amount={9999} currency="USD" />
```

**Output:** `$99.99`

## Internationalization Components

### LocaleSwitcher

Language selector.

**Location:** `src/components/i18n/locale-switcher.tsx`

**Usage:**

```tsx
import { LocaleSwitcher } from '@/components/i18n/locale-switcher'

;<LocaleSwitcher />
```

## Layout Components

### Header

Main site header.

**Location:** `src/components/layout/header.tsx`

**Usage:**

```tsx
import { Header } from '@/components/layout/header'

;<Header />
```

**Features:**

- Logo
- Navigation menu
- Search bar
- Cart icon with count
- Wishlist icon
- User button
- Currency selector
- Locale switcher

### Footer

Site footer.

**Location:** `src/components/layout/footer.tsx`

**Usage:**

```tsx
import { Footer } from '@/components/layout/footer'

;<Footer />
```

### Sidebar

Navigation sidebar.

**Location:** `src/components/layout/sidebar.tsx`

**Usage:**

```tsx
import { Sidebar } from '@/components/layout/sidebar'

;<Sidebar />
```

## Admin Components

### AdminHeader

Admin dashboard header.

**Location:** `src/components/admin/admin-header.tsx`

### AdminSidebar

Admin navigation sidebar.

**Location:** `src/components/admin/admin-sidebar.tsx`

### StatsCard

Dashboard statistics card.

**Location:** `src/components/admin/stats-card.tsx`

**Usage:**

```tsx
import { StatsCard } from '@/components/admin/stats-card'

;<StatsCard title="Total Revenue" value="$45,231" change="+12.5%" trend="up" />
```

### AdminTable

Data table for admin.

**Location:** `src/components/admin/admin-table.tsx`

### ChartContainer

Chart wrapper component.

**Location:** `src/components/admin/chart-container.tsx`

## Context Providers

### CartProvider

Cart state provider.

**Location:** `src/components/providers/cart-provider.tsx`

**Usage:**

```tsx
import { CartProvider } from '@/components/providers/cart-provider'

;<CartProvider>
  <App />
</CartProvider>
```

### CurrencyProvider

Currency state provider.

**Location:** `src/components/currency/currency-context.tsx`

**Usage:**

```tsx
import { CurrencyProvider, useCurrency } from '@/components/currency/currency-context'

// In provider
;<CurrencyProvider>
  <App />
</CurrencyProvider>

// In component
const { currency, setCurrency } = useCurrency()
```

### WishlistProvider

Wishlist state provider.

**Location:** `src/components/wishlist/wishlist-context.tsx`

## Styling Guidelines

### Tailwind Classes

Use Tailwind utility classes for styling:

```tsx
<div className="flex items-center gap-4 rounded-lg bg-gray-900 p-4 shadow-lg">
  <Button className="bg-indigo-600 hover:bg-indigo-700">Click Me</Button>
</div>
```

### Dark Gradient Theme

Use gradient backgrounds:

```tsx
<div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">Content</div>
```

### Neomorphic Shadows

Apply soft shadows for depth:

```tsx
<div className="shadow-[20px_20px_60px_#0f0f1a,-20px_-20px_60px_#252542]">Neomorphic card</div>
```

## Accessibility

All components follow accessibility best practices:

- Semantic HTML
- ARIA labels and roles
- Keyboard navigation
- Focus management
- Screen reader support
- Color contrast (WCAG AA)

## Testing Components

```tsx
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

test('renders button with text', () => {
  render(<Button>Click Me</Button>)
  expect(screen.getByText('Click Me')).toBeInTheDocument()
})
```

See [TESTING.md](./TESTING.md) for more details.
