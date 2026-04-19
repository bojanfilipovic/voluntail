package io.shelters

import kotlinx.serialization.Serializable

/** JSON body for POST /api/shelters — species are validated then stored as [ShelterSpecies]. */
@Serializable
data class ShelterCreateBody(
    val name: String,
    val description: String,
    val latitude: Double,
    val longitude: Double,
    val species: List<String> = emptyList(),
    val signupUrl: String? = null,
    val imageUrl: String? = null,
    val donationUrl: String? = null,
    val city: String = "",
)

fun ShelterCreateBody.toCreateRequestOrNull(): ShelterCreateRequest? {
    val resolved = species.toShelterSpeciesListOrNull() ?: return null
    return ShelterCreateRequest(
        name = name,
        description = description,
        latitude = latitude,
        longitude = longitude,
        species = resolved,
        signupUrl = signupUrl,
        imageUrl = imageUrl,
        donationUrl = donationUrl,
        city = city,
    )
}
