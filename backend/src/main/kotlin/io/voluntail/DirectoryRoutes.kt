package io.voluntail

import io.animals.AnimalListFilters
import io.animals.AnimalListVisibility
import io.animals.AnimalRepository
import io.ktor.http.ContentType
import io.ktor.server.request.uri
import io.ktor.server.response.respond
import io.ktor.server.response.respondText
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.routing.route
import io.shelters.ShelterRepository

fun Route.directoryRoutes(
    shelterRepository: ShelterRepository,
    animalRepository: AnimalRepository,
) {
    route("/api") {
        get("/directory-stats") {
            val visibility =
                if (call.isCmsAuthorized()) {
                    AnimalListVisibility.Cms
                } else {
                    AnimalListVisibility.Public
                }
            val emptyFilters = AnimalListFilters()
            val response =
                DirectoryStatsResponse(
                    shelterCount = shelterRepository.count(),
                    animalCount = animalRepository.count(emptyFilters, visibility),
                    heartCountSum = animalRepository.sumHeartCount(emptyFilters, visibility),
                )
            if (PublicApiResponseCache.enabled()) {
                val cacheKey =
                    PublicApiResponseCache.cacheKey(
                        "directory-stats",
                        "${call.request.uri}|$visibility",
                    )
                PublicApiResponseCache.get(cacheKey)?.let { body ->
                    call.respondText(body, ContentType.Application.Json)
                    return@get
                }
                val json = voluntailJson.encodeToString(DirectoryStatsResponse.serializer(), response)
                PublicApiResponseCache.put(cacheKey, json)
                call.respondText(json, ContentType.Application.Json)
            } else {
                call.respond(response)
            }
        }
    }
}
