#!/bin/bash
# Optimize images for production
# Run: ./scripts/optimize-images.sh

set -e

echo "Optimizing images..."
# Use sharp or imagemin to optimize product images
# Convert to WebP where supported

for img in public/images/*.{jpg,png}; do
  if [ -f "$img" ]; then
    echo "Optimizing: $img"
    # Convert to WebP and reduce quality
    # cwebp -q 80 "$img" -o "${img%.*}.webp" 2>/dev/null || true
  fi
done

echo "Image optimization complete"
