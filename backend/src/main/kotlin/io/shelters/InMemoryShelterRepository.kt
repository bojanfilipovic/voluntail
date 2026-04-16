package io.shelters

class InMemoryShelterRepository : ShelterRepository {
    override suspend fun list(): List<ShelterResponse> = ShelterSamples.all
}
