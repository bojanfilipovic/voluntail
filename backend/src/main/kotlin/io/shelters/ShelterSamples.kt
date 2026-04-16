package io.shelters

/**
 * Stand-in until Supabase reads exist. Keeps sample data out of routing
 * so routes stay thin.
 */
object ShelterSamples {
    val all: List<ShelterResponse> =
        listOf(
            ShelterResponse(
                id = "sample-doa-1",
                name = "The Animal Line (sample)",
                description =
                    "Dogs and cats from the Utrecht area. " +
                        "Small foster network for dogs and rabbits. " +
                        "V1: curated manually in Supabase; this row is stub data for API wiring only.",
                latitude = 52.0907,
                longitude = 5.1214,
                registryTag = RegistryTag.DOA,
                species = listOf("dog", "cat", "rabbit"),
                signupUrl = "https://example.com/signup",
            ),
            ShelterResponse(
                id = "sample-roz-1",
                name = "Northern Reptile House (sample)",
                description =
                    "Specialist care for reptiles and amphibians. " +
                        "Focus on housing and rehoming reptiles. " +
                        "Stub record for the ROZ track and map pins.",
                latitude = 52.3676,
                longitude = 4.9041,
                registryTag = RegistryTag.ROZ,
                species = listOf("reptile", "amphibian"),
                signupUrl = null,
            ),
        )
}
