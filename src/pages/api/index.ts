import { prisma } from '../../../lib/prisma'
export default async function handler(req, res) {
  return res.json({ ok: true })
}
