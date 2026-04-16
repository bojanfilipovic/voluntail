package io.shelters

import kotlinx.serialization.Serializable

/** Registry / umbrella org the shelter lists with (DOA, ROZ, …). */
@Serializable
enum class RegistryTag {
    DOA,
    ROZ,
}

/** Public read model for map + directory + detail modal (V1 contract). */
@Serializable
data class ShelterResponse(
    val id: String,
    val name: String,
    val shortDescription: String,
    val fullDescription: String,
    val imageUrl: String?,
    val latitude: Double,
    val longitude: Double,
    val registryTag: RegistryTag,
    val species: List<String>,
    val currentNeeds: List<String>,
    val signupUrl: String?,
    val donationUrl: String?,
)
