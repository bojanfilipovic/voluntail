package io.shelters

import kotlinx.serialization.Serializable

/** Partial update: only non-null fields apply. Optional URL fields may be sent as `""` to clear. */
@Serializable
data class ShelterUpdateRequest(
    val name: String? = null,
    val description: String? = null,
    val latitude: Double? = null,
    val longitude: Double? = null,
    val species: List<ShelterSpecies>? = null,
    val signupUrl: String? = null,
    val imageUrl: String? = null,
    val donationUrl: String? = null,
)

fun ShelterUpdateRequest.isNoOp(): Boolean =
    name == null &&
        description == null &&
        latitude == null &&
        longitude == null &&
        species == null &&
        signupUrl == null &&
        imageUrl == null &&
        donationUrl == null

/** Applies this patch onto [current]; omitted fields (`null`) keep existing values. */
fun ShelterUpdateRequest.applyTo(current: ShelterResponse): ShelterResponse =
    current.copy(
        name = name?.trim()?.takeIf { it.isNotEmpty() } ?: current.name,
        description =
            description?.trim()?.takeIf { it.isNotEmpty() } ?: current.description,
        latitude = latitude ?: current.latitude,
        longitude = longitude ?: current.longitude,
        species = species ?: current.species,
        signupUrl =
            when (signupUrl) {
                null -> current.signupUrl
                else -> signupUrl.trim().takeIf { it.isNotEmpty() }
            },
        imageUrl =
            when (imageUrl) {
                null -> current.imageUrl
                else -> imageUrl.trim().takeIf { it.isNotEmpty() }
            },
        donationUrl =
            when (donationUrl) {
                null -> current.donationUrl
                else -> donationUrl.trim().takeIf { it.isNotEmpty() }
            },
    )
