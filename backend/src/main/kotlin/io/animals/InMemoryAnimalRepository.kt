package io.animals

import io.shelters.ShelterRepository
import java.util.UUID

class InMemoryAnimalRepository(
    private val shelterRepository: ShelterRepository,
) : AnimalRepository {
    private var rows = AnimalSamples.all.toMutableList()

    override suspend fun list(
        filters: AnimalListFilters,
        visibility: AnimalListVisibility,
    ): List<AnimalResponse> {
        var out =
            rows.filter {
                when (visibility) {
                    AnimalListVisibility.Public -> it.published
                    AnimalListVisibility.Cms -> true
                }
            }
        filters.shelterId?.let { sid ->
            out = out.filter { it.shelterId == sid.toString() }
        }
        filters.species?.let { sp ->
            out = out.filter { it.species == sp }
        }
        filters.city?.trim()?.takeIf { it.isNotEmpty() }?.let { c ->
            out = out.filter { it.city.equals(c, ignoreCase = true) }
        }
        return out.sortedBy { it.name }
    }

    override suspend fun findById(id: UUID): AnimalResponse? =
        rows.firstOrNull { it.id == id.toString() }

    override suspend fun insert(request: AnimalCreateRequest): AnimalResponse {
        val id = UUID.randomUUID()
        return request.toAnimalResponse(id).also { rows.add(it) }
    }

    override suspend fun update(
        id: UUID,
        request: AnimalUpdateRequest,
    ): AnimalResponse? {
        val idx = rows.indexOfFirst { it.id == id.toString() }
        if (idx < 0) return null
        val cur = rows[idx]
        var merged = request.applyTo(cur)
        if (request.shelterId != null) {
            val sh =
                shelterRepository.findById(request.shelterId)
                    ?: return null
            merged = merged.copy(city = sh.city)
        }
        rows[idx] = merged
        return merged
    }

    override suspend fun delete(id: UUID): Boolean =
        rows.removeIf { it.id == id.toString() }
}
