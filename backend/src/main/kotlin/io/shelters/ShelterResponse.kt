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
    val species: List<ShelterSpecies>,
    /** ISO 3166-1 alpha-2 from server-side coordinate bounding regions (no external geocoding). */
    val countryCode: String?,
    val signupUrl: String?,
    val imageUrl: String?,
    val donationUrl: String?,
    val city: String,
)
