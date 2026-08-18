import type { Prisma } from '@prisma/client'
import { prisma } from './prisma'

export async function runTransactionWithRetries<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>, maxRetries = 3): Promise<T> {
  let attempt = 0
  while (true) {
    try {
      return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        return await fn(tx)
      })
    } catch (err: unknown) {
      attempt += 1
      const isTransient = isTransientTxError(err)
      if (!isTransient || attempt >= maxRetries) throw err
      // small backoff
      await new Promise((r) => setTimeout(r, 50 * attempt))
    }
  }
}

function isTransientTxError(err: unknown) {
  // Detect PostgreSQL serialization or deadlock errors
  const e = err as { code?: string; original?: { code?: string } } | undefined
  const code = e?.code || e?.original?.code
  // Postgres serialization_failure = '40001', deadlock_detected = '40P01'
  return code === '40001' || code === '40P01'
}
