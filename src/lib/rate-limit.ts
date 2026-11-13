interface Bucket {
  timestamps: number[];
}

declare global {
  var _ward65RateLimitMap: Map<string, Bucket> | undefined;
}

const store = global._ward65RateLimitMap ?? new Map<string, Bucket>();
global._ward65RateLimitMap = store;

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const cutoff = now - windowMs;
  const bucket = store.get(key) ?? { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((ts) => ts > cutoff);

  if (bucket.timestamps.length >= maxRequests) {
    const oldest = bucket.timestamps[0] ?? now;
    const retryAfterSec = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    store.set(key, bucket);
    return { allowed: false, retryAfterSec };
  }

  bucket.timestamps.push(now);
  store.set(key, bucket);
  return { allowed: true, retryAfterSec: 0 };
}
