import Decimal from 'decimal.js'

export function calculateTotals(items: { qty: string | number; cost: string | number; price: string | number }[]) {
  let totalCost = new Decimal(0)
  let totalPrice = new Decimal(0)
  for (const it of items) {
    const qty = new Decimal(it.qty.toString())
    const cost = new Decimal(it.cost.toString())
    const price = new Decimal(it.price.toString())
    totalCost = totalCost.plus(cost.mul(qty))
    totalPrice = totalPrice.plus(price.mul(qty))
  }
  const profit = totalPrice.minus(totalCost)
  return { totalCost: totalCost.toFixed(2), totalPrice: totalPrice.toFixed(2), profit: profit.toFixed(2) }
}
