package io.shelters

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.ApplicationCall
import io.ktor.server.plugins.BadRequestException
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.response.respondText
import io.ktor.server.routing.Route
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import kotlinx.serialization.SerializationException

private const val SHELTER_SUGGESTIONS_FULL_MESSAGE =
    "Thanks — we have enough shelter suggestions for this pilot phase."

fun Route.shelterSuggestionRoutes(
    repository: ShelterSuggestionRepository?,
    maxRows: Int,
) {
    route("/api") {
        post("/shelter-suggestions") {
            val body =
                try {
                    call.receive<ShelterSuggestionCreateRequest>()
                } catch (_: SerializationException) {
                    invalidShelterSuggestionBody(call)
                    return@post
                } catch (_: BadRequestException) {
                    invalidShelterSuggestionBody(call)
                    return@post
                }

            when (val outcome = validateShelterSuggestion(body)) {
                is ShelterSuggestionValidationOutcome.Invalid ->
                    call.respondText(
                        outcome.responseText,
                        status = HttpStatusCode.BadRequest,
                    )
                is ShelterSuggestionValidationOutcome.Ok -> {
                    val repo =
                        repository
                            ?: run {
                                call.respondText(
                                    "Shelter suggestions unavailable: configure DB_URL on the server",
                                    status = HttpStatusCode.ServiceUnavailable,
                                )
                                return@post
                            }
                    if (repo.count() >= maxRows) {
                        call.respondText(
                            SHELTER_SUGGESTIONS_FULL_MESSAGE,
                            status = HttpStatusCode.TooManyRequests,
                        )
                        return@post
                    }
                    val created = repo.insert(outcome.value)
                    call.respond(HttpStatusCode.Created, created)
                }
            }
        }
    }
}

private suspend fun invalidShelterSuggestionBody(call: ApplicationCall) {
    call.respondText(
        "Invalid JSON body",
        status = HttpStatusCode.BadRequest,
    )
}
