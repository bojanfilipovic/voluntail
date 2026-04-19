package io.feedback.persistence

import io.feedback.FeedbackRepository
import io.feedback.SuggestionCreatedResponse
import java.time.OffsetDateTime
import java.time.ZoneOffset
import java.util.UUID
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.jetbrains.exposed.v1.jdbc.Database
import org.jetbrains.exposed.v1.jdbc.insert
import org.jetbrains.exposed.v1.jdbc.selectAll
import org.jetbrains.exposed.v1.jdbc.transactions.suspendTransaction

class ExposedFeedbackRepository(
    private val database: Database,
) : FeedbackRepository {
    override suspend fun count(): Long =
        withContext(Dispatchers.IO) {
            suspendTransaction(db = database, readOnly = true) {
                PeerFeedbackTable.selectAll().count()
            }
        }

    override suspend fun insert(message: String): SuggestionCreatedResponse =
        withContext(Dispatchers.IO) {
            suspendTransaction(db = database, readOnly = false) {
                val newId = UUID.randomUUID()
                val createdAt = OffsetDateTime.now(ZoneOffset.UTC)
                PeerFeedbackTable.insert { row ->
                    row[PeerFeedbackTable.id] = newId
                    row[PeerFeedbackTable.createdAt] = createdAt
                    row[PeerFeedbackTable.message] = message
                }
                SuggestionCreatedResponse(
                    id = newId.toString(),
                    createdAt = createdAt.toInstant().toString(),
                )
            }
        }
}
