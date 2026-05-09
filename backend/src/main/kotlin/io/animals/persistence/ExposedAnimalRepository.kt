package io.animals.persistence

import io.animals.AnimalCreateRequest
import io.animals.AnimalListFilters
import io.animals.AnimalListPageResponse
import io.animals.AnimalListVisibility
import io.animals.AnimalRepository
import io.animals.AnimalResponse
import io.animals.AnimalStatus
import io.animals.AnimalUpdateRequest
import io.animals.applyTo
import io.animals.toAnimalResponse
import io.shelters.ShelterSpecies
import io.shelters.persistence.SheltersTable
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.jetbrains.exposed.v1.core.Count
import org.jetbrains.exposed.v1.core.Op
import org.jetbrains.exposed.v1.core.ResultRow
import org.jetbrains.exposed.v1.core.SortOrder
import org.jetbrains.exposed.v1.core.Sum
import org.jetbrains.exposed.v1.core.and
import org.jetbrains.exposed.v1.core.eq
import org.jetbrains.exposed.v1.jdbc.Database
import org.jetbrains.exposed.v1.jdbc.deleteWhere
import org.jetbrains.exposed.v1.jdbc.insert
import org.jetbrains.exposed.v1.jdbc.select
import org.jetbrains.exposed.v1.jdbc.selectAll
import org.jetbrains.exposed.v1.jdbc.transactions.suspendTransaction
import org.jetbrains.exposed.v1.jdbc.update
import java.util.UUID

class ExposedAnimalRepository(
    private val database: Database,
) : AnimalRepository {
    private fun filterOps(
        filters: AnimalListFilters,
        visibility: AnimalListVisibility,
    ): List<Op<Boolean>> {
        val parts = mutableListOf<Op<Boolean>>()
        if (visibility == AnimalListVisibility.Public) {
            parts.add(AnimalsTable.published eq true)
        }
        filters.shelterId?.let { parts.add(AnimalsTable.shelterId eq it) }
        filters.species?.let { parts.add(AnimalsTable.species eq it.name) }
        filters.city?.trim()?.takeIf { it.isNotEmpty() }?.let { c ->
            parts.add(CityEqualsIgnoreCaseOp(AnimalsTable.city, c))
        }
        return parts
    }

    private fun baseQueryWhere(
        filters: AnimalListFilters,
        visibility: AnimalListVisibility,
    ): Op<Boolean>? {
        val parts = filterOps(filters, visibility)
        return when {
            parts.isEmpty() -> null
            parts.size == 1 -> parts.single()
            else -> parts.reduce { a, b -> a and b }
        }
    }

    override suspend fun listPage(
        filters: AnimalListFilters,
        visibility: AnimalListVisibility,
        limit: Int,
        offset: Int,
        shuffleSeed: String?,
    ): AnimalListPageResponse =
        withContext(Dispatchers.IO) {
            suspendTransaction(db = database, readOnly = true) {
                val whereExpr = baseQueryWhere(filters, visibility)
                val total =
                    when (whereExpr) {
                        null -> AnimalsTable.selectAll().count()
                        else -> AnimalsTable.selectAll().where { whereExpr }.count()
                    }.toInt()

                val q =
                    when (whereExpr) {
                        null -> AnimalsTable.selectAll()
                        else -> AnimalsTable.selectAll().where { whereExpr }
                    }
                val seed = shuffleSeed?.trim()?.takeIf { it.isNotEmpty() }
                val ordered =
                    if (seed != null && visibility == AnimalListVisibility.Public) {
                        val md5Expr = Md5SeedConcatAnimalIdExpr(seed, AnimalsTable.id)
                        q.orderBy(md5Expr, SortOrder.ASC).orderBy(AnimalsTable.name, SortOrder.ASC)
                    } else {
                        q.orderBy(AnimalsTable.name, SortOrder.ASC)
                    }
                val items =
                    ordered
                        .limit(limit)
                        .offset(offset.toLong())
                        .map { it.toAnimalResponse() }
                AnimalListPageResponse(
                    items = items,
                    total = total,
                    limit = limit,
                    offset = offset,
                )
            }
        }

    override suspend fun count(
        filters: AnimalListFilters,
        visibility: AnimalListVisibility,
    ): Int =
        withContext(Dispatchers.IO) {
            suspendTransaction(db = database, readOnly = true) {
                val whereExpr = baseQueryWhere(filters, visibility)
                when (whereExpr) {
                    null -> AnimalsTable.selectAll().count()
                    else -> AnimalsTable.selectAll().where { whereExpr }.count()
                }.toInt()
            }
        }

    override suspend fun sumHeartCount(
        filters: AnimalListFilters,
        visibility: AnimalListVisibility,
    ): Long =
        withContext(Dispatchers.IO) {
            suspendTransaction(db = database, readOnly = true) {
                val whereExpr = baseQueryWhere(filters, visibility)
                val sumExpr = Sum(AnimalsTable.heartCount, AnimalsTable.heartCount.columnType)
                val base = AnimalsTable.select(sumExpr)
                val row =
                    when (whereExpr) {
                        null -> base.firstOrNull()
                        else -> base.where { whereExpr }.firstOrNull()
                    }
                (row?.get(sumExpr) as Number?)?.toLong() ?: 0L
            }
        }

    override suspend fun speciesFacetCounts(
        filters: AnimalListFilters,
        visibility: AnimalListVisibility,
    ): Map<String, Int> =
        withContext(Dispatchers.IO) {
            suspendTransaction(db = database, readOnly = true) {
                val facetFilters = filters.copy(species = null)
                val whereExpr = baseQueryWhere(facetFilters, visibility)
                val cnt = Count(AnimalsTable.id, false)
                val base = AnimalsTable.select(AnimalsTable.species, cnt)
                val q =
                    when (whereExpr) {
                        null -> base
                        else -> base.where { whereExpr }
                    }
                q
                    .groupBy(AnimalsTable.species)
                    .associate { row ->
                        row[AnimalsTable.species] to row[cnt].toInt()
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
                    it[AnimalsTable.imageUrls] = request.imageUrls
                    it[AnimalsTable.imageUrl] = null
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
                    it[AnimalsTable.imageUrls] = merged.imageUrls
                    it[AnimalsTable.imageUrl] = null
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

    override suspend fun incrementHeartCount(id: UUID): Int? =
        withContext(Dispatchers.IO) {
            suspendTransaction(db = database, readOnly = false) {
                val row =
                    AnimalsTable
                        .selectAll()
                        .where { (AnimalsTable.id eq id) and (AnimalsTable.published eq true) }
                        .firstOrNull()
                        ?: return@suspendTransaction null
                val next = row[AnimalsTable.heartCount] + 1
                AnimalsTable.update({ (AnimalsTable.id eq id) and (AnimalsTable.published eq true) }) {
                    it[AnimalsTable.heartCount] = next
                }
                next
            }
        }

    override suspend fun decrementHeartCount(id: UUID): Int? =
        withContext(Dispatchers.IO) {
            suspendTransaction(db = database, readOnly = false) {
                val row =
                    AnimalsTable
                        .selectAll()
                        .where { AnimalsTable.id eq id }
                        .firstOrNull()
                        ?: return@suspendTransaction null
                if (!row[AnimalsTable.published]) return@suspendTransaction null
                val current = row[AnimalsTable.heartCount]
                val next = maxOf(0, current - 1)
                AnimalsTable.update({ AnimalsTable.id eq id }) {
                    it[heartCount] = next
                }
                next
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
    val createdAt: java.time.OffsetDateTime = this[AnimalsTable.createdAt]
    val urlsRaw = this[AnimalsTable.imageUrls]
    val legacyUrl = this[AnimalsTable.imageUrl]?.trim()?.takeIf { it.isNotEmpty() }
    val effectiveUrls =
        when {
            urlsRaw.isNotEmpty() -> urlsRaw
            else -> listOfNotNull(legacyUrl)
        }
    return AnimalResponse(
        id = this[AnimalsTable.id].toString(),
        shelterId = this[AnimalsTable.shelterId].toString(),
        city = this[AnimalsTable.city],
        name = this[AnimalsTable.name],
        description = this[AnimalsTable.description],
        species = species,
        status = status,
        published = this[AnimalsTable.published],
        imageUrls = effectiveUrls,
        imageUrl = effectiveUrls.firstOrNull(),
        externalUrl = this[AnimalsTable.externalUrl],
        createdAt = createdAt.toInstant().toString(),
        heartCount = this[AnimalsTable.heartCount],
    )
}
