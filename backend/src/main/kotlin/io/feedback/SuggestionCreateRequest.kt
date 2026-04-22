package io.feedback

import kotlinx.serialization.Serializable

@Serializable
data class SuggestionCreateRequest(
    val message: String,
    val contact: String? = null,
    val shelterId: String? = null,
    val animalId: String? = null,
)
