package io.shelters

import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.routing.route

fun Route.shelterRoutes(repository: ShelterRepository) {
    route("/api") {
        get("/shelters") {
            call.respond(repository.list())
        }
    }
}
