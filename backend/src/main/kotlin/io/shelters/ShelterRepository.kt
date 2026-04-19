package io.shelters

import java.util.UUID

interface ShelterRepository {
    suspend fun getAll(): List<ShelterResponse>

    suspend fun findById(id: UUID): ShelterResponse?

    suspend fun insert(request: ShelterCreateRequest): ShelterResponse

    suspend fun update(
        id: UUID,
        request: ShelterUpdateRequest,
    ): ShelterResponse?

    suspend fun delete(id: UUID): Boolean
}
