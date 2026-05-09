package io.shelters

import java.util.UUID

interface ShelterRepository {
    suspend fun count(): Int

    suspend fun listPage(
        limit: Int,
        offset: Int,
    ): ShelterListPageResponse

    /** Full shelter rows for map + modals (same shape as legacy GET /api/shelters). */
    suspend fun listAllForMap(): List<ShelterResponse>

    suspend fun findById(id: UUID): ShelterResponse?

    suspend fun insert(request: ShelterCreateRequest): ShelterResponse

    suspend fun update(
        id: UUID,
        request: ShelterUpdateRequest,
    ): ShelterResponse?

    suspend fun delete(id: UUID): Boolean
}
