package io.shelters

import java.util.UUID

interface ShelterRepository {
    suspend fun list(): List<ShelterResponse>

    suspend fun insert(request: ShelterCreateRequest): ShelterResponse

    /** @return true if a row was deleted */
    suspend fun delete(id: UUID): Boolean
}
