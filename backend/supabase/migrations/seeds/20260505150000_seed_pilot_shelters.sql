-- Pilot shelters: DOA + ROZ (always present).
-- Idempotent: skips if already exists.

insert into public.shelters (
    id, name, description, latitude, longitude, species,
    signup_url, image_url, donation_url, city
)
values (
    'a0000001-0001-4001-8001-000000000001'::uuid,
    'DOA dierenasiel',
    'Dierenasiel voor honden, katten en konijnen in Nederland. Adoptie en zorg voor dieren die een tweede kans nodig hebben.',
    52.3629026,
    4.7845807,
    '{dog,cat,rabbit}'::text[],
    'https://doa-dierenasiel.nl/over-doa/vacatures/',
    'https://doa-dierenasiel.nl/wp-content/uploads/2022/08/logo-125.svg',
    'https://doa-dierenasiel.nl/doneer/',
    'Amsterdam'
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
values (
    'a0000002-0002-4002-8002-000000000002'::uuid,
    'Reptielenopvang Zwanenburg',
    'Opvang voor reptielen, amfibieën en geleedpotigen sinds 1983. Gelegen tussen Haarlem en Amsterdam.',
    52.3794501,
    4.7541101,
    '{reptile,amphibian,arachnid}'::text[],
    'https://reptielenopvang.nl/contact',
    'https://reptileessentials.nl/cdn/shop/files/logo3.jpg?height=200&v=1753111538',
    'https://dierenlot.digicollect.nl/stichting-dierenhulpdienst-nederland',
    'Zwanenburg'
)
on conflict (id) do update set
    description = excluded.description,
    latitude = excluded.latitude,
    longitude = excluded.longitude,
    species = excluded.species,
    signup_url = excluded.signup_url,
    image_url = excluded.image_url,
    donation_url = excluded.donation_url;
