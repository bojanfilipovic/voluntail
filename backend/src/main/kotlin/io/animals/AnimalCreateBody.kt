package io.animals

import io.shelters.ShelterSpecies
import java.util.UUID
import kotlinx.serialization.Serializable

@Serializable
data class AnimalCreateBody(
    val shelterId: String,
    val name: String,
    val description: String = "",
    val species: String,
    val status: String,
    val published: Boolean = false,
    val imageUrl: String? = null,
    val externalUrl: String? = null,
)

fun AnimalCreateBody.toCreateRequestOrNull(cityFromShelter: String): AnimalCreateRequest? {
    val shelterUuid =
        try {
            UUID.fromString(shelterId.trim())
        } catch (_: IllegalArgumentException) {
            return null
        }
    val speciesEnum = ShelterSpecies.entries.find { it.name == species.trim() } ?: return null
    val statusEnum = AnimalStatus.entries.find { it.name == status.trim() } ?: return null
    return AnimalCreateRequest(
        shelterId = shelterUuid,
        city = cityFromShelter.trim(),
        name = name,
        description = description,
        species = speciesEnum,
        status = statusEnum,
        published = published,
        imageUrl = imageUrl,
        externalUrl = externalUrl,
    )
}
