package io.voluntail

import java.util.concurrent.ConcurrentHashMap

/**
 * In-process JSON body cache for hot public GETs (single-instance pilot).
 * Disabled when `PUBLIC_API_CACHE_ENABLED=false`. TTL via `PUBLIC_API_CACHE_TTL_MS` (default 30_000, max 300_000).
 *
 * Cleared on heart/unheart and CMS mutations so listings and aggregates stay correct.
 */
object PublicApiResponseCache {
    private val store = ConcurrentHashMap<String, Cached>()

    private data class Cached(
        val expiresAtEpochMs: Long,
        val body: String,
    )

    fun ttlMs(): Long =
        System
            .getenv("PUBLIC_API_CACHE_TTL_MS")
            ?.trim()
            ?.toLongOrNull()
            ?.coerceIn(1L..300_000L)
            ?: 30_000L

    fun enabled(): Boolean =
        System
            .getenv("PUBLIC_API_CACHE_ENABLED")
            ?.trim()
            ?.lowercase() != "false"

    fun cacheKey(
        label: String,
        uri: String,
    ): String = "$label|$uri"

    fun get(key: String): String? {
        if (!enabled()) return null
        val now = System.currentTimeMillis()
        val c = store[key] ?: return null
        if (c.expiresAtEpochMs <= now) {
            store.remove(key, c)
            return null
        }
        return c.body
    }

    fun put(
        key: String,
        body: String,
    ) {
        if (!enabled()) return
        val ttl = ttlMs()
        val now = System.currentTimeMillis()
        store[key] = Cached(expiresAtEpochMs = now + ttl, body = body)
    }

    fun clear() {
        store.clear()
    }
}
