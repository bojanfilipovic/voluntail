package io.shelters

/**
 * In-memory parity with pilot seed data when `DB_URL` is unset.
 * Keeps sample data out of routing so routes stay thin.
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
                signupUrl = "https://doa-dierenasiel.nl/help-mee/",
                imageUrl = "https://doa-dierenasiel.nl/wp-content/uploads/2022/08/logo-125.svg",
                donationUrl = "https://doa-dierenasiel.nl/help-mee/",
            ),
            ShelterResponse(
                id = "a0000002-0002-4002-8002-000000000002",
                name = "Reptielenopvang Zwanenburg",
                description =
                    "Opvang voor reptielen, amfibieën en geleedpotigen sinds 1983. " +
                        "Gelegen tussen Haarlem en Amsterdam.",
                latitude = 52.3794501,
                longitude = 4.7541101,
                species = listOf(ShelterSpecies.reptile),
                signupUrl = "https://reptielenopvang.nl/contact",
                imageUrl =
                    "https://reptileessentials.nl/cdn/shop/files/logo3.jpg?height=200&v=1753111538",
                donationUrl = "https://dierenlot.digicollect.nl/stichting-dierenhulpdienst-nederland",
            ),
            ShelterResponse(
                id = "a0000003-0003-4003-8003-000000000003",
                name = "Stichting Dierenopvang Hengelo",
                description =
                    "Dierenopvang, pension en dierenambulance in de regio Hengelo e.o. " +
                        "Sinds 2003 opvang en herplaatsing van o.a. honden, katten en konijnen.",
                latitude = 52.2442726,
                longitude = 6.7645154,
                species = listOf(ShelterSpecies.dog, ShelterSpecies.cat, ShelterSpecies.rabbit),
                signupUrl = "https://www.dierenopvanghengelo.nl/onze-vrijwilligers/",
                imageUrl = "https://picsum.photos/seed/voluntail-hengelo/800/450",
                donationUrl = "https://dierenlot.digicollect.nl/stichting-dierenopvang-hengelo",
            ),
            ShelterResponse(
                id = "a0000004-0004-4004-8004-000000000004",
                name = "Dierencentrum Achterhoek",
                description =
                    "Dierenasiel in de Achterhoek: opvang en zorg voor o.a. honden, katten, " +
                        "konijnen en knaagdieren voor meerdere omliggende gemeenten. Alleen op afspraak.",
                latitude = 51.9677498,
                longitude = 6.2669949,
                species = listOf(ShelterSpecies.dog, ShelterSpecies.cat, ShelterSpecies.rabbit),
                signupUrl = "https://www.dierencentrumachterhoek.nl/over-ons/vrijwilligers",
                imageUrl = "https://picsum.photos/seed/voluntail-achterhoek/800/450",
                donationUrl = "https://www.dier.nu/beneficianten/stg-dierencentrum-achterhoek/",
            ),
            ShelterResponse(
                id = "a0000005-0005-4005-8005-000000000005",
                name = "Dierentehuis Arnhem en omstreken",
                description =
                    "Dierenasiel en dierenambulance voor negen gemeenten in de regio Arnhem. " +
                        "Zwerf- en afstandsdieren, quarantaine, hereniging en herplaatsing op afspraak.",
                latitude = 51.9892274,
                longitude = 5.9609043,
                species = listOf(ShelterSpecies.dog, ShelterSpecies.cat, ShelterSpecies.rabbit),
                signupUrl = "https://dierentehuisarnhem.nl/contact/",
                imageUrl = "https://picsum.photos/seed/voluntail-arnhem/800/450",
                donationUrl = "https://dierentehuisarnhem.nl/doneer-hier/",
            ),
            ShelterResponse(
                id = "a0000006-0006-4006-8006-000000000006",
                name = "Dierenopvang en Dierenambulance De Wissel",
                description =
                    "Dierenopvang sinds 1957 in Leeuwarden en wijde regio: honden, katten, " +
                        "konijnen en knaagdieren, plus dierenambulance in Leeuwarden.",
                latitude = 53.2097708,
                longitude = 5.8296983,
                species = listOf(ShelterSpecies.dog, ShelterSpecies.cat, ShelterSpecies.rabbit),
                signupUrl = "https://www.dierenopvangdewissel.nl/steun-ons/word-vrijwilliger/",
                imageUrl = "https://picsum.photos/seed/voluntail-wissel/800/450",
                donationUrl = "https://www.dierenopvangdewissel.nl/steun-ons/word-donateur/",
            ),
            ShelterResponse(
                id = "a0000007-0007-4007-8007-000000000007",
                name = "Dierentehuis 's-Hertogenbosch e.o.",
                description =
                    "Opvangcentrum met wildopvang voor inheemse wilde dieren naast herplaatsing van " +
                        "honden en katten en dierenambulance in 's-Hertogenbosch en omstreken.",
                latitude = 51.6915724,
                longitude = 5.3472806,
                species = listOf(ShelterSpecies.dog, ShelterSpecies.cat, ShelterSpecies.rabbit),
                signupUrl = "https://dierentehuisdenbosch.nl/vrijwilligerswerk/",
                imageUrl = "https://picsum.photos/seed/voluntail-denbosch/800/450",
                donationUrl = "https://dierentehuisdenbosch.nl/steun-ons/doneren/",
            ),
            ShelterResponse(
                id = "a0000008-0008-4008-8008-000000000008",
                name = "Dierenopvangcentrum Rotterdam",
                description =
                    "Dierenopvang van De Dierenbescherming in Rotterdam voor o.a. honden en katten uit de stad; " +
                        "bezoek alleen op afspraak.",
                latitude = 51.9233004,
                longitude = 4.4384147,
                species = listOf(ShelterSpecies.dog, ShelterSpecies.cat, ShelterSpecies.rabbit),
                signupUrl = "https://www.dierenbescherming.nl/in-actie-komen/vrijwilligerswerk/opvangwerk",
                imageUrl = "https://picsum.photos/seed/voluntail-rotterdam-db/800/450",
                donationUrl = "https://www.dierenbescherming.nl/doneren",
            ),
        )
}
