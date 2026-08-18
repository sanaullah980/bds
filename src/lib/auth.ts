import { getSession } from 'next-auth/react'
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from './prisma'

export async function getBusinessForSession(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req })
  if (!session || !session.user?.email) return null
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return null
  const business = await prisma.business.findFirst({ where: { ownerId: user.id } })
  return { user, business }
}
