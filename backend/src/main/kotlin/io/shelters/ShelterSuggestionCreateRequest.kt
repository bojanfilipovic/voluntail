package io.shelters

import kotlinx.serialization.Serializable

@Serializable
data class ShelterSuggestionCreateRequest(
    val name: String,
    val latitude: Double,
    val longitude: Double,
    val description: String? = null,
    val city: String? = null,
    val speciesNote: String? = null,
    val signupUrl: String? = null,
    val imageUrl: String? = null,
    val donationUrl: String? = null,
    val contact: String? = null,
)
