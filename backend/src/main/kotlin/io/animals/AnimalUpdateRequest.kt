package io.animals

import io.shelters.ShelterSpecies
import java.util.UUID

data class AnimalUpdateRequest(
    val shelterId: UUID? = null,
    val city: String? = null,
    val name: String? = null,
    val description: String? = null,
    val species: ShelterSpecies? = null,
    val status: AnimalStatus? = null,
    val published: Boolean? = null,
    val imageUrl: String? = null,
    val externalUrl: String? = null,
)

fun AnimalUpdateRequest.isNoOp(): Boolean =
    shelterId == null &&
        city == null &&
        name == null &&
        description == null &&
        species == null &&
        status == null &&
        published == null &&
        imageUrl == null &&
        externalUrl == null

fun AnimalUpdateRequest.applyTo(current: AnimalResponse): AnimalResponse =
    current.copy(
        shelterId = shelterId?.toString() ?: current.shelterId,
        city = city?.trim()?.takeIf { it.isNotEmpty() } ?: current.city,
        name = name?.trim()?.takeIf { it.isNotEmpty() } ?: current.name,
        description = description?.trim() ?: current.description,
        species = species ?: current.species,
        status = status ?: current.status,
        published = published ?: current.published,
        imageUrl =
            when (imageUrl) {
                null -> current.imageUrl
                else -> imageUrl.trim().takeIf { it.isNotEmpty() }
            },
        externalUrl =
            when (externalUrl) {
                null -> current.externalUrl
                else -> externalUrl.trim().takeIf { it.isNotEmpty() }
            },
    )
