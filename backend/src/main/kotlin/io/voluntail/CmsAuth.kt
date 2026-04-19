package io.voluntail

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.ApplicationCall
import io.ktor.server.response.respondText

suspend fun ApplicationCall.ensureCmsAuthorized(): Boolean {
    val expected = System.getenv("CMS_API_KEY")?.trim().orEmpty()
    val provided = request.headers["X-CMS-Key"]?.trim().orEmpty()
    return when {
        expected.isEmpty() -> {
            respondText(
                "CMS mutations disabled: set CMS_API_KEY on the server",
                status = HttpStatusCode.Forbidden,
            )
            false
        }
        provided != expected -> {
            respondText(
                "Invalid or missing X-CMS-Key header",
                status = HttpStatusCode.Unauthorized,
            )
            false
        }
        else -> true
    }
}
