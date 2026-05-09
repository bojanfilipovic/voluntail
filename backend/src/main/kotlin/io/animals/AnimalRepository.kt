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
    suspend fun listPage(
        filters: AnimalListFilters,
        visibility: AnimalListVisibility,
        limit: Int,
        offset: Int,
        shuffleSeed: String?,
    ): AnimalListPageResponse

    suspend fun count(
        filters: AnimalListFilters,
        visibility: AnimalListVisibility,
    ): Int

    suspend fun sumHeartCount(
        filters: AnimalListFilters,
        visibility: AnimalListVisibility,
    ): Long

    /** Counts per species for rows matching [filters] (species field ignored for grouping). */
    suspend fun speciesFacetCounts(
        filters: AnimalListFilters,
        visibility: AnimalListVisibility,
    ): Map<String, Int>

    suspend fun findById(id: UUID): AnimalResponse?

    suspend fun insert(request: AnimalCreateRequest): AnimalResponse

    suspend fun update(
        id: UUID,
        request: AnimalUpdateRequest,
    ): AnimalResponse?

    suspend fun delete(id: UUID): Boolean

    /** Increment heart_count by 1 for a published animal. Returns new count, or null if not found/unpublished. */
    suspend fun incrementHeartCount(id: UUID): Int?

    /** Decrement heart_count by 1 for a published animal (floored at 0). Returns new count, or null if not found/unpublished. */
    suspend fun decrementHeartCount(id: UUID): Int?
}
