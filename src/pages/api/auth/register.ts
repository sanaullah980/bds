import { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import bcrypt from 'bcryptjs'

const RegisterSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
  shopName: z.string().min(1),
  ownerName: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  category: z.string().optional(),
  currency: z.string().optional(),
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.setHeader('Allow', 'POST').status(405).end('Method Not Allowed')
  const parse = RegisterSchema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error.format() })
  const data = parse.data
  if (data.password !== data.confirmPassword) return res.status(400).json({ error: 'Passwords do not match' })

  // Check duplicate email
  const existing = await prisma.user.findUnique({ where: { email: data.email } })
  if (existing) return res.status(400).json({ error: 'Email already in use' })

  const hashed = await bcrypt.hash(data.password, 10)

  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({ data: { email: data.email, name: data.fullName, password: hashed } })
      const business = await tx.business.create({ data: {
        ownerId: user.id,
        name: data.shopName,
        ownerName: data.ownerName || data.fullName,
        phone: data.phone || null,
        address: data.address || null,
        category: data.category || null,
        currency: data.currency || process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || 'PKR'
      } })
      return { user, business }
    })

    // Don't return password
    // Optionally: create an audit log entry
    await prisma.auditLog.create({ data: { businessId: result.business.id, userId: result.user.id, action: 'ACCOUNT_CREATED', metadata: { message: 'User registered and business created' } } })

    return res.status(201).json({ ok: true })
  } catch (err: any) {
    console.error(err)
    return res.status(500).json({ error: 'Unable to create account' })
  }
}
