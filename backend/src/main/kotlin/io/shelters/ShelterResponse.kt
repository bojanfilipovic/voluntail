package io.shelters

import kotlinx.serialization.Serializable

/** Public read model for map + directory + detail modal (V1 contract). */
@Serializable
data class ShelterResponse(
    val id: String,
    val name: String,
    val description: String,
    val latitude: Double,
    val longitude: Double,
    val registryTag: RegistryTag,
    val species: List<String>,
    val signupUrl: String?,
    val imageUrl: String?,
    val donationUrl: String?,
)
