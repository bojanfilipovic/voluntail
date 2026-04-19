package io.shelters

import kotlinx.serialization.Serializable

/** JSON body for PATCH /api/shelters/:id — optional species list is validated when present. */
@Serializable
data class ShelterUpdateBody(
    val name: String? = null,
    val description: String? = null,
    val latitude: Double? = null,
    val longitude: Double? = null,
    val species: List<String>? = null,
    val signupUrl: String? = null,
    val imageUrl: String? = null,
    val donationUrl: String? = null,
    val city: String? = null,
)

fun ShelterUpdateBody.toUpdateRequestOrNull(): ShelterUpdateRequest? {
    val speciesResolved =
        species?.let { list ->
            list.toShelterSpeciesListOrNull() ?: return null
        }
    return ShelterUpdateRequest(
        name = name,
        description = description,
        latitude = latitude,
        longitude = longitude,
        species = speciesResolved,
        signupUrl = signupUrl,
        imageUrl = imageUrl,
        donationUrl = donationUrl,
        city = city,
    )
}
