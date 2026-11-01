import type { NextFunction, Request, Response } from "express";
import {
  RATE_LIMIT_CAPACITY,
  RATE_LIMIT_MAX_BUCKETS,
  RATE_LIMIT_REFILL_PER_MINUTE,
  RATE_LIMIT_WINDOW_MS,
} from "../../shared/constants.ts";

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, TokenBucket>();

function refillBucket(bucket: TokenBucket, now: number): void {
  const elapsed = now - bucket.lastRefill;
  if (elapsed >= RATE_LIMIT_WINDOW_MS) {
    const refillTokens = Math.floor(elapsed / RATE_LIMIT_WINDOW_MS) * RATE_LIMIT_REFILL_PER_MINUTE;
    bucket.tokens = Math.min(RATE_LIMIT_CAPACITY, bucket.tokens + refillTokens);
    bucket.lastRefill = now;
  }
}

function cleanStaleBuckets(now: number): void {
  if (buckets.size <= RATE_LIMIT_MAX_BUCKETS) return;
  const staleThreshold = now - RATE_LIMIT_WINDOW_MS * 10;
  for (const [ip, b] of buckets.entries()) {
    if (b.lastRefill < staleThreshold) {
      buckets.delete(ip);
    }
  }
}

/**
 * Token-bucket rate limiter middleware per IP for AI endpoints.
 */
export function aiRateLimiter(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const ip = req.ip || req.socket.remoteAddress || "127.0.0.1";
  const now = Date.now();

  cleanStaleBuckets(now);

  let bucket = buckets.get(ip);
  if (!bucket) {
    bucket = { tokens: RATE_LIMIT_CAPACITY, lastRefill: now };
    buckets.set(ip, bucket);
  } else {
    refillBucket(bucket, now);
  }

  if (bucket.tokens <= 0) {
    res.status(429).json({
      error: "Rate limit exceeded. Please wait a moment before trying again.",
      code: "RATE_LIMITED",
    });
    return;
  }

  bucket.tokens--;
  next();
}
