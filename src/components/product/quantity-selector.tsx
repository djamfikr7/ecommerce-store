'use client'

import { Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface QuantitySelectorProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  disabled?: boolean
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 10,
  disabled = false,
}: QuantitySelectorProps) {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1)
    }
  }

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1)
    }
  }

  const canDecrement = value > min && !disabled
  const canIncrement = value < max && !disabled

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={handleDecrement}
        disabled={!canDecrement}
        aria-label="Decrease quantity"
        className="neo-raised-sm"
      >
        <Minus className="h-4 w-4" />
      </Button>

      <div
        className={cn(
          'neo-inset w-16 h-10 flex items-center justify-center rounded-lg',
          'text-slate-100 font-medium text-center',
          disabled && 'opacity-50'
        )}
        aria-live="polite"
        aria-atomic="true"
      >
        <span>{value}</span>
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={handleIncrement}
        disabled={!canIncrement}
        aria-label="Increase quantity"
        className="neo-raised-sm"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}
