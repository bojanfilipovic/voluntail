package io.voluntail

import io.animals.AnimalListFilters
import io.animals.AnimalListVisibility
import io.animals.AnimalRepository
import io.ktor.server.response.respond
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
            call.respond(
                DirectoryStatsResponse(
                    shelterCount = shelterRepository.count(),
                    animalCount = animalRepository.count(emptyFilters, visibility),
                    heartCountSum = animalRepository.sumHeartCount(emptyFilters, visibility),
                ),
            )
        }
    }
}
