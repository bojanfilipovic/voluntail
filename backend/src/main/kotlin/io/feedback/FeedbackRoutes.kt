package io.feedback

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.ApplicationCall
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.response.respondText
import io.ktor.server.plugins.BadRequestException
import io.ktor.server.routing.Route
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import kotlinx.serialization.SerializationException

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
                } catch (_: SerializationException) {
                    invalidSuggestionBody(call)
                    return@post
                } catch (_: BadRequestException) {
                    invalidSuggestionBody(call)
                    return@post
                }

            when (val outcome = validateSuggestionFields(body)) {
                is SuggestionValidationOutcome.Invalid ->
                    call.respondText(
                        outcome.responseText,
                        status = HttpStatusCode.BadRequest,
                    )
                is SuggestionValidationOutcome.Ok -> {
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
                    val created =
                        try {
                            repo.insert(
                                outcome.message,
                                outcome.contact,
                                outcome.shelterId,
                                outcome.animalId,
                            )
                        } catch (e: BadFeedbackContext) {
                            call.respondText(
                                e.message ?: "Invalid feedback context",
                                status = HttpStatusCode.BadRequest,
                            )
                            return@post
                        }
                    call.respond(HttpStatusCode.Created, created)
                }
            }
        }
    }
}

private suspend fun invalidSuggestionBody(call: ApplicationCall) {
    call.respondText(
        "Invalid JSON body",
        status = HttpStatusCode.BadRequest,
    )
}
