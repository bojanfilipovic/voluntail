-- Initial directory seed (30 shelters). Species = subset of backend enum per site scope; coords OSM Nominatim.
insert into public.shelters (
    name,
    description,
    latitude,
    longitude,
    species,
    signup_url,
    image_url,
    donation_url
)
values
    (
        'DOA dierenasiel',
        'Dierenasiel voor honden, katten en konijnen in Nederland. '
            || 'Adoptie en zorg voor dieren die een tweede kans nodig hebben.',
        52.3629026,
        4.7845807,
        '["dog","cat","rabbit"]'::jsonb,
        'https://doa-dierenasiel.nl/help-mee/',
        'https://doa-dierenasiel.nl/wp-content/uploads/2022/08/logo-125.svg',
        'https://doa-dierenasiel.nl/help-mee/'
    ),
    (
        'Reptielenopvang Zwanenburg',
        'Opvang voor reptielen, amfibieën en geleedpotigen sinds 1983. '
            || 'Gelegen tussen Haarlem en Amsterdam.',
        52.3794501,
        4.7541101,
        '["reptile","amphibian"]'::jsonb,
        'https://reptielenopvang.nl/contact',
        'https://reptileessentials.nl/cdn/shop/files/logo3.jpg?height=200&v=1753111538',
        'https://dierenlot.digicollect.nl/stichting-dierenhulpdienst-nederland'
    ),
    (
        'Stichting Dierenopvang Hengelo',
        'Dierenopvang, pension en dierenambulance in de regio Hengelo e.o. ' ||
        'Sinds 2003 opvang en herplaatsing van o.a. honden, katten en konijnen.',
        52.2442726,
        6.7645154,
        '["dog","cat","rabbit"]'::jsonb,
        'https://www.dierenopvanghengelo.nl/onze-vrijwilligers/',
        'https://picsum.photos/seed/voluntail-hengelo/800/450',
        'https://dierenlot.digicollect.nl/stichting-dierenopvang-hengelo'
    ),
    (
        'Dierencentrum Achterhoek',
        'Dierenasiel in de Achterhoek: opvang en zorg voor o.a. honden, katten, ' ||
        'konijnen en knaagdieren voor meerdere omliggende gemeenten. Alleen op afspraak.',
        51.9677498,
        6.2669949,
        '["dog","cat","rabbit","rodent"]'::jsonb,
        'https://www.dierencentrumachterhoek.nl/over-ons/vrijwilligers',
        'https://picsum.photos/seed/voluntail-achterhoek/800/450',
        'https://www.dier.nu/beneficianten/stg-dierencentrum-achterhoek/'
    ),
    (
        'Dierentehuis Arnhem en omstreken',
        'Dierenasiel en dierenambulance voor negen gemeenten in de regio Arnhem. ' ||
        'Zwerf- en afstandsdieren, quarantaine, hereniging en herplaatsing op afspraak.',
        51.9892274,
        5.9609043,
        '["dog","cat","rabbit"]'::jsonb,
        'https://dierentehuisarnhem.nl/contact/',
        'https://picsum.photos/seed/voluntail-arnhem/800/450',
        'https://dierentehuisarnhem.nl/doneer-hier/'
    ),
    (
        'Dierenopvang en Dierenambulance De Wissel',
        'Dierenopvang sinds 1957 in Leeuwarden en wijde regio: honden, katten, ' ||
        'konijnen en knaagdieren, plus dierenambulance in Leeuwarden.',
        53.2097708,
        5.8296983,
        '["dog","cat","rabbit","rodent"]'::jsonb,
        'https://www.dierenopvangdewissel.nl/steun-ons/word-vrijwilliger/',
        'https://picsum.photos/seed/voluntail-wissel/800/450',
        'https://www.dierenopvangdewissel.nl/steun-ons/word-donateur/'
    ),
    (
        'Dierentehuis ''s-Hertogenbosch e.o.',
        'Opvangcentrum met wildopvang voor inheemse wilde dieren naast herplaatsing van ' ||
        'honden en katten en dierenambulance in ''s-Hertogenbosch en omstreken.',
        51.6915724,
        5.3472806,
        '["dog","cat","wildlife"]'::jsonb,
        'https://dierentehuisdenbosch.nl/vrijwilligerswerk/',
        'https://picsum.photos/seed/voluntail-denbosch/800/450',
        'https://dierentehuisdenbosch.nl/steun-ons/doneren/'
    ),
    (
        'Dierenopvangcentrum Rotterdam',
        'Dierenopvang van De Dierenbescherming in Rotterdam voor o.a. honden en katten uit de stad; ' ||
        'bezoek alleen op afspraak.',
        51.9233004,
        4.4384147,
        '["dog","cat"]'::jsonb,
        'https://www.dierenbescherming.nl/in-actie-komen/vrijwilligerswerk/opvangwerk',
        'https://picsum.photos/seed/voluntail-rotterdam-db/800/450',
        'https://www.dierenbescherming.nl/doneren'
    ),
(
        'Dierenasiel Utrecht',
        'Onafhankelijk dierenasiel in Utrecht voor honden, katten en kleine huisdieren; op afspraak.',
        52.0693076,
        5.1468573,
        '["dog","cat","rabbit"]'::jsonb,
        'https://www.dierenasielutrecht.nl/vrijwilligerswerk/',
        'https://picsum.photos/seed/voluntail-utrecht/800/450',
        'https://www.dierenasielutrecht.nl/word-vriend/'
    ),
    (
        'Haags Dierencentrum',
        'Het Haags Dierencentrum opvang voor zwerfhonden en -katten en kliniek; alleen op afspraak.',
        52.0359708,
        4.2461312,
        '["dog","cat"]'::jsonb,
        'https://haagsdierencentrum.nl/aanmelden-vrijwilliger/',
        'https://picsum.photos/seed/voluntail-den-haag/800/450',
        'https://haagsdierencentrum.nl/doneren/'
    ),
    (
        'Dierenbeschermingscentrum Noord-Nederland',
        'Dierenbeschermingscentrum Noord-Nederland te Groningen voor opvang en herplaatsing uit de regio.',
        53.2010673,
        6.63028,
        '["dog","cat","rabbit"]'::jsonb,
        'https://www.dierenbescherming.nl/dierenasiel/dierenbeschermingscentrum-noord-nederland/contact',
        'https://picsum.photos/seed/voluntail-groningen/800/450',
        'https://www.dierenbescherming.nl/doneren'
    ),
    (
        'DOC Breda',
        'Dierenopvangcentrum Breda voor honden, katten en veel kleindieren; werkgebied diverse gemeenten.',
        51.6107983,
        4.7728556,
        '["dog","cat","rabbit"]'::jsonb,
        'https://docbreda.nl/contact/',
        'https://picsum.photos/seed/voluntail-breda/800/450',
        'https://www.dierenbescherming.nl/doneren'
    ),
    (
        'Dierenbeschermingscentrum Limburg',
        'Dierenbeschermingscentrum Limburg in Born: herplaatsing van honden, katten en kleindieren uit Limburg.',
        51.0367665,
        5.8358766,
        '["dog","cat","rabbit"]'::jsonb,
        'https://www.dierenbescherming.nl/dierenasiel/dierenbeschermingscentrum-limburg/contact',
        'https://picsum.photos/seed/voluntail-limburg-born/800/450',
        'https://www.dierenbescherming.nl/doneren'
    ),
    (
        'Dierentehuis Zoetermeer',
        'Dierentehuis Zoetermeer met opvang voor honden en katten uit de stad en omstreken.',
        52.0541521,
        4.5242129,
        '["dog","cat"]'::jsonb,
        'http://w.dierentehuiszoetermeer.nl/contactinfo.html',
        'https://picsum.photos/seed/voluntail-zoetermeer/800/450',
        'https://dierentehuiszoetermeer.nl/doneren/'
    ),
    (
        'Zwols Dierenasiel',
        'Zwols Dierenasiel voor zwerfdieren uit Zwolle en omstreken.',
        52.4853966,
        6.1310268,
        '["dog","cat","rabbit"]'::jsonb,
        'https://www.dierenasielzwolle.nl/contact',
        'https://picsum.photos/seed/voluntail-zwolle/800/450',
        NULL
    ),
    (
        'Dierenopvang Hart van Brabant (Tilburg)',
        'Dierenopvang Hart van Brabant (DOC Tilburg): opvang van zwerfdieren uit meerdere gemeenten.',
        51.5940494,
        5.0334516,
        '["dog","cat","rabbit"]'::jsonb,
        'https://www.doct.nl/vrijwilligers/',
        'https://picsum.photos/seed/voluntail-tilburg/800/450',
        NULL
    ),
    (
        'Stichting ROZE',
        'Regionale Opvang Zwerfdieren Eindhoven: opvang voor de regio Eindhoven en omliggende gemeenten.',
        51.4343223,
        5.5136765,
        '["dog","cat","rabbit","reptile"]'::jsonb,
        'https://www.rozeindhoven.nl/contact/',
        'https://picsum.photos/seed/voluntail-eindhoven-roze/800/450',
        'https://www.rozeindhoven.nl/word-donateur/'
    ),
    (
        'De Kuipershoek',
        'Dierenbescherming De Kuipershoek bij Klarenbeek: opvang voor gemeenten in Noord- en Oost-Gelderland.',
        52.1798837,
        5.9944967,
        '["dog","cat","rabbit"]'::jsonb,
        'https://www.dierenbescherming.nl/dierenasiel/de-kuipershoek/contact',
        'https://picsum.photos/seed/voluntail-kuipershoek/800/450',
        'https://www.dierenbescherming.nl/doneren'
    ),
    (
        'Dierenbeschermingscentrum Amersfoort',
        'DBC Amersfoort voor opvang van katten, konijnen en kleindieren; onderdeel van De Dierenbescherming.',
        52.1339997,
        5.3655502,
        '["cat","rabbit","rodent"]'::jsonb,
        'https://www.dierenbescherming.nl/dierenasiel/dierenbeschermingscentrum-amersfoort/contact',
        'https://picsum.photos/seed/voluntail-amersfoort/800/450',
        'https://www.dierenbescherming.nl/doneren'
    ),
    (
        'Dierentehuis Kennemerland',
        'Dierentehuis Kennemerland voor kustregio Noord-Holland.',
        52.3843154,
        4.5529392,
        '["dog","cat","rabbit"]'::jsonb,
        'https://www.dierenbescherming.nl/dierenasiel/dierentehuis-kennemerland/contact',
        'https://picsum.photos/seed/voluntail-kennemerland/800/450',
        'https://www.dierenbescherming.nl/doneren'
    ),
    (
        'Dierentehuis Stevenshage Leiden',
        'Stevenshage Leiden voor opvang en herplaatsing voor de regio Leiden.',
        52.157614,
        4.4473509,
        '["dog","cat","rabbit"]'::jsonb,
        'https://www.dierenasielleiden.nl/contact/',
        'https://picsum.photos/seed/voluntail-leiden/800/450',
        'https://www.dierenasielleiden.nl/doneren/'
    ),
    (
        'Dierenasiel de Swinge',
        'De Swinge Drachten: Fries dierenasiel onder De Dierenbescherming.',
        53.0863467,
        6.0758023,
        '["dog","cat","rabbit"]'::jsonb,
        'https://www.dierenbescherming.nl/dierenasiel/dierenasiel-de-swinge/contact',
        'https://picsum.photos/seed/voluntail-drachten-swinge/800/450',
        'https://www.dierenbescherming.nl/doneren'
    ),
    (
        'Dierenopvangcentrum Enschede',
        'DOC Enschede voor zwerfdieren uit Twente en omstreken.',
        52.2038598,
        6.8535269,
        '["dog","cat","rabbit"]'::jsonb,
        'https://www.dierenbescherming.nl/dierenasiel/dierenopvangcentrum-enschede/contact',
        'https://picsum.photos/seed/voluntail-enschede/800/450',
        'https://www.dierenbescherming.nl/doneren'
    ),
    (
        'Dierenopvangcentrum Gouda',
        'DOC Gouda voor zwerfhonden en -katten uit de regio.',
        52.0331258,
        4.6927113,
        '["dog","cat"]'::jsonb,
        'https://www.dierenbescherming.nl/dierenasiel/dierenopvangcentrum-gouda/contact',
        'https://picsum.photos/seed/voluntail-gouda/800/450',
        'https://www.dierenbescherming.nl/doneren'
    ),
    (
        'Dierenopvangcentrum Spijkenisse',
        'DOC Spijkenisse voor zwerfdieren uit Voorne aan Zee en omliggende gemeenten.',
        51.8623432,
        4.2976039,
        '["dog","cat"]'::jsonb,
        'https://www.dierenbescherming.nl/dierenasiel/dierenopvangcentrum-spijkenisse/contact',
        'https://picsum.photos/seed/voluntail-spijkenisse/800/450',
        'https://www.dierenbescherming.nl/doneren'
    ),
    (
        'Dierentehuis Alkmaar',
        'Dierentehuis Alkmaar (locatie Purmerend): tijdelijke vestiging onder De Dierenbescherming.',
        52.5125259,
        5.0021538,
        '["dog","cat","rabbit"]'::jsonb,
        'https://www.dierenbescherming.nl/dierenasiel/dierentehuis-alkmaar/contact',
        'https://picsum.photos/seed/voluntail-alkmaar/800/450',
        'https://www.dierenbescherming.nl/doneren'
    ),
    (
        'Dierenopvangcentrum Vlaardingen',
        'DOC Vlaardingen voor zwerfdieren en ambulance Zuid-Holland Zuid.',
        51.9004792,
        4.3058787,
        '["dog","cat","rabbit"]'::jsonb,
        'https://www.dierenbescherming.nl/dierenasiel/dierenopvangcentrum-vlaardingen/contact',
        'https://picsum.photos/seed/voluntail-vlaardingen/800/450',
        'https://www.dierenbescherming.nl/doneren'
    ),
    (
        'Dierenopvang Haarlemmermeer',
        'Stichting Dierenopvang Haarlemmermeer Hoofddorp onder De Dierenbescherming.',
        52.3173681,
        4.6969597,
        '["dog","cat","rabbit"]'::jsonb,
        'https://www.dierenbescherming.nl/dierenasiel/dierenopvang-haarlemmermeer/contact',
        'https://picsum.photos/seed/voluntail-hoofddorp/800/450',
        'https://www.dierenbescherming.nl/doneren'
    ),
    (
        'Dierentehuis De Hof van Ede',
        'De Hof van Ede voor honden in Ede en kleindieren via Amersfoort.',
        52.0353175,
        5.7481906,
        '["dog","cat"]'::jsonb,
        'https://www.dierenbescherming.nl/dierenasiel/dierentehuis-de-hof-van-ede/contact',
        'https://picsum.photos/seed/voluntail-ede/800/450',
        'https://www.dierenbescherming.nl/doneren'
    ),
    (
        'Dierenasiel Walcheren',
        'Dierenasiel Walcheren voor Walcheren en omstreken.',
        51.4527536,
        3.6034246,
        '["dog","cat"]'::jsonb,
        'https://www.dierenasielwalcheren.nl/contact',
        'https://picsum.photos/seed/voluntail-walcheren/800/450',
        NULL
    );
