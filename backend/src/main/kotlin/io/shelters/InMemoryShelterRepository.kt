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
            species = request.species,
            signupUrl = request.signupUrl?.trim()?.takeIf { it.isNotEmpty() },
            imageUrl = request.imageUrl?.trim()?.takeIf { it.isNotEmpty() },
            donationUrl = request.donationUrl?.trim()?.takeIf { it.isNotEmpty() },
        ).also { rows.add(it) }

    override suspend fun update(
        id: UUID,
        request: ShelterUpdateRequest,
    ): ShelterResponse? {
        val idx = rows.indexOfFirst { it.id == id.toString() }
        if (idx < 0) return null
        val cur = rows[idx]
        val merged = request.applyTo(cur)
        rows[idx] = merged
        return merged
    }

    override suspend fun delete(id: UUID): Boolean =
        rows.removeIf { it.id == id.toString() }
}
