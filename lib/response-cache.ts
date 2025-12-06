/**
 * 💾 RESPONSE CACHE LIBRARY
 * 
 * In-Memory Caching für Service Responses
 */

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  hits: number;
}

export interface CacheConfig {
  ttl: number;              // Time to live in milliseconds
  maxSize?: number;         // Maximum cache entries
  cleanupInterval?: number; // How often to cleanup expired entries (ms)
}

export class ResponseCache<T = any> {
  private cache = new Map<string, CacheEntry<T>>();
  private cleanupTimer?: Timer;
  
  constructor(private config: CacheConfig) {
    // Auto cleanup expired entries
    if (config.cleanupInterval) {
      this.cleanupTimer = setInterval(() => {
        this.cleanup();
      }, config.cleanupInterval);
    }
  }
  
  set(key: string, data: T): void {
    // Enforce max size
    if (this.config.maxSize && this.cache.size >= this.config.maxSize) {
      // Remove oldest entry
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      hits: 0
    });
  }
  
  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Check if expired
    if (Date.now() - entry.timestamp > this.config.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    entry.hits++;
    return entry.data;
  }
  
  has(key: string): boolean {
    return this.get(key) !== null;
  }
  
  delete(key: string): boolean {
    return this.cache.delete(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  cleanup(): void {
    const now = Date.now();
    let removed = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.config.ttl) {
        this.cache.delete(key);
        removed++;
      }
    }
    
    if (removed > 0) {
      console.log(`🧹 Cache cleanup: removed ${removed} expired entries`);
    }
  }
  
  getStats() {
    const entries = Array.from(this.cache.values());
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      ttl: this.config.ttl,
      totalHits: entries.reduce((sum, e) => sum + e.hits, 0),
      avgHits: entries.length > 0 
        ? entries.reduce((sum, e) => sum + e.hits, 0) / entries.length 
        : 0
    };
  }
  
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.clear();
  }
}

/**
 * Helper: Cached fetch wrapper
 */
export async function cachedFetch<T>(
  cache: ResponseCache<T>,
  key: string,
  fetchFn: () => Promise<T>
): Promise<T> {
  // Check cache first
  const cached = cache.get(key);
  if (cached !== null) {
    return cached;
  }
  
  // Fetch and cache
  const data = await fetchFn();
  cache.set(key, data);
  return data;
}

/**
 * Example usage:
 * 
 * const cache = new ResponseCache({
 *   ttl: 60000,        // 1 minute
 *   maxSize: 1000,
 *   cleanupInterval: 300000 // 5 minutes
 * });
 * 
 * const data = await cachedFetch(
 *   cache,
 *   'user:123',
 *   () => fetch('http://localhost:8904/user/123').then(r => r.json())
 * );
 */
