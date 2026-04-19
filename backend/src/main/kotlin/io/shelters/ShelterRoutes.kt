package io.shelters

import io.ktor.http.HttpStatusCode
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.response.respondText
import io.ktor.server.routing.Route
import io.ktor.server.routing.delete
import io.ktor.server.routing.get
import io.ktor.server.routing.patch
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import io.voluntail.ensureCmsAuthorized
import io.voluntail.uuidPathParameter

fun Route.shelterRoutes(repository: ShelterRepository) {
    route("/api") {
        get("/shelters") {
            call.respond(repository.getAll())
        }
        post("/shelters") {
            if (!call.ensureCmsAuthorized()) return@post
            val body = call.receive<ShelterCreateBody>()
            val request =
                body.toCreateRequestOrNull()
                    ?: run {
                        call.respondText(
                            "Invalid shelter payload or unknown species",
                            status = HttpStatusCode.BadRequest,
                        )
                        return@post
                    }
            if (!isValidShelterCreate(request)) {
                call.respondText("Invalid shelter payload", status = HttpStatusCode.BadRequest)
                return@post
            }
            val created = repository.insert(request)
            call.respond(HttpStatusCode.Created, created)
        }
        patch("/shelters/{id}") {
            if (!call.ensureCmsAuthorized()) return@patch
            val id = call.uuidPathParameter("id") ?: return@patch
            val body = call.receive<ShelterUpdateBody>()
            val request =
                body.toUpdateRequestOrNull()
                    ?: run {
                        call.respondText(
                            "Invalid shelter patch or unknown species",
                            status = HttpStatusCode.BadRequest,
                        )
                        return@patch
                    }
            if (request.isNoOp()) {
                call.respondText(
                    "No fields to update",
                    status = HttpStatusCode.BadRequest,
                )
                return@patch
            }
            if (!isValidShelterUpdate(request)) {
                call.respondText("Invalid shelter patch", status = HttpStatusCode.BadRequest)
                return@patch
            }
            val updated =
                repository.update(id, request)
                    ?: run {
                        call.respondText(
                            "Shelter not found",
                            status = HttpStatusCode.NotFound,
                        )
                        return@patch
                    }
            call.respond(updated)
        }
        delete("/shelters/{id}") {
            if (!call.ensureCmsAuthorized()) return@delete
            val id = call.uuidPathParameter("id") ?: return@delete
            val deleted = repository.delete(id)
            if (!deleted) {
                call.respondText("Shelter not found", status = HttpStatusCode.NotFound)
                return@delete
            }
            call.respond(HttpStatusCode.NoContent)
        }
    }
}
