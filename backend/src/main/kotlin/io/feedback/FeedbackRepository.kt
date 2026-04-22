package io.feedback

import java.util.UUID

interface FeedbackRepository {
    suspend fun count(): Long

    suspend fun insert(
        message: String,
        contact: String?,
        shelterId: UUID?,
        animalId: UUID?,
    ): SuggestionCreatedResponse
}
