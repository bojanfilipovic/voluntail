package io.shelters

/**
 * Small in-memory set when `DB_URL` is unset (local fallback).
 * The Supabase seed migration has the full showcase dataset; keep these lists short.
 */
object ShelterSamples {
    val all: List<ShelterResponse> =
        listOf(
            ShelterResponse(
                id = "a0000001-0001-4001-8001-000000000001",
                name = "DOA dierenasiel",
                description =
                    "Dierenasiel voor honden, katten en konijnen in Nederland. " +
                        "Adoptie en zorg voor dieren die een tweede kans nodig hebben.",
                latitude = 52.3629026,
                longitude = 4.7845807,
                species = listOf(ShelterSpecies.dog, ShelterSpecies.cat, ShelterSpecies.rabbit),
                signupUrl = "https://doa-dierenasiel.nl/over-doa/vacatures/",
                imageUrl = "https://doa-dierenasiel.nl/wp-content/uploads/2022/08/logo-125.svg",
                donationUrl = "https://doa-dierenasiel.nl/doneer/",
                city = "Amsterdam",
            ),
            ShelterResponse(
                id = "a0000002-0002-4002-8002-000000000002",
                name = "Reptielenopvang Zwanenburg",
                description =
                    "Opvang voor reptielen, amfibieën en geleedpotigen sinds 1983. " +
                        "Gelegen tussen Haarlem en Amsterdam.",
                latitude = 52.3794501,
                longitude = 4.7541101,
                species =
                    listOf(
                        ShelterSpecies.reptile,
                        ShelterSpecies.amphibian,
                        ShelterSpecies.arachnid,
                    ),
                signupUrl = "https://reptielenopvang.nl/contact",
                imageUrl =
                    "https://reptileessentials.nl/cdn/shop/files/logo3.jpg?height=200&v=1753111538",
                donationUrl = "https://dierenlot.digicollect.nl/stichting-dierenhulpdienst-nederland",
                city = "Zwanenburg",
            ),
            ShelterResponse(
                id = "a0000003-0003-4003-8003-000000000003",
                name = "Stichting ROZE",
                description =
                    "Regionale Opvang Zwerfdieren Eindhoven: opvang voor de regio Eindhoven en omliggende gemeenten.",
                latitude = 51.4343223,
                longitude = 5.5136765,
                species =
                    listOf(
                        ShelterSpecies.dog,
                        ShelterSpecies.cat,
                        ShelterSpecies.rabbit,
                        ShelterSpecies.reptile,
                    ),
                signupUrl = "https://www.rozeindhoven.nl/contact/",
                imageUrl = "https://picsum.photos/seed/voluntail-eindhoven-roze/800/450",
                donationUrl = "https://www.rozeindhoven.nl/word-donateur/",
                city = "Eindhoven",
            ),
            ShelterResponse(
                id = "a0000004-0004-4004-8004-000000000004",
                name = "Dierenasiel Utrecht",
                description =
                    "Onafhankelijk dierenasiel in Utrecht voor honden, katten en kleine huisdieren; op afspraak.",
                latitude = 52.0693076,
                longitude = 5.1468573,
                species = listOf(ShelterSpecies.dog, ShelterSpecies.cat, ShelterSpecies.rabbit),
                signupUrl = "https://www.dierenasielutrecht.nl/vrijwilligerswerk/",
                imageUrl = "https://picsum.photos/seed/voluntail-utrecht/800/450",
                donationUrl = "https://www.dierenasielutrecht.nl/word-vriend/",
                city = "Utrecht",
            ),
            ShelterResponse(
                id = "a0000005-0005-4005-8005-000000000005",
                name = "Dierenbeschermingscentrum Noord-Nederland",
                description =
                    "Dierenbeschermingscentrum Noord-Nederland te Groningen voor opvang en herplaatsing uit de regio.",
                latitude = 53.2010673,
                longitude = 6.63028,
                species = listOf(ShelterSpecies.dog, ShelterSpecies.cat, ShelterSpecies.rabbit),
                signupUrl =
                    "https://www.dierenbescherming.nl/dierenasiel/dierenbeschermingscentrum-noord-nederland/contact",
                imageUrl = "https://picsum.photos/seed/voluntail-groningen/800/450",
                donationUrl = "https://www.dierenbescherming.nl/doneren",
                city = "Groningen",
            ),
        )
}
