import { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { getBusinessForSession } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'

const CreateProductSchema = z.object({
  name: z.string().min(1),
  sku: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  purchasePrice: z.union([z.string(), z.number()]).transform((v) => Number(v)),
  sellingPrice: z.union([z.string(), z.number()]).transform((v) => Number(v)),
  stockQuantity: z.union([z.string(), z.number()]).optional().transform((v) => v === undefined ? 0 : Number(v)),
  minStock: z.union([z.string(), z.number()]).optional().transform((v) => v === undefined ? 0 : Number(v)),
  unit: z.string().optional(),
  imageUrl: z.string().optional(),
  active: z.boolean().optional(),
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const info = await getBusinessForSession(req, res)
  if (!info) return res.status(401).json({ error: 'Unauthorized' })
  const { business } = info
  if (!business) return res.status(400).json({ error: 'No business found for user' })

  if (req.method === 'GET') {
    const page = Math.max(1, parseInt((req.query.page as string) || '1'))
    const perPage = Math.min(100, Math.max(1, parseInt((req.query.perPage as string) || '50')))
    const q = (req.query.q as string) || ''
    const active = req.query.active === 'true' ? true : req.query.active === 'false' ? false : undefined

    const where: any = { businessId: business.id }
    if (q) where.name = { contains: q, mode: 'insensitive' }
    if (typeof active === 'boolean') where.active = active

    const products = await prisma.product.findMany({ where, skip: (page - 1) * perPage, take: perPage, orderBy: { name: 'asc' } })
    const total = await prisma.product.count({ where })
    return res.json({ data: products, meta: { page, perPage, total } })
  }

  if (req.method === 'POST') {
    const parsed = CreateProductSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.errors })
    const p = parsed.data

    // Prevent duplicate SKU within the same business
    if (p.sku) {
      const exists = await prisma.product.findFirst({ where: { businessId: business.id, sku: p.sku } })
      if (exists) return res.status(409).json({ error: 'SKU already exists' })
    }

    const created = await prisma.product.create({ data: {
      businessId: business.id,
      name: p.name,
      sku: p.sku || null,
      description: p.description || null,
      categoryId: p.categoryId || null,
      purchasePrice: p.purchasePrice,
      sellingPrice: p.sellingPrice,
      stockQuantity: p.stockQuantity || 0,
      minStock: p.minStock || 0,
      unit: p.unit || null,
      imageUrl: p.imageUrl || null,
      active: p.active ?? true,
    } })

    return res.status(201).json({ data: created })
  }

  res.setHeader('Allow', 'GET, POST')
  return res.status(405).end('Method Not Allowed')
}
