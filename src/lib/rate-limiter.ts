interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

export function checkRateLimit(identifier: string, limit: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  const entry = store.get(identifier);
  
  if (!entry || now > entry.resetAt) {
    store.set(identifier, { count: 1, resetAt: now + windowMs });
    return true;
  }
  
  if (entry.count >= limit) {
    return false;
  }
  
  entry.count++;
  return true;
}

export function getRemainingRequests(identifier: string, limit: number = 10): number {
  const entry = store.get(identifier);
  if (!entry || Date.now() > entry.resetAt) return limit;
  return Math.max(0, limit - entry.count);
}
