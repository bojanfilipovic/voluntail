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
import io.voluntail.AnimalSpeciesFacetsResponse
import io.voluntail.INVALID_LIMIT_OFFSET_MESSAGE
import io.voluntail.MAX_SHUFFLE_SEED_LENGTH
import io.voluntail.ensureCmsAuthorized
import io.voluntail.isCmsAuthorized
import io.voluntail.parseLimitOffset
import io.voluntail.uuidPathParameter
import java.util.UUID

fun Route.animalRoutes(
    shelterRepository: ShelterRepository,
    animalRepository: AnimalRepository,
) {
    route("/api") {
        get("/animals/facets") {
            val filters =
                call.parseAnimalListFilters()
                    ?: return@get
            val visibility =
                if (call.isCmsAuthorized()) {
                    AnimalListVisibility.Cms
                } else {
                    AnimalListVisibility.Public
                }
            val facetFilters = filters.copy(species = null)
            val counts = animalRepository.speciesFacetCounts(facetFilters, visibility)
            call.respond(AnimalSpeciesFacetsResponse(counts = counts))
        }
        get("/animals/{id}") {
            val id = call.uuidPathParameter("id") ?: return@get
            val row =
                animalRepository.findById(id)
                    ?: run {
                        call.respondText("Animal not found", status = HttpStatusCode.NotFound)
                        return@get
                    }
            if (!call.isCmsAuthorized() && !row.published) {
                call.respondText("Animal not found", status = HttpStatusCode.NotFound)
                return@get
            }
            call.respond(row)
        }
        get("/animals") {
            val filters =
                call.parseAnimalListFilters()
                    ?: return@get
            val paging =
                parseLimitOffset(
                    call.request.queryParameters["limit"],
                    call.request.queryParameters["offset"],
                )
                    ?: run {
                        call.respondText(INVALID_LIMIT_OFFSET_MESSAGE, status = HttpStatusCode.BadRequest)
                        return@get
                    }
            val shuffleRaw =
                call.request.queryParameters["shuffleSeed"]
                    ?.trim()
                    .orEmpty()
            if (shuffleRaw.length > MAX_SHUFFLE_SEED_LENGTH) {
                call.respondText(
                    "Invalid shuffleSeed query parameter",
                    status = HttpStatusCode.BadRequest,
                )
                return@get
            }
            val shuffleSeed = shuffleRaw.takeIf { it.isNotEmpty() }
            val visibility =
                if (call.isCmsAuthorized()) {
                    AnimalListVisibility.Cms
                } else {
                    AnimalListVisibility.Public
                }
            val effectiveShuffle =
                if (visibility == AnimalListVisibility.Cms) {
                    null
                } else {
                    shuffleSeed
                }
            val page =
                animalRepository.listPage(
                    filters = filters,
                    visibility = visibility,
                    limit = paging.limit,
                    offset = paging.offset,
                    shuffleSeed = effectiveShuffle,
                )
            call.respond(page)
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
        post("/animals/{id}/heart") {
            val id = call.uuidPathParameter("id") ?: return@post
            val newCount =
                animalRepository.incrementHeartCount(id)
                    ?: run {
                        call.respondText(
                            "Animal not found",
                            status = HttpStatusCode.NotFound,
                        )
                        return@post
                    }
            call.respond(HeartCountResponse(heartCount = newCount))
        }
        post("/animals/{id}/unheart") {
            val id = call.uuidPathParameter("id") ?: return@post
            val newCount =
                animalRepository.decrementHeartCount(id)
                    ?: run {
                        call.respondText(
                            "Animal not found",
                            status = HttpStatusCode.NotFound,
                        )
                        return@post
                    }
            call.respond(HeartCountResponse(heartCount = newCount))
        }
    }
}

/**
 * Parses shared list query params. On validation error responds with 400 and returns null.
 */
private suspend fun io.ktor.server.application.ApplicationCall.parseAnimalListFilters(): AnimalListFilters? {
    val shelterIdRaw = request.queryParameters["shelterId"]
    val shelterUuid =
        shelterIdRaw?.trim()?.takeIf { it.isNotEmpty() }?.let { raw ->
            try {
                UUID.fromString(raw)
            } catch (_: IllegalArgumentException) {
                respondText(
                    "Invalid shelterId query parameter",
                    status = HttpStatusCode.BadRequest,
                )
                return null
            }
        }
    val speciesRaw = request.queryParameters["species"]
    val speciesEnum =
        speciesRaw?.trim()?.takeIf { it.isNotEmpty() }?.let { raw ->
            ShelterSpecies.entries.find { it.name == raw }
                ?: run {
                    respondText(
                        "Invalid species query parameter",
                        status = HttpStatusCode.BadRequest,
                    )
                    return null
                }
        }
    val cityFilter =
        request.queryParameters["city"]
            ?.trim()
            ?.takeIf { it.isNotEmpty() }
    return AnimalListFilters(
        city = cityFilter,
        shelterId = shelterUuid,
        species = speciesEnum,
    )
}

@kotlinx.serialization.Serializable
data class HeartCountResponse(
    val heartCount: Int,
)
