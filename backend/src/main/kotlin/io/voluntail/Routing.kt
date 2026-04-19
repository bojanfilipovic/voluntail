package io.voluntail

import io.ktor.server.application.Application
import io.ktor.server.response.respond
import io.ktor.server.routing.get
import io.ktor.server.routing.routing
import io.feedback.feedbackRoutes
import io.feedback.peerFeedbackMaxRows
import io.shelters.shelterRoutes

private val serviceInfo =
    ServiceInfo(
        status = "ok",
        service = "voluntail",
        version = "0.0.1",
    )

fun Application.configureRouting() {
    val (shelterRepository, feedbackRepository) = createApplicationRepositories()
    routing {
        get("/") {
            call.respond(serviceInfo)
        }
        get("/health") {
            call.respond(serviceInfo)
        }
        shelterRoutes(shelterRepository)
        feedbackRoutes(feedbackRepository, peerFeedbackMaxRows())
    }
}
