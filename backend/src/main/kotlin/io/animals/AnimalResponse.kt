package io.animals

import io.shelters.ShelterSpecies
import kotlinx.serialization.Serializable

@Serializable
data class AnimalResponse(
    val id: String,
    val shelterId: String,
    val city: String,
    val name: String,
    val description: String,
    val species: ShelterSpecies,
    val status: AnimalStatus,
    val published: Boolean,
    /** Ordered gallery URLs (may be empty). */
    val imageUrls: List<String> = emptyList(),
    /**
     * First image URL for older clients; mirrors [imageUrls].firstOrNull().
     */
    val imageUrl: String? = null,
    val externalUrl: String?,
    val createdAt: String,
    val heartCount: Int,
)
