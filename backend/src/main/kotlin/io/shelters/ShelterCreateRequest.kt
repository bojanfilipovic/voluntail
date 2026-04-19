package io.shelters

import java.util.UUID
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

fun ShelterCreateRequest.toShelterResponse(id: UUID): ShelterResponse =
    ShelterResponse(
        id = id.toString(),
        name = name.trim(),
        description = description.trim(),
        latitude = latitude,
        longitude = longitude,
        species = species,
        signupUrl = signupUrl.trimmedNonBlank(),
        imageUrl = imageUrl.trimmedNonBlank(),
        donationUrl = donationUrl.trimmedNonBlank(),
    )

internal fun String?.trimmedNonBlank(): String? =
    this?.trim()?.takeIf { it.isNotEmpty() }
