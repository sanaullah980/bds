const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const email = 'demo@shop.test'
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    console.log('Demo user already exists:', existing.email)
    return
  }
  const hashed = await bcrypt.hash('password123', 10)
  const user = await prisma.user.create({ data: { email, name: 'Demo User', password: hashed } })
  const business = await prisma.business.create({ data: { ownerId: user.id, name: 'Demo Shop', ownerName: 'Demo User', currency: process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || 'PKR' } })
  console.log('Created demo user & business:', user.email, business.name)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
