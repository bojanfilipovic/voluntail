package io.voluntail

import io.ktor.server.application.Application
import io.ktor.server.response.respond
import io.ktor.server.routing.get
import io.ktor.server.routing.routing
import io.animals.animalRoutes
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
    val repos = createApplicationRepositories()
    val persistence = if (System.getenv("DB_URL")?.trim().orEmpty().isNotEmpty()) "postgres" else "in-memory"
    logApplicationStartup(
        persistence = persistence,
        feedbackAvailable = repos.feedbackRepository != null,
    )
    routing {
        get("/") {
            call.respond(serviceInfo)
        }
        get("/health") {
            call.respond(serviceInfo)
        }
        shelterRoutes(repos.shelterRepository)
        animalRoutes(repos.shelterRepository, repos.animalRepository)
        feedbackRoutes(repos.feedbackRepository, peerFeedbackMaxRows())
    }
}
