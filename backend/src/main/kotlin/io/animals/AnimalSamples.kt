package io.animals

import io.shelters.ShelterSpecies

/** In-memory parity with SQL seed animals when `DB_URL` is unset. */
object AnimalSamples {
    val all: List<AnimalResponse> =
        listOf(
            AnimalResponse(
                id = "b0000001-0001-4001-8001-000000000001",
                shelterId = "a0000001-0001-4001-8001-000000000001",
                city = "Amsterdam",
                name = "Milo",
                description =
                    "Voorbeeld adoptiehond — altijd details bij het asiel zelf checken.",
                species = ShelterSpecies.dog,
                status = AnimalStatus.available,
                published = true,
                imageUrl = "https://picsum.photos/seed/voluntail-animal-milo/400/400",
                externalUrl = null,
            ),
            AnimalResponse(
                id = "b0000002-0002-4002-8002-000000000002",
                shelterId = "a0000001-0001-4001-8001-000000000001",
                city = "Amsterdam",
                name = "Luna",
                description =
                    "Rustige voorbeeld kat — placeholderprofiel voor Voluntail.",
                species = ShelterSpecies.cat,
                status = AnimalStatus.available,
                published = true,
                imageUrl = "https://picsum.photos/seed/voluntail-animal-luna/400/400",
                externalUrl = null,
            ),
            AnimalResponse(
                id = "b0000003-0003-4003-8003-000000000003",
                shelterId = "a0000002-0002-4002-8002-000000000002",
                city = "Zwanenburg",
                name = "Rex",
                description = "Leopardgecko — voorbeeld voor reptielenopvang.",
                species = ShelterSpecies.reptile,
                status = AnimalStatus.available,
                published = true,
                imageUrl = "https://picsum.photos/seed/voluntail-animal-rex/400/400",
                externalUrl = null,
            ),
            AnimalResponse(
                id = "b0000004-0004-4004-8004-000000000004",
                shelterId = "a0000001-0001-4001-8001-000000000001",
                city = "Amsterdam",
                name = "Draft pup",
                description =
                    "Nog niet gepubliceerd — alleen zichtbaar met CMS.",
                species = ShelterSpecies.dog,
                status = AnimalStatus.reserved,
                published = false,
                imageUrl = null,
                externalUrl = null,
            ),
        )
}
