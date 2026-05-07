package io.animals

import io.shelters.ShelterSpecies
import java.time.Instant
import java.util.UUID

data class AnimalCreateRequest(
    val shelterId: UUID,
    val city: String,
    val name: String,
    val description: String,
    val species: ShelterSpecies,
    val status: AnimalStatus,
    val published: Boolean,
    val imageUrls: List<String>,
    val externalUrl: String?,
)

fun AnimalCreateRequest.toAnimalResponse(id: UUID): AnimalResponse {
    val urls = normalizeAnimalImageUrls(imageUrls)
    return AnimalResponse(
        id = id.toString(),
        shelterId = shelterId.toString(),
        city = city.trim(),
        name = name.trim(),
        description = description.trim(),
        species = species,
        status = status,
        published = published,
        imageUrls = urls,
        imageUrl = urls.firstOrNull(),
        externalUrl = externalUrl?.trim()?.takeIf { it.isNotEmpty() },
        createdAt = Instant.now().toString(),
        heartCount = 0,
    )
}
