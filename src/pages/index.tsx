import { NextApiRequest, NextApiResponse } from 'next'
import { Prisma } from '@prisma/client'
import { prisma } from '../../../lib/prisma'
import { getBusinessForSession } from '../../../lib/auth'
import { z } from 'zod'
import Decimal from 'decimal.js'

const SaleItemSchema = z.object({
  productId: z.string().uuid().optional(),
  name: z.string().optional(),
  qty: z.union([z.string(), z.number()]).transform((v) => v.toString()),
  cost: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => (v === undefined ? undefined : v.toString())),
  price: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => (v === undefined ? undefined : v.toString())),
})

const SaleCreateSchema = z.object({
  type: z.enum(['NAMED', 'BULK', 'QUICK']),
  date: z.string().optional(),
  customerId: z.string().uuid().optional(),
  items: z.array(SaleItemSchema).optional(),
  totalAmount: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => (v === undefined ? undefined : v.toString())),
  totalCost: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => (v === undefined ? undefined : v.toString())),
  estimatedProfit: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => (v === undefined ? undefined : v.toString())),
  paidAmount: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => (v === undefined ? '0' : v.toString())),
  note: z.string().optional(),
})

function generateReference() {
  return `S-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`
    .toUpperCase()
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const info = await getBusinessForSession(req, res)

  if (!info) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { business } = info

  if (!business) {
    return res.status(400).json({ error: 'No business found for user' })
  }

  if (req.method === 'GET') {
    const page = parseInt((req.query.page as string) || '1')
    const perPage = Math.min(
      parseInt((req.query.perPage as string) || '20'),
      100
    )

    const sales = await prisma.sale.findMany({
      where: { businessId: business.id },
      orderBy: { date: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        items: true,
        customer: true,
      },
    })

    return res.json({ data: sales })
  }

  if (req.method === 'POST') {
    const parse = SaleCreateSchema.safeParse(req.body)

    if (!parse.success) {
      return res.status(400).json({
        error: parse.error.format(),
      })
    }

    const data = parse.data

    if (
      (data.type === 'NAMED' || data.type === 'BULK') &&
      (!data.items || data.items.length === 0)
    ) {
      return res.status(400).json({
        error: 'Items are required for named or bulk sales',
      })
    }

    if (data.type === 'QUICK' && !data.totalAmount) {
      return res.status(400).json({
        error: 'totalAmount is required for quick sales',
      })
    }

    try {
      if (data.type === 'QUICK') {
        const totalAmount = new Decimal(data.totalAmount!)

        let totalCost: Decimal | undefined = data.totalCost
          ? new Decimal(data.totalCost)
          : undefined

        if (!totalCost && data.estimatedProfit) {
          totalCost = totalAmount.minus(
            new Decimal(data.estimatedProfit)
          )
        }

        if (!totalCost) {
          totalCost = new Decimal(0)
        }

        const totalProfit = totalAmount.minus(totalCost)

        const paid = new Decimal(data.paidAmount || '0')

        const paymentStatus = paid.greaterThanOrEqualTo(totalAmount)
          ? 'PAID'
          : paid.equals(0)
            ? 'CREDIT'
            : 'PARTIAL'

        const created = await prisma.$transaction(
          async (tx: Prisma.TransactionClient) => {
            const sale = await tx.sale.create({
              data: {
                businessId: business.id,
                reference: generateReference(),
                date: data.date ? new Date(data.date) : new Date(),
                type: 'QUICK',
                totalAmount: totalAmount.toFixed(2),
                totalCost: totalCost.toFixed(2),
                totalProfit: totalProfit.toFixed(2),
                customerId: data.customerId || null,
                paidAmount: paid.toFixed(2),
                paymentStatus: paymentStatus as any,
                note: data.note || null,
              },
            })

            if (data.customerId) {
              await tx.customerLedgerEntry.create({
                data: {
                  businessId: business.id,
                  customerId: data.customerId,
                  amount: totalAmount.toFixed(2),
                  type: 'PURCHASE',
                  note: `Sale ${sale.reference}`,
                  relatedSaleId: sale.id,
                },
              })

              if (paid.greaterThan(0)) {
                await tx.customerLedgerEntry.create({
                  data: {
                    businessId: business.id,
                    customerId: data.customerId,
                    amount: paid.negated().toFixed(2),
                    type: 'PAYMENT',
                    note: `Payment for ${sale.reference}`,
                    relatedSaleId: sale.id,
                  },
                })
              }
            }

            await tx.auditLog.create({
              data: {
                businessId: business.id,
                userId: info.user?.id,
                action: 'SALE_CREATED',
                metadata: {
                  saleType: 'QUICK',
                  reference: sale.reference,
                },
              },
            })

            return sale
          }
        )

        return res.status(201).json(created)
      }

      const items = data.items!.map((it) => ({ ...it }))

      const productIds = items
        .filter((i) => i.productId)
        .map((i) => i.productId!)

      const products =
        productIds.length > 0
          ? await prisma.product.findMany({
              where: {
                id: { in: productIds },
                businessId: business.id,
              },
            })
          : []

      const productMap: Record<string, any> = {}

      products.forEach((p) => {
        productMap[p.id] = p
      })

      for (const it of items) {
        if (it.productId && !productMap[it.productId]) {
          return res.status(404).json({
            error: `Product ${it.productId} not found or does not belong to your business`,
          })
        }
      }

      let totalAmount = new Decimal(0)
      let totalCost = new Decimal(0)

      const itemRows: any[] = []

      const insufficient: string[] = []

      for (const it of items) {
        const qty = new Decimal(it.qty)

        let costAtSale: Decimal
        let priceAtSale: Decimal

        let name = it.name || 'Unnamed item'

        if (it.productId) {
          const prod = productMap[it.productId]

          name = prod.name

          costAtSale = it.cost
            ? new Decimal(it.cost)
            : new Decimal(prod.purchasePrice as any)

          priceAtSale = it.price
            ? new Decimal(it.price)
            : new Decimal(prod.sellingPrice as any)

          const currentStock = new Decimal(
            prod.stockQuantity as any
          )

          if (
            !business.allowNegativeStock &&
            currentStock.lt(qty)
          ) {
            insufficient.push(
              `${prod.name} (stock ${currentStock.toString()} < ${qty.toString()})`
            )
          }
        } else {
          if (!it.cost || !it.price) {
            return res.status(400).json({
              error: 'Unnamed items require cost and price',
            })
          }

          costAtSale = new Decimal(it.cost)
          priceAtSale = new Decimal(it.price)
        }

        const rowTotalCost = costAtSale.mul(qty)
        const rowTotalPrice = priceAtSale.mul(qty)
        const rowProfit = rowTotalPrice.minus(rowTotalCost)

        totalCost = totalCost.plus(rowTotalCost)
        totalAmount = totalAmount.plus(rowTotalPrice)

        itemRows.push({
          productId: it.productId || null,
          storedName: name,
          qty: qty.toFixed(3),
          costAtSale: costAtSale.toFixed(2),
          priceAtSale: priceAtSale.toFixed(2),
          totalCost: rowTotalCost.toFixed(2),
          totalPrice: rowTotalPrice.toFixed(2),
          profit: rowProfit.toFixed(2),
        })
      }

      if (insufficient.length > 0) {
        return res.status(400).json({
          error:
            'Insufficient stock for: ' +
            insufficient.join(', '),
        })
      }

      const paid = new Decimal(data.paidAmount || '0')

      const paymentStatus = paid.greaterThanOrEqualTo(totalAmount)
        ? 'PAID'
        : paid.equals(0)
          ? 'CREDIT'
          : 'PARTIAL'

      const created = await prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
          const sale = await tx.sale.create({
            data: {
              businessId: business.id,
              reference: generateReference(),
              date: data.date ? new Date(data.date) : new Date(),
              type: data.type === 'NAMED' ? 'NAMED' : 'BULK',
              totalAmount: totalAmount.toFixed(2),
              totalCost: totalCost.toFixed(2),
              totalProfit: totalAmount
                .minus(totalCost)
                .toFixed(2),
              customerId: data.customerId || null,
              paidAmount: paid.toFixed(2),
              paymentStatus: paymentStatus as any,
              note: data.note || null,
            },
          })

          for (const r of itemRows) {
            await tx.saleItem.create({
              data: {
                saleId: sale.id,
                productId: r.productId,
                storedName: r.storedName,
                qty: r.qty,
                costAtSale: r.costAtSale,
                priceAtSale: r.priceAtSale,
                totalCost: r.totalCost,
                totalPrice: r.totalPrice,
                profit: r.profit,
              },
            })

            if (r.productId) {
              await tx.inventoryAdjustment.create({
                data: {
                  businessId: business.id,
                  productId: r.productId,
                  change: new Decimal(r.qty)
                    .negated()
                    .toFixed(3),
                  reason: `Sale ${sale.reference}`,
                  relatedSaleId: sale.id,
                },
              })

              const prod = productMap[r.productId]

              const newStock = new Decimal(
                prod.stockQuantity as any
              ).minus(new Decimal(r.qty))

              await tx.product.update({
                where: { id: r.productId },
                data: {
                  stockQuantity: newStock.toFixed(3),
                },
              })
            }
          }

          if (data.customerId) {
            await tx.customerLedgerEntry.create({
              data: {
                businessId: business.id,
                customerId: data.customerId,
                amount: totalAmount.toFixed(2),
                type: 'PURCHASE',
                note: `Sale ${sale.reference}`,
                relatedSaleId: sale.id,
              },
            })

            if (paid.greaterThan(0)) {
              await tx.customerLedgerEntry.create({
                data: {
                  businessId: business.id,
                  customerId: data.customerId,
                  amount: paid.negated().toFixed(2),
                  type: 'PAYMENT',
                  note: `Payment for ${sale.reference}`,
                  relatedSaleId: sale.id,
                },
              })
            }
          }

          await tx.auditLog.create({
            data: {
              businessId: business.id,
              userId: info.user?.id,
              action: 'SALE_CREATED',
              metadata: {
                saleType: data.type,
                reference: sale.reference,
              },
            },
          })

          return sale
        }
      )

      return res.status(201).json(created)
    } catch (err: any) {
      console.error(err)

      return res.status(500).json({
        error: 'Unable to create sale',
      })
    }
  }

  return res
    .setHeader('Allow', 'GET, POST')
    .status(405)
    .end('Method Not Allowed')
}