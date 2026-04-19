package io.shelters

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.ApplicationCall
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.response.respondText
import io.ktor.server.routing.Route
import io.ktor.server.routing.delete
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import java.util.UUID
import kotlin.math.abs

fun Route.shelterRoutes(repository: ShelterRepository) {
    route("/api") {
        get("/shelters") {
            call.respond(repository.getAll())
        }
        post("/shelters") {
            if (!call.ensureCmsAuthorized()) return@post
            val body = call.receive<ShelterCreateRequest>()
            if (!isValidCreate(body)) {
                call.respondText("Invalid shelter payload", status = HttpStatusCode.BadRequest)
                return@post
            }
            val created = repository.insert(body)
            call.respond(HttpStatusCode.Created, created)
        }
        delete("/shelters/{id}") {
            if (!call.ensureCmsAuthorized()) return@delete
            val id =
                try {
                    UUID.fromString(call.parameters["id"] ?: "")
                } catch (_: IllegalArgumentException) {
                    call.respondText("Invalid id", status = HttpStatusCode.BadRequest)
                    return@delete
                }
            val deleted = repository.delete(id)
            if (!deleted) {
                call.respondText("Shelter not found", status = HttpStatusCode.NotFound)
                return@delete
            }
            call.respond(HttpStatusCode.NoContent)
        }
    }
}

private suspend fun ApplicationCall.ensureCmsAuthorized(): Boolean {
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

private fun isValidCreate(req: ShelterCreateRequest): Boolean =
    when {
        req.name.isBlank() -> false
        (!req.latitude.isFinite() || !req.longitude.isFinite()) -> false
        (abs(req.latitude) > 90.0 || abs(req.longitude) > 180.0) -> false
        else -> true
    }