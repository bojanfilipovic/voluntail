package io.animals

import io.shelters.ShelterSpecies
import java.time.Instant

/**
 * Small in-memory set when `DB_URL` is unset (local fallback / filter smoke tests).
 * The Supabase seed migration has the full animal directory; keep this list short.
 */
object AnimalSamples {
    private val now = Instant.now().toString()

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
                imageUrls =
                    listOf(
                        "https://picsum.photos/seed/voluntail-ph-dog-milo/400/400",
                        "https://picsum.photos/seed/voluntail-ph-dog-milo-b/400/400",
                    ),
                imageUrl = "https://picsum.photos/seed/voluntail-ph-dog-milo/400/400",
                externalUrl = null,
                createdAt = now,
                heartCount = 0,
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
                imageUrls =
                    listOf(
                        "https://picsum.photos/seed/voluntail-ph-cat-luna/400/400",
                        "https://picsum.photos/seed/voluntail-ph-cat-luna-b/400/400",
                    ),
                imageUrl = "https://picsum.photos/seed/voluntail-ph-cat-luna/400/400",
                externalUrl = null,
                createdAt = now,
                heartCount = 0,
            ),
            AnimalResponse(
                id = "b0000003-0003-4003-8003-000000000003",
                shelterId = "a0000001-0001-4001-8001-000000000001",
                city = "Amsterdam",
                name = "Tonic",
                description = "Konijn — voorbeeld voor filtertests.",
                species = ShelterSpecies.rabbit,
                status = AnimalStatus.available,
                published = true,
                imageUrls =
                    listOf(
                        "https://picsum.photos/seed/voluntail-ph-rabbit-tonic/400/400",
                        "https://picsum.photos/seed/voluntail-ph-rabbit-tonic-b/400/400",
                    ),
                imageUrl = "https://picsum.photos/seed/voluntail-ph-rabbit-tonic/400/400",
                externalUrl = null,
                createdAt = now,
                heartCount = 0,
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
                imageUrls = emptyList(),
                imageUrl = null,
                externalUrl = null,
                createdAt = now,
                heartCount = 0,
            ),
            AnimalResponse(
                id = "b0000005-0005-4005-8005-000000000005",
                shelterId = "a0000002-0002-4002-8002-000000000002",
                city = "Zwanenburg",
                name = "Rex",
                description = "Leopardgecko — voorbeeld voor reptielenopvang.",
                species = ShelterSpecies.reptile,
                status = AnimalStatus.available,
                published = true,
                imageUrls =
                    listOf(
                        "https://picsum.photos/seed/voluntail-ph-reptile-rex/400/400",
                        "https://picsum.photos/seed/voluntail-ph-reptile-rex-b/400/400",
                    ),
                imageUrl = "https://picsum.photos/seed/voluntail-ph-reptile-rex/400/400",
                externalUrl = null,
                createdAt = now,
                heartCount = 0,
            ),
            AnimalResponse(
                id = "b0000006-0006-4006-8006-000000000006",
                shelterId = "a0000002-0002-4002-8002-000000000002",
                city = "Castricum",
                name = "Vogelspin (sling)",
                description = "Voorbeeld arachide — placeholder.",
                species = ShelterSpecies.arachnid,
                status = AnimalStatus.available,
                published = true,
                imageUrls =
                    listOf(
                        "https://picsum.photos/seed/voluntail-ph-arachnid-1677-25-maart-2026-vogelspin-sling-castricum/400/400",
                        "https://picsum.photos/seed/voluntail-ph-arachnid-b/400/400",
                    ),
                imageUrl =
                    "https://picsum.photos/seed/voluntail-ph-arachnid-1677-25-maart-2026-vogelspin-sling-castricum/400/400",
                externalUrl = null,
                createdAt = now,
                heartCount = 0,
            ),
            AnimalResponse(
                id = "b0000007-0007-4007-8007-000000000007",
                shelterId = "a0000002-0002-4002-8002-000000000002",
                city = "Haarlem",
                name = "Salamander",
                description = "Voorbeeld amfibie — placeholder.",
                species = ShelterSpecies.amphibian,
                status = AnimalStatus.available,
                published = true,
                imageUrls =
                    listOf(
                        "https://picsum.photos/seed/voluntail-ph-amphibian-1666-5-maart-2026-salamander-haarlem/400/400",
                        "https://picsum.photos/seed/voluntail-ph-amphibian-b/400/400",
                    ),
                imageUrl =
                    "https://picsum.photos/seed/voluntail-ph-amphibian-1666-5-maart-2026-salamander-haarlem/400/400",
                externalUrl = null,
                createdAt = now,
                heartCount = 0,
            ),
            AnimalResponse(
                id = "b0000008-0008-4008-8008-000000000008",
                shelterId = "a0000004-0004-4004-8004-000000000004",
                city = "Utrecht",
                name = "Sem",
                description = "Voorbeeld hond — placeholder.",
                species = ShelterSpecies.dog,
                status = AnimalStatus.available,
                published = true,
                imageUrls =
                    listOf(
                        "https://picsum.photos/seed/voluntail-utrecht/800/450",
                        "https://picsum.photos/seed/voluntail-utrecht-b/800/450",
                    ),
                imageUrl = "https://picsum.photos/seed/voluntail-utrecht/800/450",
                externalUrl = null,
                createdAt = now,
                heartCount = 0,
            ),
            AnimalResponse(
                id = "b0000009-0009-4009-8009-000000000009",
                shelterId = "a0000005-0005-4005-8005-000000000005",
                city = "Groningen",
                name = "Muis",
                description = "Voorbeeld kat — placeholder.",
                species = ShelterSpecies.cat,
                status = AnimalStatus.available,
                published = true,
                imageUrls =
                    listOf(
                        "https://picsum.photos/seed/voluntail-groningen/800/450",
                        "https://picsum.photos/seed/voluntail-groningen-b/800/450",
                    ),
                imageUrl = "https://picsum.photos/seed/voluntail-groningen/800/450",
                externalUrl = null,
                createdAt = now,
                heartCount = 0,
            ),
            AnimalResponse(
                id = "b000000a-000a-400a-800a-00000000000a",
                shelterId = "a0000003-0003-4003-8003-000000000003",
                city = "Eindhoven",
                name = "Leguaan",
                description = "Voorbeeld reptiel bij ROZE — placeholder.",
                species = ShelterSpecies.reptile,
                status = AnimalStatus.available,
                published = true,
                imageUrls =
                    listOf(
                        "https://picsum.photos/seed/voluntail-eindhoven-roze/800/450",
                        "https://picsum.photos/seed/voluntail-eindhoven-roze-b/800/450",
                    ),
                imageUrl = "https://picsum.photos/seed/voluntail-eindhoven-roze/800/450",
                externalUrl = null,
                createdAt = now,
                heartCount = 0,
            ),
        )
}
