package io.animals

import io.shelters.ShelterRepository
import java.security.MessageDigest
import java.util.UUID

class InMemoryAnimalRepository(
    private val shelterRepository: ShelterRepository,
) : AnimalRepository {
    private val rows = AnimalSamples.all.toMutableList()

    private fun filtered(
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
        return out
    }

    private fun sortedForList(
        filtered: List<AnimalResponse>,
        visibility: AnimalListVisibility,
        shuffleSeed: String?,
    ): List<AnimalResponse> {
        val seed = shuffleSeed?.trim()?.takeIf { it.isNotEmpty() }
        if (seed != null && visibility == AnimalListVisibility.Public) {
            return filtered.sortedWith(
                compareBy({ md5Hex(seed + it.id) }, { it.name }),
            )
        }
        return filtered.sortedBy { it.name }
    }

    override suspend fun listPage(
        filters: AnimalListFilters,
        visibility: AnimalListVisibility,
        limit: Int,
        offset: Int,
        shuffleSeed: String?,
    ): AnimalListPageResponse {
        val all = sortedForList(filtered(filters, visibility), visibility, shuffleSeed)
        val total = all.size
        val slice = all.drop(offset).take(limit)
        return AnimalListPageResponse(
            items = slice,
            total = total,
            limit = limit,
            offset = offset,
        )
    }

    override suspend fun count(
        filters: AnimalListFilters,
        visibility: AnimalListVisibility,
    ): Int = filtered(filters, visibility).size

    override suspend fun sumHeartCount(
        filters: AnimalListFilters,
        visibility: AnimalListVisibility,
    ): Long = filtered(filters, visibility).sumOf { it.heartCount.toLong() }

    override suspend fun speciesFacetCounts(
        filters: AnimalListFilters,
        visibility: AnimalListVisibility,
    ): Map<String, Int> {
        val facetFilters = filters.copy(species = null)
        val base = filtered(facetFilters, visibility)
        return base.groupingBy { it.species.name }.eachCount()
    }

    override suspend fun findById(id: UUID): AnimalResponse? = rows.firstOrNull { it.id == id.toString() }

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

    override suspend fun delete(id: UUID): Boolean = rows.removeIf { it.id == id.toString() }

    override suspend fun incrementHeartCount(id: UUID): Int? {
        val idx = rows.indexOfFirst { it.id == id.toString() && it.published }
        if (idx < 0) return null
        val updated = rows[idx].copy(heartCount = rows[idx].heartCount + 1)
        rows[idx] = updated
        return updated.heartCount
    }

    override suspend fun decrementHeartCount(id: UUID): Int? {
        val idx = rows.indexOfFirst { it.id == id.toString() && it.published }
        if (idx < 0) return null
        val next = maxOf(0, rows[idx].heartCount - 1)
        val updated = rows[idx].copy(heartCount = next)
        rows[idx] = updated
        return updated.heartCount
    }
}

private fun md5Hex(s: String): String {
    val md = MessageDigest.getInstance("MD5")
    val bytes = md.digest(s.toByteArray(Charsets.UTF_8))
    return bytes.joinToString("") { b -> "%02x".format(b) }
}
