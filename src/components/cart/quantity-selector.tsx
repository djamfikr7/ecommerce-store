'use client';

import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void | Promise<void>;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
  disabled?: boolean;
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  size = 'md',
  disabled = false,
}: QuantitySelectorProps) {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  const isSmall = size === 'sm';
  const buttonSize = isSmall ? 'w-7 h-7' : 'w-10 h-10';
  const iconSize = isSmall ? 'w-3 h-3' : 'w-4 h-4';
  const fontSize = isSmall ? 'text-sm' : 'text-base';
  const minWidth = isSmall ? 'w-10' : 'w-14';

  return (
    <div
      className={`inline-flex items-center gap-1 ${disabled ? 'opacity-50' : ''}`}
      role="group"
      aria-label="Quantity selector"
    >
      {/* Decrement Button */}
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        className={`${buttonSize} rounded-xl bg-white/5 hover:bg-white/10 disabled:hover:bg-white/5 disabled:cursor-not-allowed text-white/70 hover:text-white disabled:text-white/30 transition-all flex items-center justify-center`}
        aria-label="Decrease quantity"
      >
        <Minus className={iconSize} />
      </button>

      {/* Value Display / Input */}
      <input
        type="number"
        value={value}
        onChange={handleInputChange}
        min={min}
        max={max}
        disabled={disabled}
        className={`${minWidth} ${fontSize} h-10 text-center bg-transparent border-none text-white font-semibold focus:outline-none focus:ring-2 focus:ring-accent rounded-lg`}
        aria-label="Quantity"
      />

      {/* Increment Button */}
      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        className={`${buttonSize} rounded-xl bg-white/5 hover:bg-white/10 disabled:hover:bg-white/5 disabled:cursor-not-allowed text-white/70 hover:text-white disabled:text-white/30 transition-all flex items-center justify-center`}
        aria-label="Increase quantity"
      >
        <Plus className={iconSize} />
      </button>
    </div>
  );
}

export default QuantitySelector;
