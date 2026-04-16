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
                name = "De Dierenlinde (voorbeeld)",
                shortDescription = "Honden en katten uit de regio Utrecht.",
                fullDescription =
                    "Klein opvangnetwerk voor honden en konijnen. " +
                        "V1: handmatig beheerd in Supabase; dit object is alleen stub-data voor integratie.",
                imageUrl = "https://placehold.co/600x400?text=DOA+shelter",
                latitude = 52.0907,
                longitude = 5.1214,
                registryTag = RegistryTag.DOA,
                species = listOf("dog", "cat", "rabbit"),
                currentNeeds = listOf("Volunteer dog walkers", "Cat litter", "Transport crates"),
                signupUrl = "https://example.com/signup",
                donationUrl = "https://example.com/donate",
            ),
            ShelterResponse(
                id = "sample-roz-1",
                name = "Reptielenhuis Noord (voorbeeld)",
                shortDescription = "Speciale opvang voor reptielen en amfibieën.",
                fullDescription =
                    "Focus op huisvesting en herplaatsing van reptielen. " +
                        "Stub record voor ROZ-track integratie en kaart-pins.",
                imageUrl = "https://placehold.co/600x400?text=ROZ+shelter",
                latitude = 52.3676,
                longitude = 4.9041,
                registryTag = RegistryTag.ROZ,
                species = listOf("reptile", "amphibian"),
                currentNeeds = listOf("UV lamps", "Terrarium heating", "Frozen feeders"),
                signupUrl = null,
                donationUrl = "https://example.com/reptile-donate",
            ),
        )
}
