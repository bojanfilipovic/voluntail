package io.feedback

interface FeedbackRepository {
    suspend fun count(): Long

    suspend fun insert(
        message: String,
        contact: String?,
    ): SuggestionCreatedResponse
}
