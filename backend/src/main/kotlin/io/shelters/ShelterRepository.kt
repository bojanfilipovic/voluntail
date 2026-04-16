package io.shelters

interface ShelterRepository {
    suspend fun list(): List<ShelterResponse>
}
