import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/prisma'
import { getBusinessForSession } from '../../lib/auth'
import { z } from 'zod'

const ProductCreateSchema = z.object({
  name: z.string().min(1),
  sku: z.string().optional(),
  description: z.string().optional(),
  purchasePrice: z.string().or(z.number()),
  sellingPrice: z.string().or(z.number()),
  stockQuantity: z.string().or(z.number()).optional(),
  minStock: z.string().or(z.number()).optional(),
  unit: z.string().optional()
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const info = await getBusinessForSession(req, res)
  if (!info) return res.status(401).json({ error: 'Unauthorized' })
  const { business } = info
  if (!business) return res.status(400).json({ error: 'No business found. Create your shop first.' })

  if (req.method === 'GET') {
    const products = await prisma.product.findMany({ where: { businessId: business.id } })
    return res.json(products)
  }

  if (req.method === 'POST') {
    const parse = ProductCreateSchema.safeParse(req.body)
    if (!parse.success) return res.status(400).json({ error: parse.error.format() })
    const data = parse.data
    const created = await prisma.product.create({
      data: {
        businessId: business.id,
        name: data.name,
        sku: data.sku,
        description: data.description,
        purchasePrice: data.purchasePrice.toString(),
        sellingPrice: data.sellingPrice.toString(),
        stockQuantity: data.stockQuantity ? data.stockQuantity.toString() : '0',
        minStock: data.minStock ? data.minStock.toString() : '0',
        unit: data.unit || null,
      }
    })
    return res.status(201).json(created)
  }

  return res.setHeader('Allow', 'GET, POST').status(405).end('Method Not Allowed')
}
