package io.voluntail

import io.ktor.http.ContentType
import io.ktor.server.application.ApplicationCall
import io.ktor.server.response.respond
import io.ktor.server.response.respondText
import kotlinx.serialization.KSerializer

/**
 * When [useJsonBodyCache] is false, responds with the typed value (Ktor content negotiation).
 * When true, serves a JSON string body backed by [PublicApiResponseCache] (same key semantics as before).
 *
 * [internal] + [reified] so this stays in the backend module (callers: `io.animals`, `io.voluntail`) while
 * accessing [voluntailJson] and Ktor's `inline reified respond` without casts.
 */
internal suspend inline fun <reified T : Any> ApplicationCall.respondDtoWithOptionalJsonBodyCache(
    useJsonBodyCache: Boolean,
    cacheLabel: String,
    cacheUriPart: String,
    serializer: KSerializer<T>,
    value: T,
) {
    if (!useJsonBodyCache) {
        respond(value)
        return
    }
    val key = PublicApiResponseCache.cacheKey(cacheLabel, cacheUriPart)
    PublicApiResponseCache.get(key)?.let { body ->
        respondText(body, ContentType.Application.Json)
        return
    }
    val json = voluntailJson.encodeToString(serializer, value)
    PublicApiResponseCache.put(key, json)
    respondText(json, ContentType.Application.Json)
}

/**
 * Full-URI cache for endpoints that always return `application/json` as a pre-encoded body
 * (e.g. explore-deck list). When cache is disabled, [computeJson] runs once.
 */
suspend fun ApplicationCall.respondJsonStringWithOptionalUriCache(
    cacheLabel: String,
    requestUri: String,
    computeJson: suspend () -> String,
) {
    val body =
        if (PublicApiResponseCache.enabled()) {
            val key = PublicApiResponseCache.cacheKey(cacheLabel, requestUri)
            PublicApiResponseCache.get(key)
                ?: computeJson().also { json ->
                    PublicApiResponseCache.put(key, json)
                }
        } else {
            computeJson()
        }
    respondText(body, ContentType.Application.Json)
}
