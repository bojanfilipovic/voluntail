package io.shelters.persistence

import io.shelters.ShelterRepository
import io.shelters.ShelterResponse
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.builtins.ListSerializer
import kotlinx.serialization.builtins.serializer
import kotlinx.serialization.json.Json
import org.jetbrains.exposed.v1.core.SortOrder
import org.jetbrains.exposed.v1.jdbc.Database
import org.jetbrains.exposed.v1.jdbc.selectAll
import org.jetbrains.exposed.v1.jdbc.transactions.suspendTransaction
import kotlin.uuid.ExperimentalUuidApi

class ExposedShelterRepository(
    private val database: Database,
) : ShelterRepository {
    private val jsonParser = Json { ignoreUnknownKeys = true }

    @OptIn(ExperimentalUuidApi::class)
    override suspend fun list(): List<ShelterResponse> =
        withContext(Dispatchers.IO) {
            suspendTransaction(db = database, readOnly = true) {
                SheltersTable
                    .selectAll()
                    .orderBy(SheltersTable.name, SortOrder.ASC)
                    .map { row ->
                        val speciesJson = row[SheltersTable.species]
                        ShelterResponse(
                            id = row[SheltersTable.id].toString(),
                            name = row[SheltersTable.name],
                            description = row[SheltersTable.description],
                            latitude = row[SheltersTable.latitude],
                            longitude = row[SheltersTable.longitude],
                            registryTag = row[SheltersTable.registryTag],
                            species = parseSpeciesJson(speciesJson),
                            signupUrl = row[SheltersTable.signupUrl],
                        )
                    }
            }
        }

    // TODO bfilipovic: fix properly or remove the species json field
    private fun parseSpeciesJson(json: String?): List<String> =
        when (json.isNullOrBlank()) {
            true -> emptyList()
            else -> jsonParser.decodeFromString(ListSerializer(String.serializer()), json)
        }
}
