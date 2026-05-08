package io.animals

import io.shelters.ShelterSpecies
import kotlinx.serialization.Serializable
import java.util.UUID

@Serializable
data class AnimalCreateBody(
    val shelterId: String,
    val name: String,
    val description: String = "",
    val species: String,
    val status: String,
    val published: Boolean = false,
    val imageUrls: List<String> = emptyList(),
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
    val mergedUrls =
        when {
            imageUrls.isNotEmpty() -> normalizeAnimalImageUrls(imageUrls)
            else ->
                normalizeAnimalImageUrls(
                    listOfNotNull(imageUrl?.trim()?.takeIf { it.isNotEmpty() }),
                )
        }
    return AnimalCreateRequest(
        shelterId = shelterUuid,
        city = cityFromShelter.trim(),
        name = name,
        description = description,
        species = speciesEnum,
        status = statusEnum,
        published = published,
        imageUrls = mergedUrls,
        externalUrl = externalUrl,
    )
}
