package io.shelters

import io.feedback.SuggestionCreatedResponse

interface ShelterSuggestionRepository {
    suspend fun count(): Long

    suspend fun insert(row: ShelterSuggestionInsert): SuggestionCreatedResponse
}
