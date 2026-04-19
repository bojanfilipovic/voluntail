package io.shelters

import kotlinx.serialization.Serializable

@Serializable
data class ShelterCreateRequest(
    val name: String,
    val description: String,
    val latitude: Double,
    val longitude: Double,
    val species: List<ShelterSpecies> = emptyList(),
    val signupUrl: String? = null,
    val imageUrl: String? = null,
    val donationUrl: String? = null,
)
