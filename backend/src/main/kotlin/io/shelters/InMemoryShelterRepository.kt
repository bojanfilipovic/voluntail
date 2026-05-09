package io.shelters

import java.util.UUID

class InMemoryShelterRepository : ShelterRepository {
    private var rows = ShelterSamples.all.toMutableList()

    private fun sorted(): List<ShelterResponse> = rows.sortedBy { it.name }

    override suspend fun count(): Int = rows.size

    override suspend fun listPage(
        limit: Int,
        offset: Int,
    ): ShelterListPageResponse {
        val all = sorted()
        val total = all.size
        return ShelterListPageResponse(
            items = all.drop(offset).take(limit),
            total = total,
            limit = limit,
            offset = offset,
        )
    }

    override suspend fun listAllForMap(): List<ShelterResponse> = sorted()

    override suspend fun findById(id: UUID): ShelterResponse? = rows.firstOrNull { it.id == id.toString() }

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

    override suspend fun delete(id: UUID): Boolean = rows.removeIf { it.id == id.toString() }
}
