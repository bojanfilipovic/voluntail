package io.shelters

import java.util.UUID

class InMemoryShelterRepository : ShelterRepository {
    private var rows = ShelterSamples.all.toMutableList()

    override suspend fun getAll(): List<ShelterResponse> =
        rows

    override suspend fun insert(request: ShelterCreateRequest): ShelterResponse =
        ShelterResponse(
            id = UUID.randomUUID().toString(),
            name = request.name.trim(),
            description = request.description.trim(),
            latitude = request.latitude,
            longitude = request.longitude,
            registryTag = request.registryTag,
            species = request.species,
            signupUrl = request.signupUrl?.trim()?.takeIf { it.isNotEmpty() },
            imageUrl = request.imageUrl?.trim()?.takeIf { it.isNotEmpty() },
            donationUrl = request.donationUrl?.trim()?.takeIf { it.isNotEmpty() },
        ).also { rows.add(it) }

    override suspend fun delete(id: UUID): Boolean =
        rows.removeIf { it.id == id.toString() }
}
