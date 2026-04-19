package io.voluntail

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.ApplicationCall
import io.ktor.server.response.respondText
import java.util.UUID

/**
 * Parses a path segment as [UUID]. On failure, responds with `400 Invalid id` and returns `null`.
 */
suspend fun ApplicationCall.uuidPathParameter(name: String): UUID? {
    val raw = parameters[name].orEmpty()
    return try {
        UUID.fromString(raw)
    } catch (_: IllegalArgumentException) {
        respondText("Invalid id", status = HttpStatusCode.BadRequest)
        null
    }
}
