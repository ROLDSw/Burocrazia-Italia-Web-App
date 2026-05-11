/**
 * Rate limiter con Redis (Upstash) in produzione e fallback in-memory per sviluppo locale.
 * Richiede UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN nelle variabili d'ambiente.
 * Se non presenti, usa la Map in-memory (non condivisa tra istanze — solo per dev).
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export interface RateLimitOptions {
  /** Numero massimo di richieste nel periodo */
  limit: number
  /** Durata della finestra in millisecondi */
  windowMs: number
}

export interface RateLimitResult {
  success: boolean
  /** Richieste rimanenti nel periodo corrente */
  remaining: number
  /** Millisecondi prima del reset */
  resetAfterMs: number
}

// ── Upstash Redis ─────────────────────────────────────────────────────────────

let _redis: Redis | null = null

function getRedis(): Redis | null {
  if (_redis) return _redis
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        '[rate-limit] UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN sono obbligatori in produzione'
      )
    }
    return null
  }
  _redis = Redis.fromEnv()
  return _redis
}

type UpstashDuration = `${number} ${'ms' | 's' | 'm' | 'h' | 'd'}`

function msToUpstash(ms: number): UpstashDuration {
  if (ms < 1_000)       return `${ms} ms`
  if (ms < 60_000)      return `${Math.round(ms / 1_000)} s`
  if (ms < 3_600_000)   return `${Math.round(ms / 60_000)} m`
  return                        `${Math.round(ms / 3_600_000)} h`
}

// Cache istanze Ratelimit per evitare di ricrearle ad ogni richiesta
const _limiterCache = new Map<string, Ratelimit>()

function getLimiter(opts: RateLimitOptions): Ratelimit {
  const cacheKey = `${opts.limit}:${opts.windowMs}`
  if (!_limiterCache.has(cacheKey)) {
    _limiterCache.set(cacheKey, new Ratelimit({
      redis: getRedis()!,
      limiter: Ratelimit.slidingWindow(opts.limit, msToUpstash(opts.windowMs)),
      analytics: true,
    }))
  }
  return _limiterCache.get(cacheKey)!
}

// ── Fallback in-memory (solo sviluppo locale) ─────────────────────────────────

interface InMemoryEntry {
  timestamps: number[]
}

const _store = new Map<string, InMemoryEntry>()
let _lastCleanup = Date.now()

function inMemoryCheck(key: string, opts: RateLimitOptions): RateLimitResult {
  const now = Date.now()
  if (now - _lastCleanup > 60_000) {
    _lastCleanup = now
    for (const [k, entry] of _store.entries()) {
      if (entry.timestamps.length === 0) _store.delete(k)
    }
  }

  const windowStart = now - opts.windowMs
  let entry = _store.get(key)
  if (!entry) {
    entry = { timestamps: [] }
    _store.set(key, entry)
  }

  entry.timestamps = entry.timestamps.filter(ts => ts > windowStart)
  const count = entry.timestamps.length
  const remaining = Math.max(0, opts.limit - count - 1)

  if (count >= opts.limit) {
    return { success: false, remaining: 0, resetAfterMs: entry.timestamps[0] - windowStart }
  }

  entry.timestamps.push(now)
  return { success: true, remaining, resetAfterMs: opts.windowMs }
}

// ── API pubblica ──────────────────────────────────────────────────────────────

export async function checkRateLimit(key: string, opts: RateLimitOptions): Promise<RateLimitResult> {
  if (!getRedis()) {
    return inMemoryCheck(key, opts)
  }

  const { success, remaining, reset } = await getLimiter(opts).limit(key)
  return {
    success,
    remaining,
    resetAfterMs: Math.max(0, reset - Date.now()),
  }
}
