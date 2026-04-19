package io.shelters

import java.util.UUID

class InMemoryShelterRepository : ShelterRepository {
    private var rows = ShelterSamples.all.toMutableList()

    override suspend fun getAll(): List<ShelterResponse> =
        rows

    override suspend fun insert(request: ShelterCreateRequest): ShelterResponse {
        val id = UUID.randomUUID()
        return request.toShelterResponse(id).also { rows.add(it) }
    }

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
