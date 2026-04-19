package io.feedback

import kotlinx.serialization.Serializable

@Serializable
data class SuggestionCreateRequest(
    val message: String,
)
