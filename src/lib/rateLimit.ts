// Simple in-memory rate limiter. Not suitable for multi-instance production.
const LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
const MAX_REQUESTS = 10

type Entry = { count: number; firstRequestAt: number }

const store: Map<string, Entry> = new Map()

export function rateLimit(key: string) {
  const now = Date.now()
  const entry = store.get(key)
  if (!entry) {
    store.set(key, { count: 1, firstRequestAt: now })
    return { ok: true }
  }
  if (now - entry.firstRequestAt > LIMIT_WINDOW_MS) {
    store.set(key, { count: 1, firstRequestAt: now })
    return { ok: true }
  }
  entry.count += 1
  if (entry.count > MAX_REQUESTS) return { ok: false, retryAfter: (entry.firstRequestAt + LIMIT_WINDOW_MS - now) }
  store.set(key, entry)
  return { ok: true }
}
