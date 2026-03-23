// Rate limiting utility for login attempts
// Uses localStorage to track attempts per IP/email

interface RateLimitEntry {
  attempts: number;
  resetTime: number;
}

const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_LOGIN_ATTEMPTS = 5; // Max 5 attempts per window

/** Emails exempt from client-side login attempt limits (lowercase). */
const RATE_LIMIT_EXEMPT_EMAILS = new Set([
  'andy@glwmax.com',
  'joseph@avocadoweb.net',
]);

function normalizeId(identifier: string): string {
  return identifier.toLowerCase().trim();
}

export function isRateLimitExempt(identifier: string): boolean {
  return RATE_LIMIT_EXEMPT_EMAILS.has(normalizeId(identifier));
}

/**
 * Check if login attempt should be rate limited
 * @param identifier - Email or IP address
 * @returns true if rate limited, false if allowed
 */
export function isRateLimited(identifier: string): boolean {
  if (typeof window === 'undefined') return false;

  const id = normalizeId(identifier);
  if (isRateLimitExempt(id)) {
    localStorage.removeItem(`rate_limit_${id}`);
    return false;
  }

  const key = `rate_limit_${id}`;
  const stored = localStorage.getItem(key);

  if (!stored) {
    // First attempt, create entry
    const entry: RateLimitEntry = {
      attempts: 1,
      resetTime: Date.now() + RATE_LIMIT_WINDOW,
    };
    localStorage.setItem(key, JSON.stringify(entry));
    return false;
  }

  try {
    const entry: RateLimitEntry = JSON.parse(stored);

    // Check if window has expired
    if (Date.now() > entry.resetTime) {
      // Reset window
      const newEntry: RateLimitEntry = {
        attempts: 1,
        resetTime: Date.now() + RATE_LIMIT_WINDOW,
      };
      localStorage.setItem(key, JSON.stringify(newEntry));
      return false;
    }

    // Check if max attempts reached
    if (entry.attempts >= MAX_LOGIN_ATTEMPTS) {
      return true;
    }

    // Increment attempts
    entry.attempts++;
    localStorage.setItem(key, JSON.stringify(entry));
    return false;
  } catch (error) {
    // If parsing fails, allow attempt but reset
    const entry: RateLimitEntry = {
      attempts: 1,
      resetTime: Date.now() + RATE_LIMIT_WINDOW,
    };
    localStorage.setItem(key, JSON.stringify(entry));
    return false;
  }
}

/**
 * Reset rate limit for successful login
 * @param identifier - Email or IP address
 */
export function resetRateLimit(identifier: string): void {
  if (typeof window === 'undefined') return;
  const key = `rate_limit_${normalizeId(identifier)}`;
  localStorage.removeItem(key);
}

/**
 * Get remaining time until rate limit resets (in seconds)
 * @param identifier - Email or IP address
 * @returns Seconds until reset, or 0 if not rate limited
 */
export function getRateLimitResetTime(identifier: string): number {
  if (typeof window === 'undefined') return 0;

  const id = normalizeId(identifier);
  if (isRateLimitExempt(id)) return 0;

  const key = `rate_limit_${id}`;
  const stored = localStorage.getItem(key);

  if (!stored) return 0;

  try {
    const entry: RateLimitEntry = JSON.parse(stored);
    const remaining = entry.resetTime - Date.now();
    return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
  } catch {
    return 0;
  }
}

