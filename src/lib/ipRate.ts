import { rateLimit } from './rateLimit'
import { NextApiRequest } from 'next'

export function getIP(req: NextApiRequest) {
  // x-forwarded-for may contain multiple IPs
  const forwarded = req.headers['x-forwarded-for'] as string | undefined
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.socket.remoteAddress || 'unknown'
}

export function checkRate(req: NextApiRequest) {
  const ip = getIP(req)
  return rateLimit(ip)
}
