package io.shelters

import java.util.UUID

//%% TODO bfilipovic: pass through and review
class InMemoryShelterRepository : ShelterRepository {
    private val lock = Any()
    private val rows = ShelterSamples.all.toMutableList()

    override suspend fun list(): List<ShelterResponse> = synchronized(lock) { rows.toList() }

    override suspend fun insert(request: ShelterCreateRequest): ShelterResponse {
        val created =
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
            )
        synchronized(lock) {
            rows.add(created)
        }
        return created
    }

//    %% TODO bfilipovic: fix
    override suspend fun delete(id: UUID): Boolean {
        synchronized(lock) {
            val idx =
                rows.indexOfFirst { row ->
                    runCatching { UUID.fromString(row.id) }.getOrNull() == id
                }
            if (idx < 0) return false
            rows.removeAt(idx)
            return true
        }
    }
}
