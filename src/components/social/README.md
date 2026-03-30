# Social Sharing Components

Complete social media sharing solution with dark neomorphic design.

## Components

### ShareButton

Dropdown button for sharing products on social media.

**Features:**

- Facebook, Twitter, Pinterest, WhatsApp, Email sharing
- Copy link to clipboard
- Native share API support (mobile)
- Multiple variants: default, icon, text
- Dark neomorphic design with animations

**Usage:**

```tsx
import { ShareButton } from '@/components/social'

;<ShareButton
  product={{
    name: 'Product Name',
    slug: 'product-slug',
    image: '/image.jpg',
    price: '$99.99',
    rating: 4.5,
  }}
  variant="default" // or "icon" | "text"
  size="md" // or "sm" | "lg"
  showLabel={true}
/>
```

### ShareModal

Full-featured modal for sharing with preview.

**Features:**

- Product preview with image
- Share text preview
- All social platforms
- Copy link functionality
- Animated entrance/exit
- Click outside to close

**Usage:**

```tsx
import { ShareModal } from '@/components/social'

const [isOpen, setIsOpen] = useState(false)

<ShareModal
  product={product}
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
/>
```

### Social Icons

Pre-built SVG icons for all platforms.

**Available Icons:**

- FacebookIcon
- TwitterIcon
- PinterestIcon
- WhatsAppIcon
- EmailIcon
- LinkIcon
- ShareIcon
- CheckIcon
- XIcon

## Utilities

### Share Utilities (`src/lib/utils/share.ts`)

- `copyToClipboard(text)` - Copy text to clipboard
- `canUseNativeShare()` - Check native share API availability
- `nativeShare(data)` - Use native share API
- `openShareWindow(url)` - Open share in popup window
- `trackShare(platform, product)` - Track share events

### Social Share (`src/lib/social/share.ts`)

- `generateShareUrl(product, platform)` - Generate platform-specific URLs
- `generateShareText(product)` - Generate share text
- `generateAllShareUrls(product)` - Get all share URLs
- `generateOgTags(product)` - Generate Open Graph tags

## Supported Platforms

1. **Facebook** - Share to Facebook feed
2. **Twitter** - Tweet with product info
3. **Pinterest** - Pin with image
4. **WhatsApp** - Share via WhatsApp
5. **Email** - Share via email client
6. **Copy Link** - Copy URL to clipboard

## Features

- ✅ Dark neomorphic design
- ✅ Smooth animations with Framer Motion
- ✅ Native share API support (mobile)
- ✅ Copy to clipboard with fallback
- ✅ Analytics tracking ready
- ✅ Responsive design
- ✅ Accessibility compliant
- ✅ TypeScript support
- ✅ Multiple variants and sizes

## Integration Examples

See `src/components/social/examples.tsx` for complete integration examples.
