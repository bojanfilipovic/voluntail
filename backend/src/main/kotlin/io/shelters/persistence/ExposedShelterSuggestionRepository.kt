package io.shelters.persistence

import io.feedback.SuggestionCreatedResponse
import io.shelters.ShelterSuggestionInsert
import io.shelters.ShelterSuggestionRepository
import io.shelters.ShelterSuggestionStatus
import java.time.OffsetDateTime
import java.time.ZoneOffset
import java.util.UUID
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.jetbrains.exposed.v1.jdbc.Database
import org.jetbrains.exposed.v1.jdbc.insert
import org.jetbrains.exposed.v1.jdbc.selectAll
import org.jetbrains.exposed.v1.jdbc.transactions.suspendTransaction

class ExposedShelterSuggestionRepository(
    private val database: Database,
) : ShelterSuggestionRepository {
    override suspend fun count(): Long =
        withContext(Dispatchers.IO) {
            suspendTransaction(db = database, readOnly = true) {
                ShelterSuggestionsTable.selectAll().count()
            }
        }

    override suspend fun insert(row: ShelterSuggestionInsert): SuggestionCreatedResponse =
        withContext(Dispatchers.IO) {
            suspendTransaction(db = database, readOnly = false) {
                val newId = UUID.randomUUID()
                val createdAt = OffsetDateTime.now(ZoneOffset.UTC)
                ShelterSuggestionsTable.insert { t ->
                    t[ShelterSuggestionsTable.id] = newId
                    t[ShelterSuggestionsTable.createdAt] = createdAt
                    t[ShelterSuggestionsTable.name] = row.name
                    t[ShelterSuggestionsTable.latitude] = row.latitude
                    t[ShelterSuggestionsTable.longitude] = row.longitude
                    t[ShelterSuggestionsTable.description] = row.description
                    t[ShelterSuggestionsTable.city] = row.city
                    t[ShelterSuggestionsTable.speciesNote] = row.speciesNote
                    t[ShelterSuggestionsTable.signupUrl] = row.signupUrl
                    t[ShelterSuggestionsTable.imageUrl] = row.imageUrl
                    t[ShelterSuggestionsTable.donationUrl] = row.donationUrl
                    t[ShelterSuggestionsTable.contact] = row.contact
                    t[ShelterSuggestionsTable.status] = ShelterSuggestionStatus.pending
                }
                SuggestionCreatedResponse(
                    id = newId.toString(),
                    createdAt = createdAt.toInstant().toString(),
                )
            }
        }
}
