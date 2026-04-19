package io.shelters

import java.util.UUID

interface ShelterRepository {
    suspend fun getAll(): List<ShelterResponse>

    suspend fun insert(request: ShelterCreateRequest): ShelterResponse

    suspend fun delete(id: UUID): Boolean
}
