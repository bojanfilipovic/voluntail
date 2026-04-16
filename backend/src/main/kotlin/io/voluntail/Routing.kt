package io.voluntail

import io.ktor.server.application.Application
import io.ktor.server.response.respondText
import io.ktor.server.routing.get
import io.ktor.server.routing.routing
import io.shelters.createShelterRepository
import io.shelters.shelterRoutes

fun Application.configureRouting() {
    val shelterRepository = createShelterRepository()
    routing {
        get("/") {
            call.respondText("Hello World!")
        }
        shelterRoutes(shelterRepository)
    }
}
