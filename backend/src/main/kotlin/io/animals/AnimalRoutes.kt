package io.animals

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
import io.shelters.ShelterRepository
import io.shelters.ShelterSpecies
import io.voluntail.ensureCmsAuthorized
import io.voluntail.isCmsAuthorized
import io.voluntail.uuidPathParameter
import java.util.UUID

fun Route.animalRoutes(
    shelterRepository: ShelterRepository,
    animalRepository: AnimalRepository,
) {
    route("/api") {
        get("/animals") {
            val shelterIdRaw = call.request.queryParameters["shelterId"]
            val shelterUuid =
                shelterIdRaw?.trim()?.takeIf { it.isNotEmpty() }?.let { raw ->
                    try {
                        UUID.fromString(raw)
                    } catch (_: IllegalArgumentException) {
                        call.respondText(
                            "Invalid shelterId query parameter",
                            status = HttpStatusCode.BadRequest,
                        )
                        return@get
                    }
                }
            val speciesRaw = call.request.queryParameters["species"]
            val speciesEnum =
                speciesRaw?.trim()?.takeIf { it.isNotEmpty() }?.let { raw ->
                    ShelterSpecies.entries.find { it.name == raw }
                        ?: run {
                            call.respondText(
                                "Invalid species query parameter",
                                status = HttpStatusCode.BadRequest,
                            )
                            return@get
                        }
                }
            val cityFilter =
                call.request.queryParameters["city"]?.trim()?.takeIf { it.isNotEmpty() }
            val visibility =
                if (call.isCmsAuthorized()) {
                    AnimalListVisibility.Cms
                } else {
                    AnimalListVisibility.Public
                }
            val filters =
                AnimalListFilters(
                    city = cityFilter,
                    shelterId = shelterUuid,
                    species = speciesEnum,
                )
            call.respond(animalRepository.list(filters, visibility))
        }
        post("/animals") {
            if (!call.ensureCmsAuthorized()) return@post
            val body = call.receive<AnimalCreateBody>()
            val shelterUuid =
                try {
                    UUID.fromString(body.shelterId.trim())
                } catch (_: IllegalArgumentException) {
                    call.respondText(
                        "Invalid shelterId",
                        status = HttpStatusCode.BadRequest,
                    )
                    return@post
                }
            val shelter =
                shelterRepository.findById(shelterUuid)
                    ?: run {
                        call.respondText(
                            "Shelter not found",
                            status = HttpStatusCode.NotFound,
                        )
                        return@post
                    }
            val request =
                body.toCreateRequestOrNull(shelter.city)
                    ?: run {
                        call.respondText(
                            "Invalid animal payload or unknown species/status",
                            status = HttpStatusCode.BadRequest,
                        )
                        return@post
                    }
            if (!isValidAnimalCreate(request)) {
                call.respondText(
                    "Invalid animal payload",
                    status = HttpStatusCode.BadRequest,
                )
                return@post
            }
            val created = animalRepository.insert(request)
            call.respond(HttpStatusCode.Created, created)
        }
        patch("/animals/{id}") {
            if (!call.ensureCmsAuthorized()) return@patch
            val id = call.uuidPathParameter("id") ?: return@patch
            val body = call.receive<AnimalUpdateBody>()
            val request =
                body.toUpdateRequestOrNull()
                    ?: run {
                        call.respondText(
                            "Invalid animal patch or unknown species/status",
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
            if (!isValidAnimalUpdate(request)) {
                call.respondText("Invalid animal patch", status = HttpStatusCode.BadRequest)
                return@patch
            }
            if (request.shelterId != null) {
                shelterRepository.findById(request.shelterId)
                    ?: run {
                        call.respondText(
                            "Shelter not found",
                            status = HttpStatusCode.NotFound,
                        )
                        return@patch
                    }
            }
            val updated =
                animalRepository.update(id, request)
                    ?: run {
                        call.respondText(
                            "Animal not found",
                            status = HttpStatusCode.NotFound,
                        )
                        return@patch
                    }
            call.respond(updated)
        }
        delete("/animals/{id}") {
            if (!call.ensureCmsAuthorized()) return@delete
            val id = call.uuidPathParameter("id") ?: return@delete
            val deleted = animalRepository.delete(id)
            if (!deleted) {
                call.respondText(
                    "Animal not found",
                    status = HttpStatusCode.NotFound,
                )
                return@delete
            }
            call.respond(HttpStatusCode.NoContent)
        }
    }
}
