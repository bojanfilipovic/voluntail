package io.shelters.persistence

import io.shelters.ShelterCreateRequest
import io.shelters.ShelterRepository
import io.shelters.ShelterResponse
import io.shelters.ShelterUpdateRequest
import io.shelters.applyTo
import java.util.UUID
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.jetbrains.exposed.v1.core.ResultRow
import org.jetbrains.exposed.v1.core.SortOrder
import org.jetbrains.exposed.v1.core.eq
import org.jetbrains.exposed.v1.jdbc.Database
import org.jetbrains.exposed.v1.jdbc.deleteWhere
import org.jetbrains.exposed.v1.jdbc.insert
import org.jetbrains.exposed.v1.jdbc.selectAll
import org.jetbrains.exposed.v1.jdbc.transactions.suspendTransaction
import org.jetbrains.exposed.v1.jdbc.update
import kotlin.uuid.ExperimentalUuidApi

class ExposedShelterRepository(
    private val database: Database,
) : ShelterRepository {
    @OptIn(ExperimentalUuidApi::class)
    override suspend fun getAll(): List<ShelterResponse> =
        withContext(Dispatchers.IO) {
            suspendTransaction(db = database, readOnly = true) {
                SheltersTable
                    .selectAll()
                    .orderBy(SheltersTable.name, SortOrder.ASC)
                    .map { row -> row.toShelterResponse() }
            }
        }

    @OptIn(ExperimentalUuidApi::class)
    override suspend fun insert(request: ShelterCreateRequest): ShelterResponse =
        withContext(Dispatchers.IO) {
            suspendTransaction(db = database, readOnly = false) {
                val newId = UUID.randomUUID()
                SheltersTable.insert { row ->
                    row[SheltersTable.id] = newId
                    row[name] = request.name.trim()
                    row[description] = request.description.trim()
                    row[latitude] = request.latitude
                    row[longitude] = request.longitude
                    row[species] = request.species
                    row[signupUrl] = request.signupUrl?.trim()?.takeIf { it.isNotEmpty() }
                    row[imageUrl] = request.imageUrl?.trim()?.takeIf { it.isNotEmpty() }
                    row[donationUrl] = request.donationUrl?.trim()?.takeIf { it.isNotEmpty() }
                }

                ShelterResponse(
                    id = newId.toString(),
                    name = request.name.trim(),
                    description = request.description.trim(),
                    latitude = request.latitude,
                    longitude = request.longitude,
                    species = request.species,
                    signupUrl = request.signupUrl?.trim()?.takeIf { it.isNotEmpty() },
                    imageUrl = request.imageUrl?.trim()?.takeIf { it.isNotEmpty() },
                    donationUrl = request.donationUrl?.trim()?.takeIf { it.isNotEmpty() },
                )
            }
        }

    @OptIn(ExperimentalUuidApi::class)
    override suspend fun update(
        id: UUID,
        request: ShelterUpdateRequest,
    ): ShelterResponse? =
        withContext(Dispatchers.IO) {
            suspendTransaction(db = database, readOnly = false) {
                val row =
                    SheltersTable
                        .selectAll()
                        .where { SheltersTable.id eq id }
                        .firstOrNull()
                        ?: return@suspendTransaction null
                val merged = request.applyTo(row.toShelterResponse())
                SheltersTable.update({ SheltersTable.id eq id }) {
                    it[SheltersTable.name] = merged.name
                    it[SheltersTable.description] = merged.description
                    it[SheltersTable.latitude] = merged.latitude
                    it[SheltersTable.longitude] = merged.longitude
                    it[SheltersTable.species] = merged.species
                    it[SheltersTable.signupUrl] = merged.signupUrl
                    it[SheltersTable.imageUrl] = merged.imageUrl
                    it[SheltersTable.donationUrl] = merged.donationUrl
                }
                merged
            }
        }

    @OptIn(ExperimentalUuidApi::class)
    override suspend fun delete(id: UUID): Boolean =
        withContext(Dispatchers.IO) {
            suspendTransaction(db = database, readOnly = false) {
                SheltersTable.deleteWhere { SheltersTable.id eq id } > 0
            }
        }
}

private fun ResultRow.toShelterResponse(): ShelterResponse =
    ShelterResponse(
        id = this[SheltersTable.id].toString(),
        name = this[SheltersTable.name],
        description = this[SheltersTable.description],
        latitude = this[SheltersTable.latitude],
        longitude = this[SheltersTable.longitude],
        species = this[SheltersTable.species],
        signupUrl = this[SheltersTable.signupUrl],
        imageUrl = this[SheltersTable.imageUrl],
        donationUrl = this[SheltersTable.donationUrl],
    )
