/**
 * Tiny browser cache helper with TTL using localStorage.
 * Designed for client components to render cached data instantly
 * and revalidate in the background.
 */

export interface CachedPayload<T> {
  data: T;
  /** Epoch ms when the entry expires */
  expiresAt: number;
}

/**
 * Read a cached entry from localStorage.
 * Returns undefined if missing or expired.
 */
export function getCachedValue<T>(key: string): T | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return undefined;
    const parsed: CachedPayload<T> = JSON.parse(raw);
    if (!parsed || typeof parsed.expiresAt !== "number") return undefined;
    if (Date.now() > parsed.expiresAt) {
      // Expired – remove to keep storage tidy
      window.localStorage.removeItem(key);
      return undefined;
    }
    return parsed.data;
  } catch {
    return undefined;
  }
}

/**
 * Write a value to localStorage with TTL in milliseconds.
 */
export function setCachedValue<T>(key: string, data: T, ttlMs: number): void {
  if (typeof window === "undefined") return;
  try {
    const payload: CachedPayload<T> = {
      data,
      expiresAt: Date.now() + Math.max(0, ttlMs),
    };
    window.localStorage.setItem(key, JSON.stringify(payload));
  } catch {
    // Ignore storage quota errors silently
  }
}
