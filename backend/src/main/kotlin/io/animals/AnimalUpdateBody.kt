package io.animals

import io.shelters.ShelterSpecies
import kotlinx.serialization.Serializable

@Serializable
data class AnimalUpdateBody(
    val shelterId: String? = null,
    val city: String? = null,
    val name: String? = null,
    val description: String? = null,
    val species: String? = null,
    val status: String? = null,
    val published: Boolean? = null,
    val imageUrl: String? = null,
    val externalUrl: String? = null,
)

fun AnimalUpdateBody.toUpdateRequestOrNull(): AnimalUpdateRequest? {
    val shelterUuid =
        shelterId?.trim()?.takeIf { it.isNotEmpty() }?.let {
            try {
                java.util.UUID.fromString(it)
            } catch (_: IllegalArgumentException) {
                return null
            }
        }
    val speciesEnum =
        species?.trim()?.takeIf { it.isNotEmpty() }?.let { raw ->
            ShelterSpecies.entries.find { it.name == raw } ?: return null
        }
    val statusEnum =
        status?.trim()?.takeIf { it.isNotEmpty() }?.let { raw ->
            AnimalStatus.entries.find { it.name == raw } ?: return null
        }
    return AnimalUpdateRequest(
        shelterId = shelterUuid,
        city = city,
        name = name,
        description = description,
        species = speciesEnum,
        status = statusEnum,
        published = published,
        imageUrl = imageUrl,
        externalUrl = externalUrl,
    )
}
