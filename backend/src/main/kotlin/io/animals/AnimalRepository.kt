package io.animals

import io.shelters.ShelterSpecies
import java.util.UUID

enum class AnimalListVisibility {
    /** Public discovery: only [AnimalResponse.published]. */
    Public,

    /** CMS list: includes unpublished rows. */
    Cms,
}

data class AnimalListFilters(
    val city: String? = null,
    val shelterId: UUID? = null,
    val species: ShelterSpecies? = null,
)

interface AnimalRepository {
    suspend fun list(
        filters: AnimalListFilters,
        visibility: AnimalListVisibility,
    ): List<AnimalResponse>

    suspend fun findById(id: UUID): AnimalResponse?

    suspend fun insert(request: AnimalCreateRequest): AnimalResponse

    suspend fun update(
        id: UUID,
        request: AnimalUpdateRequest,
    ): AnimalResponse?

    suspend fun delete(id: UUID): Boolean
}
