import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import type { Session } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '../../../lib/prisma'
import { z } from 'zod'
import Decimal from 'decimal.js'
import { Prisma } from '@prisma/client'

const SaleItemSchema = z.object({
  productId: z.string(),
  qty: z.number().positive(),
})

const BodySchema = z.object({
  customerId: z.string().optional(),
  items: z.array(SaleItemSchema).optional(),
  totalAmount: z.number().optional(),
  totalCost: z.number().optional(),
  paidAmount: z.number().min(0),
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const session = (await getServerSession(req, res, authOptions as any)) as Session | null
  if (!session || !session.user || !session.user.email) return res.status(401).json({ error: 'Unauthorized' })

  const parsed = BodySchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid request', details: parsed.error.errors })

  const { customerId, items, totalAmount: totalAmountInput, totalCost: totalCostInput, paidAmount } = parsed.data

  try {
    // find business owned by user
    const business = await prisma.business.findFirst({ where: { ownerId: (session.user as any).id } })
    if (!business) return res.status(403).json({ error: 'Business not found for user' })

    let totalAmount = new Decimal(0)
    let totalCost = new Decimal(0)
    const saleItemsData: any[] = []

    if (items && items.length > 0) {
      // fetch products and validate stock & prices
      const productIds = items.map((i) => i.productId)
      const products = await prisma.product.findMany({ where: { id: { in: productIds }, businessId: business.id } })
      if (products.length !== productIds.length) return res.status(400).json({ error: 'One or more products not found or do not belong to your business' })

      for (const it of items) {
        const prod = products.find((p) => p.id === it.productId)!
        const qty = new Decimal(it.qty)
        const price = new Decimal((prod as any).sellingPrice)
        const cost = new Decimal((prod as any).purchasePrice)
        const itemTotalPrice = price.mul(qty)
        const itemTotalCost = cost.mul(qty)
        const itemProfit = itemTotalPrice.minus(itemTotalCost)

        // stock check
        if (!business.allowNegativeStock) {
          const currentStock = new Decimal((prod as any).stockQuantity)
          if (currentStock.lt(qty)) return res.status(400).json({ error: `Insufficient stock for product ${prod.name}` })
        }

        totalAmount = totalAmount.plus(itemTotalPrice)
        totalCost = totalCost.plus(itemTotalCost)

        saleItemsData.push({
          productId: prod.id,
          storedName: prod.name,
          qty: qty.toNumber(),
          costAtSale: cost.toNumber(),
          priceAtSale: price.toNumber(),
          totalCost: itemTotalCost.toNumber(),
          totalPrice: itemTotalPrice.toNumber(),
          profit: itemProfit.toNumber(),
        })
      }
    } else {
      // QUICK mode: use provided totals
      if (typeof totalAmountInput !== 'number') return res.status(400).json({ error: 'totalAmount is required when items are not provided' })
      totalAmount = new Decimal(totalAmountInput)
      totalCost = new Decimal(totalCostInput || 0)
    }

    const totalProfit = totalAmount.minus(totalCost)

    // determine payment status
    const paid = new Decimal(paidAmount)
    let paymentStatus: Prisma.PaymentStatus = Prisma.PaymentStatus.CREDIT
    if (paid.gte(totalAmount)) paymentStatus = Prisma.PaymentStatus.PAID
    else if (paid.gt(0)) paymentStatus = Prisma.PaymentStatus.PARTIAL

    // create sale transactionally
    const reference = `S-${Date.now().toString().slice(-6)}`

    const result = await prisma.$transaction(async (tx) => {
      const sale = await tx.sale.create({
        data: {
          businessId: business.id,
          reference,
          type: items && items.length > 0 ? Prisma.SaleType.NAMED : Prisma.SaleType.QUICK,
          totalAmount: totalAmount.toNumber(),
          totalCost: totalCost.toNumber(),
          totalProfit: totalProfit.toNumber(),
          customerId: customerId || null,
          paidAmount: paid.toNumber(),
          paymentStatus,
        },
      })

      for (const it of saleItemsData) {
        await tx.saleItem.create({ data: { saleId: sale.id, productId: it.productId, storedName: it.storedName, qty: it.qty, costAtSale: it.costAtSale, priceAtSale: it.priceAtSale, totalCost: it.totalCost, totalPrice: it.totalPrice, profit: it.profit } })

        // update stock
        await tx.product.update({ where: { id: it.productId }, data: { stockQuantity: { decrement: it.qty } } })

        // record inventory adjustment
        await tx.inventoryAdjustment.create({ data: { businessId: business.id, productId: it.productId, change: -it.qty, reason: `Sale ${sale.reference}`, relatedSaleId: sale.id } })
      }

      // ledger entries
      if (paid.gt(0)) {
        await tx.customerLedgerEntry.create({ data: { businessId: business.id, customerId: customerId || null, amount: paid.toNumber(), type: Prisma.LedgerType.PAYMENT, note: `Payment for ${reference}`, relatedSaleId: sale.id } })
      }

      // record purchase ledger entry as a net purchase (credit)
      await tx.customerLedgerEntry.create({ data: { businessId: business.id, customerId: customerId || null, amount: totalAmount.toNumber(), type: Prisma.LedgerType.PURCHASE, note: `Sale ${reference}`, relatedSaleId: sale.id } })

      return sale
    })

    return res.status(201).json({ data: result })
  } catch (err: any) {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
