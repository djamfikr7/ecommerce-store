import { describe, it, expect } from 'vitest'
import {
  formatPrice,
  addPrices,
  subtractPrices,
  multiplyPrice,
  percentageOf,
  centsToDecimal,
  decimalToCents,
} from '@/lib/currency'

describe('formatPrice', () => {
  it('formats price in cents to currency string', () => {
    expect(formatPrice(1999)).toBe('$19.99')
  })

  it('handles zero price', () => {
    expect(formatPrice(0)).toBe('$0.00')
  })

  it('formats large amounts correctly', () => {
    expect(formatPrice(100000)).toBe('$1,000.00')
  })
})

describe('centsToDecimal / decimalToCents', () => {
  it('converts cents to decimal', () => {
    expect(centsToDecimal(1999)).toBe(19.99)
  })

  it('converts decimal to cents', () => {
    expect(decimalToCents(19.99)).toBe(1999)
  })

  it('round trips correctly', () => {
    const original = 19.99
    expect(decimalToCents(centsToDecimal(decimalToCents(original)))).toBe(
      decimalToCents(original)
    )
  })
})

describe('addPrices', () => {
  it('adds two prices without floating point errors', () => {
    // Classic floating point issue: 0.1 + 0.2 !== 0.3
    expect(addPrices(10, 20)).toBe(30)
    expect(addPrices(199, 299)).toBe(498)
  })
})

describe('percentageOf', () => {
  it('calculates percentage correctly', () => {
    expect(percentageOf(10000, 10)).toBe(1000) // 10% of $100
    expect(percentageOf(10000, 8.5)).toBe(850) // 8.5% tax
  })
})
