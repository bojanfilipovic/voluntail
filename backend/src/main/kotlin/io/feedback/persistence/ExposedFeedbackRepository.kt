package io.feedback.persistence

import io.animals.persistence.AnimalsTable
import io.feedback.BadFeedbackContext
import io.feedback.FeedbackRepository
import io.feedback.SuggestionCreatedResponse
import java.time.OffsetDateTime
import java.time.ZoneOffset
import java.util.UUID
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.jetbrains.exposed.v1.core.eq
import org.jetbrains.exposed.v1.jdbc.Database
import org.jetbrains.exposed.v1.jdbc.insert
import org.jetbrains.exposed.v1.jdbc.selectAll
import org.jetbrains.exposed.v1.jdbc.transactions.suspendTransaction
import org.postgresql.util.PSQLException

class ExposedFeedbackRepository(
    private val database: Database,
) : FeedbackRepository {
    override suspend fun count(): Long =
        withContext(Dispatchers.IO) {
            suspendTransaction(db = database, readOnly = true) {
                PeerFeedbackTable.selectAll().count()
            }
        }

    override suspend fun insert(
        message: String,
        contact: String?,
        shelterId: UUID?,
        animalId: UUID?,
    ): SuggestionCreatedResponse =
        withContext(Dispatchers.IO) {
            suspendTransaction(db = database, readOnly = false) {
                if (shelterId != null && animalId != null) {
                    val row =
                        AnimalsTable
                            .selectAll()
                            .where { AnimalsTable.id eq animalId }
                            .firstOrNull()
                            ?: throw BadFeedbackContext("shelterId and animalId do not refer to a valid pair")
                    if (row[AnimalsTable.shelterId] != shelterId) {
                        throw BadFeedbackContext("shelterId does not match the animal's shelter")
                    }
                }
                val newId = UUID.randomUUID()
                val createdAt = OffsetDateTime.now(ZoneOffset.UTC)
                try {
                    PeerFeedbackTable.insert { row ->
                        row[PeerFeedbackTable.id] = newId
                        row[PeerFeedbackTable.createdAt] = createdAt
                        row[PeerFeedbackTable.message] = message
                        row[PeerFeedbackTable.contact] = contact
                        row[PeerFeedbackTable.shelterId] = shelterId
                        row[PeerFeedbackTable.animalId] = animalId
                    }
                } catch (e: Exception) {
                    val c = e.cause
                    if (c is PSQLException && c.sqlState == "23503") {
                        throw BadFeedbackContext("shelterId or animalId is not a valid reference")
                    }
                    throw e
                }
                SuggestionCreatedResponse(
                    id = newId.toString(),
                    createdAt = createdAt.toInstant().toString(),
                )
            }
        }
}
