package io.animals.persistence

import io.animals.AnimalCreateRequest
import io.animals.AnimalListFilters
import io.animals.AnimalListVisibility
import io.animals.AnimalRepository
import io.animals.AnimalResponse
import io.animals.AnimalStatus
import io.animals.AnimalUpdateRequest
import io.animals.applyTo
import io.animals.toAnimalResponse
import io.shelters.ShelterSpecies
import io.shelters.persistence.SheltersTable
import java.util.UUID
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.jetbrains.exposed.v1.core.Op
import org.jetbrains.exposed.v1.core.ResultRow
import org.jetbrains.exposed.v1.core.SortOrder
import org.jetbrains.exposed.v1.core.and
import org.jetbrains.exposed.v1.core.eq
import org.jetbrains.exposed.v1.jdbc.Database
import org.jetbrains.exposed.v1.jdbc.deleteWhere
import org.jetbrains.exposed.v1.jdbc.insert
import org.jetbrains.exposed.v1.jdbc.selectAll
import org.jetbrains.exposed.v1.jdbc.transactions.suspendTransaction
import org.jetbrains.exposed.v1.jdbc.update
class ExposedAnimalRepository(
    private val database: Database,
) : AnimalRepository {
    override suspend fun list(
        filters: AnimalListFilters,
        visibility: AnimalListVisibility,
    ): List<AnimalResponse> =
        withContext(Dispatchers.IO) {
            suspendTransaction(db = database, readOnly = true) {
                val parts = mutableListOf<Op<Boolean>>()
                if (visibility == AnimalListVisibility.Public) {
                    parts.add(AnimalsTable.published eq true)
                }
                filters.shelterId?.let { parts.add(AnimalsTable.shelterId eq it) }
                filters.species?.let { parts.add(AnimalsTable.species eq it.name) }
                val baseQuery =
                    when {
                        parts.isEmpty() -> AnimalsTable.selectAll()
                        parts.size == 1 ->
                            AnimalsTable.selectAll().where { parts.single() }
                        else ->
                            AnimalsTable.selectAll().where {
                                parts.reduce { a, b -> a and b }
                            }
                    }
                val cityNeedle = filters.city?.trim()?.takeIf { it.isNotEmpty() }
                baseQuery
                    .orderBy(AnimalsTable.name, SortOrder.ASC)
                    .map { it.toAnimalResponse() }
                    .filter { a ->
                        cityNeedle == null || a.city.equals(cityNeedle, ignoreCase = true)
                    }
            }
        }

    override suspend fun insert(request: AnimalCreateRequest): AnimalResponse =
        withContext(Dispatchers.IO) {
            suspendTransaction(db = database, readOnly = false) {
                val newId = UUID.randomUUID()
                AnimalsTable.insert {
                    it[AnimalsTable.id] = newId
                    it[AnimalsTable.shelterId] = request.shelterId
                    it[AnimalsTable.city] = request.city.trim()
                    it[AnimalsTable.name] = request.name.trim()
                    it[AnimalsTable.description] = request.description.trim()
                    it[AnimalsTable.species] = request.species.name
                    it[AnimalsTable.status] = request.status.name
                    it[AnimalsTable.published] = request.published
                    it[AnimalsTable.imageUrl] = request.imageUrl?.trim()?.takeIf { it.isNotEmpty() }
                    it[AnimalsTable.externalUrl] = request.externalUrl?.trim()?.takeIf { it.isNotEmpty() }
                }
                request.toAnimalResponse(newId)
            }
        }

    override suspend fun findById(id: UUID): AnimalResponse? =
        withContext(Dispatchers.IO) {
            suspendTransaction(db = database, readOnly = true) {
                AnimalsTable
                    .selectAll()
                    .where { AnimalsTable.id eq id }
                    .firstOrNull()
                    ?.toAnimalResponse()
            }
        }

    override suspend fun update(
        id: UUID,
        request: AnimalUpdateRequest,
    ): AnimalResponse? =
        withContext(Dispatchers.IO) {
            suspendTransaction(db = database, readOnly = false) {
                val row =
                    AnimalsTable
                        .selectAll()
                        .where { AnimalsTable.id eq id }
                        .firstOrNull()
                        ?: return@suspendTransaction null
                var merged = request.applyTo(row.toAnimalResponse())
                val newShelterUuid = UUID.fromString(merged.shelterId)
                if (request.shelterId != null) {
                    val shelterCity =
                        SheltersTable
                            .selectAll()
                            .where { SheltersTable.id eq newShelterUuid }
                            .firstOrNull()
                                ?.get(SheltersTable.city)
                            ?: return@suspendTransaction null
                    merged = merged.copy(city = shelterCity)
                }
                AnimalsTable.update({ AnimalsTable.id eq id }) {
                    it[AnimalsTable.shelterId] = UUID.fromString(merged.shelterId)
                    it[AnimalsTable.city] = merged.city
                    it[AnimalsTable.name] = merged.name
                    it[AnimalsTable.description] = merged.description
                    it[AnimalsTable.species] = merged.species.name
                    it[AnimalsTable.status] = merged.status.name
                    it[AnimalsTable.published] = merged.published
                    it[AnimalsTable.imageUrl] = merged.imageUrl
                    it[AnimalsTable.externalUrl] = merged.externalUrl
                }
                merged
            }
        }

    override suspend fun delete(id: UUID): Boolean =
        withContext(Dispatchers.IO) {
            suspendTransaction(db = database, readOnly = false) {
                AnimalsTable.deleteWhere { AnimalsTable.id eq id } > 0
            }
        }
}

private fun ResultRow.toAnimalResponse(): AnimalResponse {
    val speciesName = this[AnimalsTable.species]
    val species =
        ShelterSpecies.entries.find { it.name == speciesName }
            ?: error("unknown species in animals row: $speciesName")
    val statusName = this[AnimalsTable.status]
    val status =
        AnimalStatus.entries.find { it.name == statusName }
            ?: error("unknown status in animals row: $statusName")
    return AnimalResponse(
        id = this[AnimalsTable.id].toString(),
        shelterId = this[AnimalsTable.shelterId].toString(),
        city = this[AnimalsTable.city],
        name = this[AnimalsTable.name],
        description = this[AnimalsTable.description],
        species = species,
        status = status,
        published = this[AnimalsTable.published],
        imageUrl = this[AnimalsTable.imageUrl],
        externalUrl = this[AnimalsTable.externalUrl],
    )
}
