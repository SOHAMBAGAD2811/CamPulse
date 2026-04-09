type RateLimitInfo = {
  count: number;
  lastReset: number;
};

const rateLimitMap = new Map<string, RateLimitInfo>();

/**
 * A simple in-memory rate limiter.
 * Note: In a distributed serverless environment (like Vercel), this memory is scoped to the specific function instance.
 * For strict global rate-limiting, consider an external store like Redis (e.g., Upstash) later.
 */
export function checkRateLimit(identifier: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  // First time seeing this identifier
  if (!record) {
    rateLimitMap.set(identifier, { count: 1, lastReset: now });
    return true; // Request allowed
  }

  // If the time window has passed, reset the count
  if (now - record.lastReset > windowMs) {
    rateLimitMap.set(identifier, { count: 1, lastReset: now });
    return true; // Request allowed
  }

  // If they exceeded the limit within the time window
  if (record.count >= limit) return false; // Rate limited (Blocked)

  record.count += 1;
  return true; // Request allowed
}