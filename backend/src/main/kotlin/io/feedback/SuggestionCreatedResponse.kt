package io.feedback

import kotlinx.serialization.Serializable

@Serializable
data class SuggestionCreatedResponse(
    val id: String,
    val createdAt: String,
)
