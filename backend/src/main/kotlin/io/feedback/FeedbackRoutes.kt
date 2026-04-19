package io.feedback

import io.ktor.http.HttpStatusCode
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.response.respondText
import io.ktor.server.routing.Route
import io.ktor.server.routing.post
import io.ktor.server.routing.route

const val SUGGESTION_MAX_MESSAGE_LENGTH = 4000
const val SUGGESTION_MAX_CONTACT_LENGTH = 100

fun Route.feedbackRoutes(
    repository: FeedbackRepository?,
    maxRows: Int,
) {
    route("/api") {
        post("/suggestions") {
            val body =
                try {
                    call.receive<SuggestionCreateRequest>()
                } catch (_: Exception) {
                    call.respondText(
                        "Invalid JSON body",
                        status = HttpStatusCode.BadRequest,
                    )
                    return@post
                }

            val trimmed = body.message.trim()
            val contactNormalized =
                body.contact?.trim()?.takeUnless { it.isEmpty() }
            when {
                trimmed.isEmpty() ->
                    call.respondText(
                        "Message is required",
                        status = HttpStatusCode.BadRequest,
                    )
                trimmed.length > SUGGESTION_MAX_MESSAGE_LENGTH ->
                    call.respondText(
                        "Message exceeds maximum length ($SUGGESTION_MAX_MESSAGE_LENGTH characters)",
                        status = HttpStatusCode.BadRequest,
                    )
                contactNormalized != null &&
                    contactNormalized.length > SUGGESTION_MAX_CONTACT_LENGTH ->
                    call.respondText(
                        "Contact exceeds maximum length ($SUGGESTION_MAX_CONTACT_LENGTH characters)",
                        status = HttpStatusCode.BadRequest,
                    )
                else -> {
                    val repo =
                        repository
                            ?: run {
                                call.respondText(
                                    "Feedback storage unavailable: configure DB_URL on the server",
                                    status = HttpStatusCode.ServiceUnavailable,
                                )
                                return@post
                            }
                    if (repo.count() >= maxRows) {
                        call.respondText(
                            "Feedback inbox is full — thanks to everyone who shared input for this pilot.",
                            status = HttpStatusCode.TooManyRequests,
                        )
                        return@post
                    }
                    val created = repo.insert(trimmed, contactNormalized)
                    call.respond(HttpStatusCode.Created, created)
                }
            }
        }
    }
}
