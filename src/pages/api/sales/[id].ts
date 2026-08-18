import { NextApiRequest, NextApiResponse } from 'next'
import type { Prisma } from '@prisma/client'
import { prisma } from '../../../lib/prisma'
import { getBusinessForSession } from '../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const info = await getBusinessForSession(req, res)
  if (!info) return res.status(401).json({ error: 'Unauthorized' })
  const { business } = info
  if (!business) return res.status(400).json({ error: 'No business found for user' })

  const {
    query: { id },
    method,
  } = req
  if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Invalid id' })

  // Ensure sale exists and belongs to business
  const sale = await prisma.sale.findUnique({ where: { id }, include: { items: true } })
  if (!sale || sale.businessId !== business.id) return res.status(404).json({ error: 'Not found' })

  if (method === 'GET') {
    return res.json(sale)
  }

  if (method === 'POST') {
    // support actions: cancel
    const { action } = req.query
    if (action === 'cancel') {
      // Idempotent cancellation: create reversal entries and restock items
      try {
        const reversed = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
          // Create reversal sale record? Alternatively mark sale as refunded/cancelled. We'll create ledger reversal and inventory restock.
          // Customer ledger reversal
          if (sale.customerId) {
            await tx.customerLedgerEntry.create({ data: {
              businessId: business.id,
              customerId: sale.customerId,
              amount: sale.totalAmount.negated ? (sale.totalAmount as any) : (String(-Number(sale.totalAmount))),
              type: 'REVERSAL',
              note: `Reversal of ${sale.reference}`,
              relatedSaleId: sale.id,
            } })
          }

          // Restock items
          for (const it of sale.items) {
            if (it.productId) {
              // create inventory adjustment positive
              await tx.inventoryAdjustment.create({ data: {
                businessId: business.id,
                productId: it.productId,
                change: it.qty, // qty is decimal string
                reason: `Reversal ${sale.reference}`,
                relatedSaleId: sale.id,
              } })
              // increment product stock
              const prod = await tx.product.findUnique({ where: { id: it.productId } })
              if (prod) {
                const newStock = (Number(prod.stockQuantity) + Number(it.qty)).toString()
                await tx.product.update({ where: { id: prod.id }, data: { stockQuantity: newStock } })
              }
            }
          }

          // Mark sale as refunded/cancelled via note
          const updated = await tx.sale.update({ where: { id: sale.id }, data: { note: (sale.note || '') + ' | CANCELLED', paymentStatus: 'REFUNDED' } })

          await tx.auditLog.create({ data: { businessId: business.id, userId: info.user?.id, action: 'SALE_CANCELLED', metadata: { reference: sale.reference } } })

          return updated
        })

        return res.json(reversed)
      } catch (err: any) {
        console.error(err)
        return res.status(500).json({ error: 'Unable to cancel sale' })
      }
    }
  }

  return res.setHeader('Allow', 'GET, POST').status(405).end('Method Not Allowed')
}
