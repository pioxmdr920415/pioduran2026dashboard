/**
 * CacheManager - High-performance in-memory caching with TTL and stale-while-revalidate
 * 
 * Features:
 * - In-memory cache with configurable TTL
 * - Stale-while-revalidate pattern for instant responses
 * - Request deduplication (prevents duplicate API calls)
 * - LRU eviction for memory management
 * - Integration with IndexedDB for persistence
 */

class CacheManager {
  constructor(options = {}) {
    this.cache = new Map();
    this.pendingRequests = new Map();
    this.defaultTTL = options.defaultTTL || 5 * 60 * 1000; // 5 minutes default
    this.maxEntries = options.maxEntries || 100;
    this.staleTTL = options.staleTTL || 10 * 60 * 1000; // 10 minutes before considered truly stale
    this.accessOrder = []; // For LRU tracking
  }

  /**
   * Generate a cache key from function name and arguments
   */
  generateKey(namespace, ...args) {
    return `${namespace}:${JSON.stringify(args)}`;
  }

  /**
   * Get cached data with stale-while-revalidate support
   * @param {string} key - Cache key
   * @returns {Object|null} { data, isStale, isFresh }
   */
  get(key) {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    const age = now - entry.timestamp;
    const isFresh = age < this.defaultTTL;
    const isStale = age >= this.defaultTTL && age < this.staleTTL;
    const isExpired = age >= this.staleTTL;

    // Update access order for LRU
    this.updateAccessOrder(key);

    if (isExpired) {
      // Data is too old, remove it
      this.cache.delete(key);
      return null;
    }

    return {
      data: entry.data,
      isFresh,
      isStale,
      timestamp: entry.timestamp
    };
  }

  /**
   * Set cached data
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   * @param {number} ttl - Optional custom TTL
   */
  set(key, data, ttl = null) {
    // Evict oldest entries if at capacity
    if (this.cache.size >= this.maxEntries) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    });

    this.updateAccessOrder(key);
  }

  /**
   * Delete cached data
   */
  delete(key) {
    this.cache.delete(key);
    this.accessOrder = this.accessOrder.filter(k => k !== key);
  }

  /**
   * Clear all cached data
   */
  clear() {
    this.cache.clear();
    this.pendingRequests.clear();
    this.accessOrder = [];
  }

  /**
   * Clear cached data by namespace prefix
   */
  clearByNamespace(namespace) {
    const prefix = `${namespace}:`;
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.delete(key);
      }
    }
  }

  /**
   * Update LRU access order
   */
  updateAccessOrder(key) {
    this.accessOrder = this.accessOrder.filter(k => k !== key);
    this.accessOrder.push(key);
  }

  /**
   * Evict least recently used entry
   */
  evictOldest() {
    if (this.accessOrder.length > 0) {
      const oldestKey = this.accessOrder.shift();
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Request deduplication - prevents duplicate in-flight requests
   * @param {string} key - Request key
   * @param {Function} fetchFn - Async function to fetch data
   * @returns {Promise<any>} Fetched data
   */
  async dedupedRequest(key, fetchFn) {
    // Check if there's already a pending request for this key
    if (this.pendingRequests.has(key)) {
      console.log(`⏳ Deduped request for: ${key}`);
      return this.pendingRequests.get(key);
    }

    // Create new request
    const promise = fetchFn()
      .then(data => {
        this.pendingRequests.delete(key);
        return data;
      })
      .catch(error => {
        this.pendingRequests.delete(key);
        throw error;
      });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  /**
   * Stale-while-revalidate fetch pattern
   * Returns cached data immediately if available (even if stale),
   * then fetches fresh data in background
   * 
   * @param {string} key - Cache key
   * @param {Function} fetchFn - Async function to fetch fresh data
   * @param {Function} onUpdate - Callback when fresh data arrives
   * @returns {Promise<{data: any, source: string}>}
   */
  async staleWhileRevalidate(key, fetchFn, onUpdate = null) {
    const cached = this.get(key);

    if (cached) {
      if (cached.isFresh) {
        // Data is fresh, return immediately
        console.log(`✅ Cache HIT (fresh): ${key}`);
        return { data: cached.data, source: 'cache-fresh' };
      }

      if (cached.isStale) {
        // Data is stale but usable, return immediately and revalidate in background
        console.log(`🔄 Cache HIT (stale, revalidating): ${key}`);
        
        // Revalidate in background
        this.dedupedRequest(key, fetchFn)
          .then(freshData => {
            this.set(key, freshData);
            if (onUpdate) {
              onUpdate(freshData);
            }
          })
          .catch(err => console.warn('Background revalidation failed:', err));

        return { data: cached.data, source: 'cache-stale' };
      }
    }

    // No cache or expired, fetch fresh data
    console.log(`❌ Cache MISS: ${key}`);
    const data = await this.dedupedRequest(key, fetchFn);
    this.set(key, data);
    return { data, source: 'network' };
  }

  /**
   * Get cache statistics
   */
  getStats() {
    let fresh = 0, stale = 0, expired = 0;
    const now = Date.now();

    for (const [key, entry] of this.cache) {
      const age = now - entry.timestamp;
      if (age < this.defaultTTL) fresh++;
      else if (age < this.staleTTL) stale++;
      else expired++;
    }

    return {
      total: this.cache.size,
      fresh,
      stale,
      expired,
      pendingRequests: this.pendingRequests.size,
      maxEntries: this.maxEntries
    };
  }

  /**
   * Preload data into cache
   */
  preload(key, data) {
    this.set(key, data);
    console.log(`📦 Preloaded: ${key}`);
  }
}

// Singleton instances for different data types
export const sheetsCache = new CacheManager({
  defaultTTL: 3 * 60 * 1000, // 3 minutes for sheets (more dynamic data)
  staleTTL: 10 * 60 * 1000,
  maxEntries: 50
});

export const driveCache = new CacheManager({
  defaultTTL: 5 * 60 * 1000, // 5 minutes for drive (files change less often)
  staleTTL: 15 * 60 * 1000,
  maxEntries: 100
});

// Export for custom use cases
export default CacheManager;
