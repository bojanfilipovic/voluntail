package io.voluntail

import io.ktor.http.HttpHeaders
import io.ktor.http.HttpMethod
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.plugins.calllogging.CallLogging
import io.ktor.server.plugins.cors.CORSConfig
import io.ktor.server.plugins.cors.routing.CORS
import io.ktor.server.plugins.defaultheaders.DefaultHeaders
import io.ktor.server.plugins.statuspages.StatusPages
import io.ktor.server.request.path
import io.ktor.server.response.respondText
import org.slf4j.event.Level
import java.net.URI

fun Application.configureHTTP() {
    install(StatusPages) {
        exception<Throwable> { call, cause ->
            logger.error(cause) { "unhandled exception" }
            call.respondText("Internal server error", status = HttpStatusCode.InternalServerError)
        }
    }
    install(CallLogging) {
        level = Level.INFO
        filter { it.request.path() != "/health" }
    }
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

private fun CORSConfig.applyCorsOriginsFromEnv() {
    val raw = System.getenv("CORS_ORIGINS")?.trim().orEmpty()
    when {
        raw.isBlank() -> {
            allowHost("localhost:5173", schemes = listOf("http"))
            allowHost("localhost:4173", schemes = listOf("http"))
        }
        else ->
            raw.split(',').map { it.trim() }.filter { it.isNotEmpty() }.forEach(::applyOneCorsOrigin)
    }
}

private fun CORSConfig.applyOneCorsOrigin(token: String) {
    when {
        token.startsWith("http://") || token.startsWith("https://") ->
            allowOriginFromUri(URI.create(token))
        else ->
            allowHost(token, schemes = listOf("http", "https"))
    }
}

private fun CORSConfig.allowOriginFromUri(uri: URI) {
    val scheme = uri.scheme ?: return
    val hostPart = uri.host ?: return
    val port = uri.port
    val hostWithPort =
        when {
            port == -1 -> hostPart
            else -> "$hostPart:$port"
        }
    allowHost(hostWithPort, schemes = listOf(scheme))
}
