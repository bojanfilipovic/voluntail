-- Extra NL shelters (directory expansion). Runs after pilot seed (DOA, ROZ, Snoopy at a0000006).
-- Idempotent: ON CONFLICT (id) DO UPDATE.
-- Skips pilot duplicates (DOA, Reptielenopvang Zwanenburg).
-- image_url values: public assets from each organization (site og:image, logo, or cms.dierenbescherming.nl).
--
-- UUID mapping (legacy paste row → this file):
--   ROZE Eindhoven / Utrecht / Groningen → a0000003, a0000004, a0000005
--   Stichting Dierenopvang Hengelo → a0000007
--   Dierencentrum Achterhoek (Ruurlo) → a0000008
--   Dierentehuis Arnhem → a0000009
--   Dierenopvang De Wissel (Leeuwarden) → a000000a  -- not a0000006 (reserved for Udruga Snoopy)
--   Dierentehuis 's-Hertogenbosch → a000000b
--   Dierenopvangcentrum Rotterdam → a000000c
--   Haags Dierencentrum → a000000d
--   DOC Breda → a000000e
--   Dierenbeschermingscentrum Limburg (Born) → a000000f
--   Dierentehuis Zoetermeer → a0000010
--   Zwols Dierenasiel → a0000011
--   Dierenopvang Hart van Brabant (Tilburg) → a0000012
--   De Kuipershoek (Klarenbeek) → a0000013
--   DBC Amersfoort → a0000014
--   Dierentehuis Kennemerland (Castricum) → a0000015
--   Dierentehuis Stevenshage Leiden → a0000016
--   Dierenasiel de Swinge (Drachten) → a0000017
--   Dierenopvangcentrum Enschede → a0000018
--   Dierenopvangcentrum Gouda → a0000019
--   Dierenopvangcentrum Spijkenisse → a000001a
--   Dierentehuis Alkmaar (Purmerend) → a000001b
--   Dierenopvangcentrum Vlaardingen → a000001c
--   Dierenopvang Haarlemmermeer (Hoofddorp) → a000001d
--   Dierentehuis De Hof van Ede → a000001e
--   Dierenasiel Walcheren (Middelburg) → a000001f

insert into public.shelters (
    id, name, description, latitude, longitude, species,
    signup_url, image_url, donation_url, city
)
values
    (
        'a0000003-0003-4003-8003-000000000003'::uuid,
        'Stichting ROZE',
        'Regionale Opvang Zwerfdieren Eindhoven: opvang voor de regio Eindhoven en omliggende gemeenten.',
        51.4343223,
        5.5136765,
        '{dog,cat,rabbit,reptile}'::text[],
        'https://www.rozeindhoven.nl/contact/',
        'https://www.rozeindhoven.nl/wp-content/uploads/2025/07/image-10-edited-1-1024x768.png',
        'https://www.rozeindhoven.nl/word-donateur/',
        'Eindhoven'
    ),
    (
        'a0000004-0004-4004-8004-000000000004'::uuid,
        'Dierenasiel Utrecht',
        'Onafhankelijk dierenasiel in Utrecht voor honden, katten en kleine huisdieren; op afspraak.',
        52.0693076,
        5.1468573,
        '{dog,cat,rabbit}'::text[],
        'https://www.dierenasielutrecht.nl/vrijwilligerswerk/',
        'https://www.dierenasielutrecht.nl/assets/img/logo-dierenasiel-utrecht.png',
        'https://www.dierenasielutrecht.nl/word-vriend/',
        'Utrecht'
    ),
    (
        'a0000005-0005-4005-8005-000000000005'::uuid,
        'Dierenbeschermingscentrum Noord-Nederland',
        'Dierenbeschermingscentrum Noord-Nederland te Groningen voor opvang en herplaatsing uit de regio.',
        53.2010673,
        6.63028,
        '{dog,cat,rabbit}'::text[],
        'https://www.dierenbescherming.nl/dierenasiel/dierenbeschermingscentrum-noord-nederland/contact',
        'https://cms.dierenbescherming.nl/assets/dierenbeschermingscentrumNoordNederland/Algemeen/_2880x1620_crop_center-center_none/DOC_Groningen2.jpg?stamp=2506241420&tag=lg',
        'https://www.dierenbescherming.nl/doneren',
        'Groningen'
    )
on conflict (id) do update set
    description = excluded.description,
    latitude = excluded.latitude,
    longitude = excluded.longitude,
    species = excluded.species,
    signup_url = excluded.signup_url,
    image_url = excluded.image_url,
    donation_url = excluded.donation_url;

insert into public.shelters (
    id, name, description, latitude, longitude, species,
    signup_url, image_url, donation_url, city
)
values
    (
        'a0000007-0007-4007-8007-000000000007'::uuid,
        'Stichting Dierenopvang Hengelo',
        'Dierenopvang, pension en dierenambulance in de regio Hengelo e.o. ' ||
        'Sinds 2003 opvang en herplaatsing van o.a. honden, katten en konijnen.',
        52.2442726,
        6.7645154,
        '{dog,cat,rabbit}'::text[],
        'https://www.dierenopvanghengelo.nl/onze-vrijwilligers/',
        'https://www.dierenopvanghengelo.nl/wp-content/uploads/2023/11/ambu-foto-met-nieuwe-nummer.jpg',
        'https://dierenlot.digicollect.nl/stichting-dierenopvang-hengelo',
        'Hengelo'
    ),
    (
        'a0000008-0008-4008-8008-000000000008'::uuid,
        'Dierencentrum Achterhoek',
        'Dierenasiel in de Achterhoek: opvang en zorg voor o.a. honden, katten, ' ||
        'konijnen en knaagdieren voor meerdere omliggende gemeenten. Alleen op afspraak.',
        51.9677498,
        6.2669949,
        '{dog,cat,rabbit,rodent}'::text[],
        'https://www.dierencentrumachterhoek.nl/over-ons/vrijwilligers',
        'https://www.dierencentrumachterhoek.nl/Content/images/logo-oud.png',
        'https://www.dier.nu/beneficianten/stg-dierencentrum-achterhoek/',
        'Ruurlo'
    ),
    (
        'a0000009-0009-4009-8009-000000000009'::uuid,
        'Dierentehuis Arnhem en omstreken',
        'Dierenasiel en dierenambulance voor negen gemeenten in de regio Arnhem. ' ||
        'Zwerf- en afstandsdieren, quarantaine, hereniging en herplaatsing op afspraak.',
        51.9892274,
        5.9609043,
        '{dog,cat,rabbit}'::text[],
        'https://dierentehuisarnhem.nl/contact/',
        'https://dierentehuisarnhem.nl/wp-content/uploads/2024/10/Nieuwbouw-foto-1024x576.jpg',
        'https://dierentehuisarnhem.nl/doneer-hier/',
        'Arnhem'
    ),
    (
        'a000000a-000a-400a-800a-00000000000a'::uuid,
        'Dierenopvang en Dierenambulance De Wissel',
        'Dierenopvang sinds 1957 in Leeuwarden en wijde regio: honden, katten, ' ||
        'konijnen en knaagdieren, plus dierenambulance in Leeuwarden.',
        53.2097708,
        5.8296983,
        '{dog,cat,rabbit,rodent}'::text[],
        'https://www.dierenopvangdewissel.nl/steun-ons/word-vrijwilliger/',
        'https://www.dierenopvangdewissel.nl/media/wtdj22s0/de-wissel-social-share-image.jpg',
        'https://www.dierenopvangdewissel.nl/steun-ons/word-donateur/',
        'Leeuwarden'
    ),
    (
        'a000000b-000b-400b-800b-00000000000b'::uuid,
        'Dierentehuis ''s-Hertogenbosch e.o.',
        'Opvangcentrum met wildopvang voor inheemse wilde dieren naast herplaatsing van ' ||
        'honden en katten en dierenambulance in ''s-Hertogenbosch en omstreken.',
        51.6915724,
        5.3472806,
        '{dog,cat,wildlife}'::text[],
        'https://dierentehuisdenbosch.nl/vrijwilligerswerk/',
        'https://dierentehuisdenbosch.nl/wp-content/uploads/2026/02/DSC_0485-1024x681.jpg',
        'https://dierentehuisdenbosch.nl/steun-ons/doneren/',
        '''s-Hertogenbosch'
    ),
    (
        'a000000c-000c-400c-800c-00000000000c'::uuid,
        'Dierenopvangcentrum Rotterdam',
        'Dierenopvang van De Dierenbescherming in Rotterdam voor o.a. honden en katten uit de stad; ' ||
        'bezoek alleen op afspraak.',
        51.9233004,
        4.4384147,
        '{dog,cat}'::text[],
        'https://www.dierenbescherming.nl/in-actie-komen/vrijwilligerswerk/opvangwerk',
        'https://cms.dierenbescherming.nl/assets/dierenopvangcentrumRotterdam/Dieren/_2880x1620_crop_center-center_none/DBC-Rotterdam4.jpg?stamp=2505211553&tag=lg',
        'https://www.dierenbescherming.nl/doneren',
        'Rotterdam'
    ),
    (
        'a000000d-000d-400d-800d-00000000000d'::uuid,
        'Haags Dierencentrum',
        'Het Haags Dierencentrum opvang voor zwerfhonden en -katten en kliniek; alleen op afspraak.',
        52.0359708,
        4.2461312,
        '{dog,cat}'::text[],
        'https://haagsdierencentrum.nl/aanmelden-vrijwilliger/',
        'https://haagsdierencentrum.nl/wp-content/uploads/2025/11/pexels-hnoody93-58997.jpg',
        'https://haagsdierencentrum.nl/doneren/',
        'Den Haag'
    ),
    (
        'a000000e-000e-400e-800e-00000000000e'::uuid,
        'DOC Breda',
        'Dierenopvangcentrum Breda voor honden, katten en veel kleindieren; werkgebied diverse gemeenten.',
        51.6107983,
        4.7728556,
        '{dog,cat,rabbit}'::text[],
        'https://docbreda.nl/contact/',
        'https://docbreda.nl/wp-content/uploads/2020/01/front-home-pic.jpg',
        'https://www.dierenbescherming.nl/doneren',
        'Breda'
    ),
    (
        'a000000f-000f-400f-800f-00000000000f'::uuid,
        'Dierenbeschermingscentrum Limburg',
        'Dierenbeschermingscentrum Limburg in Born: herplaatsing van honden, katten en kleindieren uit Limburg.',
        51.0367665,
        5.8358766,
        '{dog,cat,rabbit}'::text[],
        'https://www.dierenbescherming.nl/dierenasiel/dierenbeschermingscentrum-limburg/contact',
        'https://cms.dierenbescherming.nl/assets/dierenbeschermingscentrumLimburg/Algemeen/Flurry.png',
        'https://www.dierenbescherming.nl/doneren',
        'Born'
    ),
    (
        'a0000010-0010-4010-8010-000000000010'::uuid,
        'Dierentehuis Zoetermeer',
        'Dierentehuis Zoetermeer met opvang voor honden en katten uit de stad en omstreken.',
        52.0541521,
        4.5242129,
        '{dog,cat}'::text[],
        'http://w.dierentehuiszoetermeer.nl/contactinfo.html',
        'http://w.dierentehuiszoetermeer.nl/images/DTZ.jpg',
        'https://dierentehuiszoetermeer.nl/doneren/',
        'Zoetermeer'
    ),
    (
        'a0000011-0011-4011-8011-000000000011'::uuid,
        'Zwols Dierenasiel',
        'Zwols Dierenasiel voor zwerfdieren uit Zwolle en omstreken.',
        52.4853966,
        6.1310268,
        '{dog,cat,rabbit}'::text[],
        'https://www.dierenasielzwolle.nl/contact',
        'https://dierenasielzwolle.nl/wp-content/uploads/2020/11/newsliderfrontpagekathond.jpg',
        NULL,
        'Zwolle'
    ),
    (
        'a0000012-0012-4012-8012-000000000012'::uuid,
        'Dierenopvang Hart van Brabant (Tilburg)',
        'Dierenopvang Hart van Brabant (DOC Tilburg): opvang van zwerfdieren uit meerdere gemeenten.',
        51.5940494,
        5.0334516,
        '{dog,cat,rabbit}'::text[],
        'https://www.doct.nl/vrijwilligers/',
        'https://dierenopvanghartvanbrabant.nl/wp-content/uploads/2023/08/dierenopvang_logo_social.png',
        NULL,
        'Tilburg'
    ),
    (
        'a0000013-0013-4013-8013-000000000013'::uuid,
        'De Kuipershoek',
        'Dierenbescherming De Kuipershoek bij Klarenbeek: opvang voor gemeenten in Noord- en Oost-Gelderland.',
        52.1798837,
        5.9944967,
        '{dog,cat,rabbit}'::text[],
        'https://www.dierenbescherming.nl/dierenasiel/de-kuipershoek/contact',
        'https://cms.dierenbescherming.nl/assets/deKuipershoek/_2880x1620_crop_center-center_none/asiel-1.jpg?stamp=2504031230&tag=lg',
        'https://www.dierenbescherming.nl/doneren',
        'Klarenbeek'
    ),
    (
        'a0000014-0014-4014-8014-000000000014'::uuid,
        'Dierenbeschermingscentrum Amersfoort',
        'DBC Amersfoort voor opvang van katten, konijnen en kleindieren; onderdeel van De Dierenbescherming.',
        52.1339997,
        5.3655502,
        '{cat,rabbit,rodent}'::text[],
        'https://www.dierenbescherming.nl/dierenasiel/dierenbeschermingscentrum-amersfoort/contact',
        'https://cms.dierenbescherming.nl/assets/dierenbeschermingscentrumAmersfoort/Algemeen/_2880x1620_crop_center-center_none/DBCa_06.jpg?stamp=2306301437&tag=lg',
        'https://www.dierenbescherming.nl/doneren',
        'Amersfoort'
    ),
    (
        'a0000015-0015-4015-8015-000000000015'::uuid,
        'Dierentehuis Kennemerland',
        'Dierentehuis Kennemerland voor kustregio Noord-Holland.',
        52.3843154,
        4.5529392,
        '{dog,cat,rabbit}'::text[],
        'https://www.dierenbescherming.nl/dierenasiel/dierentehuis-kennemerland/contact',
        'https://cms.dierenbescherming.nl/assets/dierentehuisKennemerland/Algemeen/SUZ-Dierentehuiskennemerland-crowdfunding-6-klein.jpg',
        'https://www.dierenbescherming.nl/doneren',
        'Castricum'
    ),
    (
        'a0000016-0016-4016-8016-000000000016'::uuid,
        'Dierentehuis Stevenshage Leiden',
        'Stevenshage Leiden voor opvang en herplaatsing voor de regio Leiden.',
        52.157614,
        4.4473509,
        '{dog,cat,rabbit}'::text[],
        'https://www.dierenasielleiden.nl/contact/',
        'https://www.dierenasielleiden.nl/wp-content/uploads/2023/12/header-kat-kiki-lapje-wit-bruin-4-scaled-e1701703610329-1024x645.jpg',
        'https://www.dierenasielleiden.nl/doneren/',
        'Leiden'
    ),
    (
        'a0000017-0017-4017-8017-000000000017'::uuid,
        'Dierenasiel de Swinge',
        'De Swinge Drachten: Fries dierenasiel onder De Dierenbescherming.',
        53.0863467,
        6.0758023,
        '{dog,cat,rabbit}'::text[],
        'https://www.dierenbescherming.nl/dierenasiel/dierenasiel-de-swinge/contact',
        'https://cms.dierenbescherming.nl/assets/deSwinge/Algemeen/_2880x1620_crop_center-center_none/De-Swinge-bewerkt-kopie.jpg?stamp=2512080937&tag=lg',
        'https://www.dierenbescherming.nl/doneren',
        'Drachten'
    ),
    (
        'a0000018-0018-4018-8018-000000000018'::uuid,
        'Dierenopvangcentrum Enschede',
        'DOC Enschede voor zwerfdieren uit Twente en omstreken.',
        52.2038598,
        6.8535269,
        '{dog,cat,rabbit}'::text[],
        'https://www.dierenbescherming.nl/dierenasiel/dierenopvangcentrum-enschede/contact',
        'https://cms.dierenbescherming.nl/assets/dierenopvangcentrumEnschede/Nina2.jpg',
        'https://www.dierenbescherming.nl/doneren',
        'Enschede'
    ),
    (
        'a0000019-0019-4019-8019-000000000019'::uuid,
        'Dierenopvangcentrum Gouda',
        'DOC Gouda voor zwerfhonden en -katten uit de regio.',
        52.0331258,
        4.6927113,
        '{dog,cat}'::text[],
        'https://www.dierenbescherming.nl/dierenasiel/dierenopvangcentrum-gouda/contact',
        'https://cms.dierenbescherming.nl/assets/dierenopvangcentrumGouda/IMG_20240120_135659923.jpg',
        'https://www.dierenbescherming.nl/doneren',
        'Gouda'
    ),
    (
        'a000001a-001a-401a-801a-00000000001a'::uuid,
        'Dierenopvangcentrum Spijkenisse',
        'DOC Spijkenisse voor zwerfdieren uit Voorne aan Zee en omliggende gemeenten.',
        51.8623432,
        4.2976039,
        '{dog,cat}'::text[],
        'https://www.dierenbescherming.nl/dierenasiel/dierenopvangcentrum-spijkenisse/contact',
        'https://cms.dierenbescherming.nl/assets/dierenopvangcentrumSpijkenisse/Dieren/IMG-20230628-WA0027.jpg',
        'https://www.dierenbescherming.nl/doneren',
        'Spijkenisse'
    ),
    (
        'a000001b-001b-401b-801b-00000000001b'::uuid,
        'Dierentehuis Alkmaar',
        'Dierentehuis Alkmaar (locatie Purmerend): tijdelijke vestiging onder De Dierenbescherming.',
        52.5125259,
        5.0021538,
        '{dog,cat,rabbit}'::text[],
        'https://www.dierenbescherming.nl/dierenasiel/dierentehuis-alkmaar/contact',
        'https://cms.dierenbescherming.nl/assets/dierentehuisAlkmaar/Algemeen/Shyvva4.jpg',
        'https://www.dierenbescherming.nl/doneren',
        'Purmerend'
    ),
    (
        'a000001c-001c-401c-801c-00000000001c'::uuid,
        'Dierenopvangcentrum Vlaardingen',
        'DOC Vlaardingen voor zwerfdieren en ambulance Zuid-Holland Zuid.',
        51.9004792,
        4.3058787,
        '{dog,cat,rabbit}'::text[],
        'https://www.dierenbescherming.nl/dierenasiel/dierenopvangcentrum-vlaardingen/contact',
        'https://cms.dierenbescherming.nl/assets/dierenopvangcentrumVlaardingen/Algemeen/Vliegen_3.jpg',
        'https://www.dierenbescherming.nl/doneren',
        'Vlaardingen'
    ),
    (
        'a000001d-001d-401d-801d-00000000001d'::uuid,
        'Dierenopvang Haarlemmermeer',
        'Stichting Dierenopvang Haarlemmermeer Hoofddorp onder De Dierenbescherming.',
        52.3173681,
        4.6969597,
        '{dog,cat,rabbit}'::text[],
        'https://www.dierenbescherming.nl/dierenasiel/dierenopvang-haarlemmermeer/contact',
        'https://cms.dierenbescherming.nl/assets/dierenopvangHaarlemmermeer/B683CAA9-FE81-4CDD-A644-BF2FAAEED1E3.jpeg',
        'https://www.dierenbescherming.nl/doneren',
        'Hoofddorp'
    ),
    (
        'a000001e-001e-401e-801e-00000000001e'::uuid,
        'Dierentehuis De Hof van Ede',
        'De Hof van Ede voor honden in Ede en kleindieren via Amersfoort.',
        52.0353175,
        5.7481906,
        '{dog,cat}'::text[],
        'https://www.dierenbescherming.nl/dierenasiel/dierentehuis-de-hof-van-ede/contact',
        'https://cms.dierenbescherming.nl/assets/dierentehuisDeHofVanEde/IZB-dieren/Budots3_2023-09-19-131317_qrey.jpg',
        'https://www.dierenbescherming.nl/doneren',
        'Ede'
    ),
    (
        'a000001f-001f-401f-801f-00000000001f'::uuid,
        'Dierenasiel Walcheren',
        'Dierenasiel Walcheren voor Walcheren en omstreken.',
        51.4527536,
        3.6034246,
        '{dog,cat}'::text[],
        'https://www.dierenasielwalcheren.nl/contact',
        'https://www.dierenasielwalcheren.nl/f/files/showimage?f=kopfoto/dierenasiel-walcheren-webversie.jpg',
        NULL,
        'Middelburg'
    )
on conflict (id) do update set
    description = excluded.description,
    latitude = excluded.latitude,
    longitude = excluded.longitude,
    species = excluded.species,
    signup_url = excluded.signup_url,
    image_url = excluded.image_url,
    donation_url = excluded.donation_url;
