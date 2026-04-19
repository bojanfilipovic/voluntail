package io.shelters.persistence

import io.shelters.ShelterCreateRequest
import io.shelters.ShelterRepository
import io.shelters.ShelterResponse
import java.util.UUID
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.jetbrains.exposed.v1.core.SortOrder
import org.jetbrains.exposed.v1.core.eq
import org.jetbrains.exposed.v1.jdbc.Database
import org.jetbrains.exposed.v1.jdbc.deleteWhere
import org.jetbrains.exposed.v1.jdbc.insert
import org.jetbrains.exposed.v1.jdbc.selectAll
import org.jetbrains.exposed.v1.jdbc.transactions.suspendTransaction
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
                    .map { row ->
                        ShelterResponse(
                            id = row[SheltersTable.id].toString(),
                            name = row[SheltersTable.name],
                            description = row[SheltersTable.description],
                            latitude = row[SheltersTable.latitude],
                            longitude = row[SheltersTable.longitude],
                            registryTag = row[SheltersTable.registryTag],
                            species = row[SheltersTable.species],
                            signupUrl = row[SheltersTable.signupUrl],
                            imageUrl = row[SheltersTable.imageUrl],
                            donationUrl = row[SheltersTable.donationUrl],
                        )
                    }
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
                    row[registryTag] = request.registryTag
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
                    registryTag = request.registryTag,
                    species = request.species,
                    signupUrl = request.signupUrl?.trim()?.takeIf { it.isNotEmpty() },
                    imageUrl = request.imageUrl?.trim()?.takeIf { it.isNotEmpty() },
                    donationUrl = request.donationUrl?.trim()?.takeIf { it.isNotEmpty() },
                )
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
