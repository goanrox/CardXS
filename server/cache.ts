// Simple in-memory cache with TTL, designed to be easily swappable with Redis or Upstash
interface CacheItem<T> {
  value: T;
  expiry: number;
}

class Cache {
  private store = new Map<string, CacheItem<any>>();

  async get<T>(key: string): Promise<T | null> {
    const item = this.store.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.store.delete(key);
      return null;
    }
    return item.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds: number = 3600): Promise<void> {
    const expiry = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { value, expiry });
  }

  // Helper to normalize input for cache keys
  normalizeKey(prefix: string, input: string): string {
    // Remove extra whitespace, lowercase, remove repeated punctuation
    const normalized = input
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/([!?.])\1+/g, '$1') // Remove repeated punctuation (!!! -> !, ??? -> ?)
      .trim();
    // Simple base64 encode for the cache key (in production, use a hash like SHA-256)
    return `${prefix}:${Buffer.from(normalized).toString('base64')}`;
  }
}

export const cache = new Cache();
