package io.animals

import io.shelters.ShelterSpecies
import java.util.UUID

data class AnimalCreateRequest(
    val shelterId: UUID,
    val city: String,
    val name: String,
    val description: String,
    val species: ShelterSpecies,
    val status: AnimalStatus,
    val published: Boolean,
    val imageUrl: String?,
    val externalUrl: String?,
)

fun AnimalCreateRequest.toAnimalResponse(id: UUID): AnimalResponse =
    AnimalResponse(
        id = id.toString(),
        shelterId = shelterId.toString(),
        city = city.trim(),
        name = name.trim(),
        description = description.trim(),
        species = species,
        status = status,
        published = published,
        imageUrl = imageUrl?.trim()?.takeIf { it.isNotEmpty() },
        externalUrl = externalUrl?.trim()?.takeIf { it.isNotEmpty() },
    )
