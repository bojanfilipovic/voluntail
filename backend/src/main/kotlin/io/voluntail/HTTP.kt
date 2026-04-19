package io.voluntail

import io.ktor.http.HttpHeaders
import io.ktor.http.HttpMethod
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.plugins.cors.routing.CORS
import io.ktor.server.plugins.defaultheaders.DefaultHeaders

fun Application.configureHTTP() {
    install(DefaultHeaders) {
        header("X-Engine", "Ktor")
    }
    install(CORS) {
        allowMethod(HttpMethod.Options)
        allowMethod(HttpMethod.Get)
        allowMethod(HttpMethod.Put)
        allowMethod(HttpMethod.Delete)
        allowMethod(HttpMethod.Patch)
        allowMethod(HttpMethod.Post)
        allowHeader(HttpHeaders.Authorization)
        allowHeader(HttpHeaders.ContentType)
        allowHeader("X-CMS-Key")
        applyCorsOriginsFromEnv()
    }
}

private fun io.ktor.server.plugins.cors.CORSConfig.applyCorsOriginsFromEnv() {
    val raw = System.getenv("CORS_ORIGINS")?.trim().orEmpty()
    if (raw.isNotEmpty()) {
        for (token in raw.split(',').map { it.trim() }.filter { it.isNotEmpty() }) {
            applyOneCorsOrigin(token)
        }
    } else {
        allowHost("localhost:5173", schemes = listOf("http"))
        allowHost("localhost:4173", schemes = listOf("http"))
    }
}

private fun io.ktor.server.plugins.cors.CORSConfig.applyOneCorsOrigin(token: String) {
    if (token.startsWith("http://") || token.startsWith("https://")) {
        val uri = java.net.URI.create(token)
        val scheme = uri.scheme ?: return
        val hostPart = uri.host ?: return
        val port = uri.port
        val hostWithPort =
            when {
                port == -1 -> hostPart
                else -> "$hostPart:$port"
            }
        allowHost(hostWithPort, schemes = listOf(scheme))
    } else {
        allowHost(token, schemes = listOf("http", "https"))
    }
}
