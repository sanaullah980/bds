import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { getBusinessForSession } from '../../../lib/auth'
import { z } from 'zod'

const ProductUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  sku: z.string().optional(),
  description: z.string().optional(),
  purchasePrice: z.string().or(z.number()).optional(),
  sellingPrice: z.string().or(z.number()).optional(),
  stockQuantity: z.string().or(z.number()).optional(),
  minStock: z.string().or(z.number()).optional(),
  unit: z.string().optional(),
  active: z.boolean().optional()
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: { id },
    method,
  } = req
  const info = await getBusinessForSession(req, res)
  if (!info) return res.status(401).json({ error: 'Unauthorized' })
  const { business } = info
  if (!business) return res.status(400).json({ error: 'No business found.' })
  if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Invalid id' })

  // Ensure product belongs to business
  const existing = await prisma.product.findUnique({ where: { id } })
  if (!existing || existing.businessId !== business.id) return res.status(404).json({ error: 'Not found' })

  if (method === 'GET') {
    return res.json(existing)
  }

  if (method === 'PUT') {
    const parse = ProductUpdateSchema.safeParse(req.body)
    if (!parse.success) return res.status(400).json({ error: parse.error.format() })
    const data = parse.data
    const updated = await prisma.product.update({ where: { id }, data: {
      name: data.name ?? existing.name,
      sku: data.sku ?? existing.sku,
      description: data.description ?? existing.description,
      purchasePrice: data.purchasePrice ? data.purchasePrice.toString() : existing.purchasePrice,
      sellingPrice: data.sellingPrice ? data.sellingPrice.toString() : existing.sellingPrice,
      stockQuantity: data.stockQuantity ? data.stockQuantity.toString() : existing.stockQuantity,
      minStock: data.minStock ? data.minStock.toString() : existing.minStock,
      unit: data.unit ?? existing.unit,
      active: data.active ?? existing.active,
    } })
    return res.json(updated)
  }

  if (method === 'DELETE') {
    // Soft-archive: set active = false
    const archived = await prisma.product.update({ where: { id }, data: { active: false } })
    return res.json(archived)
  }

  return res.setHeader('Allow', 'GET, PUT, DELETE').status(405).end('Method Not Allowed')
}
