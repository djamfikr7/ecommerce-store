'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Ruler } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { VariantWithInventory } from '@/types/products'

interface VariantSelectorProps {
  variants: VariantWithInventory[]
  selectedVariant: VariantWithInventory | null
  onSelect: (variant: VariantWithInventory) => void
}

// Group variants by attribute type (color, size, etc.)
function groupVariantsByAttribute(variants: VariantWithInventory[]) {
  const groups: Record<string, Record<string, VariantWithInventory[]>> = {}

  variants.forEach((variant) => {
    Object.entries(variant.attributes).forEach(([attrName, attrValue]) => {
      if (!groups[attrName]) {
        groups[attrName] = {}
      }
      const key = String(attrValue)
      if (!groups[attrName][key]) {
        groups[attrName][key] = []
      }
      groups[attrName][key].push(variant)
    })
  })

  return groups
}

export function VariantSelector({ variants, selectedVariant, onSelect }: VariantSelectorProps) {
  const [showSizeGuide, setShowSizeGuide] = useState(false)
  const attributeGroups = groupVariantsByAttribute(variants)

  const getSelectedAttributeValue = (attrName: string) => {
    if (!selectedVariant) return null
    return String(selectedVariant.attributes[attrName] || '')
  }

  const handleAttributeSelect = (attrName: string, attrValue: string) => {
    // Find a variant that has this attribute value and is in stock
    const matchingVariant = variants.find(
      (v) =>
        String(v.attributes[attrName]) === attrValue &&
        (selectedVariant?.attributes &&
        Object.entries(selectedVariant.attributes).every(
          ([key, val]) => key === attrName || String(v.attributes[key]) === String(val)
        ) ?
        v.stockQuantity > 0 :
        v.stockQuantity > 0)
    )

    if (matchingVariant) {
      onSelect(matchingVariant)
    }
  }

  // Check if an attribute value is available (at least one variant with it is in stock)
  const isAttributeAvailable = (attrName: string, attrValue: string) => {
    return variants.some(
      (v) => String(v.attributes[attrName]) === attrValue && v.stockQuantity > 0
    )
  }

  return (
    <div className="space-y-6">
      {Object.entries(attributeGroups).map(([attrName, attrValues]) => {
        const attrLabel = attrName.charAt(0).toUpperCase() + attrName.slice(1)
        const selectedValue = getSelectedAttributeValue(attrName)

        return (
          <div key={attrName}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-100">{attrLabel}</span>
              {attrName.toLowerCase() === 'size' && (
                <button
                  onClick={() => setShowSizeGuide(true)}
                  className="text-xs text-accent-primary hover:text-accent-primary-hover transition-colors flex items-center gap-1"
                >
                  <Ruler className="h-3 w-3" />
                  Size Guide
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {Object.keys(attrValues).map((value) => {
                const isSelected = selectedValue === value
                const isAvailable = isAttributeAvailable(attrName, value)
                const isColor = attrName.toLowerCase() === 'color'

                if (isColor) {
                  return (
                    <ColorSwatch
                      key={value}
                      color={value}
                      isSelected={isSelected}
                      isAvailable={isAvailable}
                      onClick={() => handleAttributeSelect(attrName, value)}
                    />
                  )
                }

                return (
                  <button
                    key={value}
                    onClick={() => handleAttributeSelect(attrName, value)}
                    disabled={!isAvailable}
                    className={cn(
                      'neo-raised-sm px-4 py-2 rounded-lg text-sm font-medium transition-all',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary',
                      isSelected
                        ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary neo-glow-hover'
                        : 'text-slate-300 hover:text-slate-100',
                      !isAvailable && 'opacity-50 cursor-not-allowed line-through'
                    )}
                    aria-pressed={isSelected}
                    aria-label={`${value}${!isAvailable ? ' (out of stock)' : ''}`}
                  >
                    {value}
                    {!isAvailable && <X className="inline-block ml-1 h-3 w-3" />}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Size guide modal */}
      <AnimatePresence>
        {showSizeGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            onClick={() => setShowSizeGuide(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="neo-card p-6 max-w-lg w-full max-h-[80vh] overflow-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-100">Size Guide</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowSizeGuide(false)}>
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </Button>
              </div>
              <p className="text-sm text-slate-400 mb-4">
                Use this guide to find your perfect fit. Measurements are in inches.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border-subtle">
                      <th className="py-2 px-3 text-left text-slate-300">Size</th>
                      <th className="py-2 px-3 text-left text-slate-300">Chest</th>
                      <th className="py-2 px-3 text-left text-slate-300">Waist</th>
                      <th className="py-2 px-3 text-left text-slate-300">Length</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border-subtle">
                      <td className="py-2 px-3 text-slate-100">XS</td>
                      <td className="py-2 px-3 text-slate-300">32-34</td>
                      <td className="py-2 px-3 text-slate-300">26-28</td>
                      <td className="py-2 px-3 text-slate-300">30</td>
                    </tr>
                    <tr className="border-b border-border-subtle">
                      <td className="py-2 px-3 text-slate-100">S</td>
                      <td className="py-2 px-3 text-slate-300">34-36</td>
                      <td className="py-2 px-3 text-slate-300">28-30</td>
                      <td className="py-2 px-3 text-slate-300">31</td>
                    </tr>
                    <tr className="border-b border-border-subtle">
                      <td className="py-2 px-3 text-slate-100">M</td>
                      <td className="py-2 px-3 text-slate-300">38-40</td>
                      <td className="py-2 px-3 text-slate-300">32-34</td>
                      <td className="py-2 px-3 text-slate-300">32</td>
                    </tr>
                    <tr className="border-b border-border-subtle">
                      <td className="py-2 px-3 text-slate-100">L</td>
                      <td className="py-2 px-3 text-slate-300">42-44</td>
                      <td className="py-2 px-3 text-slate-300">36-38</td>
                      <td className="py-2 px-3 text-slate-300">33</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-slate-100">XL</td>
                      <td className="py-2 px-3 text-slate-300">46-48</td>
                      <td className="py-2 px-3 text-slate-300">40-42</td>
                      <td className="py-2 px-3 text-slate-300">34</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface ColorSwatchProps {
  color: string
  isSelected: boolean
  isAvailable: boolean
  onClick: () => void
}

function ColorSwatch({ color, isSelected, isAvailable, onClick }: ColorSwatchProps) {
  // Convert color name to actual color value
  const getColorValue = (colorName: string) => {
    const colorMap: Record<string, string> = {
      black: '#000000',
      white: '#ffffff',
      red: '#ef4444',
      blue: '#3b82f6',
      green: '#22c55e',
      yellow: '#eab308',
      purple: '#a855f7',
      pink: '#ec4899',
      orange: '#f97316',
      gray: '#6b7280',
      grey: '#6b7280',
      navy: '#1e3a5f',
      brown: '#a16207',
      beige: '#d4c4a8',
      ivory: '#fffff0',
      cream: '#fffdd0',
    }
    return colorMap[colorName.toLowerCase()] || colorName
  }

  const colorValue = getColorValue(color)
  const isLightColor = ['white', 'ivory', 'cream', 'beige', 'yellow'].some(
    (c) => colorName.toLowerCase() === c
  )

  return (
    <button
      onClick={onClick}
      disabled={!isAvailable}
      className={cn(
        'relative w-10 h-10 rounded-full transition-all',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base',
        isSelected && 'ring-2 ring-accent-primary ring-offset-2 ring-offset-surface-base neo-glow',
        !isAvailable && 'opacity-50 cursor-not-allowed'
      )}
      style={{ backgroundColor: colorValue }}
      aria-label={`${color}${!isAvailable ? ' (out of stock)' : ''}`}
      aria-pressed={isSelected}
    >
      {isSelected && (
        <Check
          className={cn(
            'absolute inset-0 m-auto h-5 w-5',
            isLightColor ? 'text-gray-800' : 'text-white'
          )}
        />
      )}
      {!isAvailable && (
        <X
          className={cn(
            'absolute inset-0 m-auto h-5 w-5',
            isLightColor ? 'text-gray-400' : 'text-white/70'
          )}
        />
      )}
    </button>
  )
}
