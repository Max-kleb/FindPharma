// src/utils/cache.js
/**
 * Système de cache local pour améliorer les performances
 */

const CACHE_PREFIX = 'fp_cache_';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Classe de gestion du cache
 */
class CacheManager {
  constructor() {
    this.memoryCache = new Map();
    this.cleanupInterval = null;
    this.startCleanup();
  }

  /**
   * Stocke une valeur dans le cache
   */
  set(key, value, ttl = DEFAULT_TTL) {
    const cacheKey = CACHE_PREFIX + key;
    const expiresAt = Date.now() + ttl;
    
    const cacheEntry = {
      value,
      expiresAt,
      createdAt: Date.now()
    };

    // Cache mémoire (rapide)
    this.memoryCache.set(cacheKey, cacheEntry);

    // Cache localStorage (persistant)
    try {
      localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
    } catch (e) {
      // localStorage plein, nettoyer les anciennes entrées
      this.cleanup();
    }

    return value;
  }

  /**
   * Récupère une valeur du cache
   */
  get(key) {
    const cacheKey = CACHE_PREFIX + key;
    
    // Essayer le cache mémoire d'abord
    if (this.memoryCache.has(cacheKey)) {
      const entry = this.memoryCache.get(cacheKey);
      if (entry.expiresAt > Date.now()) {
        return entry.value;
      }
      this.memoryCache.delete(cacheKey);
    }

    // Sinon essayer localStorage
    try {
      const stored = localStorage.getItem(cacheKey);
      if (stored) {
        const entry = JSON.parse(stored);
        if (entry.expiresAt > Date.now()) {
          // Remettre en cache mémoire
          this.memoryCache.set(cacheKey, entry);
          return entry.value;
        }
        localStorage.removeItem(cacheKey);
      }
    } catch (e) {
      // Erreur de parsing, ignorer
    }

    return null;
  }

  /**
   * Récupère ou crée une entrée de cache
   */
  async getOrSet(key, fetchFn, ttl = DEFAULT_TTL) {
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    const value = await fetchFn();
    return this.set(key, value, ttl);
  }

  /**
   * Invalide une entrée du cache
   */
  invalidate(key) {
    const cacheKey = CACHE_PREFIX + key;
    this.memoryCache.delete(cacheKey);
    localStorage.removeItem(cacheKey);
  }

  /**
   * Invalide toutes les entrées correspondant à un pattern
   */
  invalidatePattern(pattern) {
    const regex = new RegExp(pattern);
    
    // Cache mémoire
    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
      }
    }

    // localStorage
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX) && regex.test(key)) {
        localStorage.removeItem(key);
      }
    }
  }

  /**
   * Vide tout le cache
   */
  clear() {
    this.memoryCache.clear();
    
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    }
  }

  /**
   * Nettoie les entrées expirées
   */
  cleanup() {
    const now = Date.now();
    
    // Cache mémoire
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.expiresAt < now) {
        this.memoryCache.delete(key);
      }
    }

    // localStorage
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        try {
          const entry = JSON.parse(localStorage.getItem(key));
          if (entry.expiresAt < now) {
            localStorage.removeItem(key);
          }
        } catch (e) {
          localStorage.removeItem(key);
        }
      }
    }
  }

  /**
   * Démarre le nettoyage automatique
   */
  startCleanup() {
    if (this.cleanupInterval) return;
    
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 1000); // Toutes les minutes
  }

  /**
   * Arrête le nettoyage automatique
   */
  stopCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Statistiques du cache
   */
  getStats() {
    let memoryCount = 0;
    let storageCount = 0;
    let memorySize = 0;

    for (const entry of this.memoryCache.values()) {
      memoryCount++;
      memorySize += JSON.stringify(entry).length;
    }

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        storageCount++;
      }
    }

    return {
      memoryCount,
      storageCount,
      memorySize: (memorySize / 1024).toFixed(2) + ' KB'
    };
  }
}

// Singleton
const cache = new CacheManager();
export default cache;

// Helper functions
export const cacheGet = (key) => cache.get(key);
export const cacheSet = (key, value, ttl) => cache.set(key, value, ttl);
export const cacheGetOrSet = (key, fetchFn, ttl) => cache.getOrSet(key, fetchFn, ttl);
export const cacheInvalidate = (key) => cache.invalidate(key);
export const cacheClear = () => cache.clear();
