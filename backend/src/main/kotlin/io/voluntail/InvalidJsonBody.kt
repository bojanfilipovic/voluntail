package io.voluntail

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.ApplicationCall
import io.ktor.server.response.respondText

internal suspend fun ApplicationCall.respondInvalidJsonBody() {
    respondText("Invalid JSON body", status = HttpStatusCode.BadRequest)
}
