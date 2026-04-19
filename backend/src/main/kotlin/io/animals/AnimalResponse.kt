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
    val imageUrl: String?,
    val externalUrl: String?,
)
