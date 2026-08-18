import { describe, it, expect } from 'vitest'
import { calculateTotals } from '../src/lib/math'

describe('calculateTotals', () => {
  it('calculates totals correctly', () => {
    const items = [
      { qty: '2', cost: '100', price: '130' },
      { qty: '3', cost: '50', price: '70' }
    ]
    const res = calculateTotals(items)
    expect(res.totalCost).toBe('350.00')
    expect(res.totalPrice).toBe('430.00')
    expect(res.profit).toBe('80.00')
  })
})
