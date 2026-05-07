-- roz animals import
-- Generated at (UTC): 2026-05-07T19:18:07.263174+00:00
-- Animals: 19
-- Idempotent: skips rows where name already exists for this shelter.

insert into public.animals (shelter_id, city, name, description, species, status, published, image_urls, external_url)
select s.id, 'Zwanenburg', 'Karel', 'Karel', 'reptile', 'available', true, ARRAY['https://cdn.shopify.com/s/files/1/0947/8648/6602/files/karel.webp?v=1769164875', 'https://cdn.shopify.com/s/files/1/0947/8648/6602/files/karel2.webp?v=1769164882']::text[], 'https://reptileessentials.nl/pages/dieren-in-de-opvang'
from public.shelters s
where s.name = 'Reptielenopvang Zwanenburg'
  and not exists (select 1 from public.animals a where a.name = 'Karel' and a.shelter_id = s.id)
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_urls, external_url)
select s.id, 'Zwanenburg', 'Chinese driekielschildpad', 'Chinese driekielschildpad (Mauremys reevesii)', 'reptile', 'available', true, ARRAY['https://cdn.shopify.com/s/files/1/0947/8648/6602/files/IMG_2667.jpg?v=1756225366']::text[], 'https://reptileessentials.nl/pages/dieren-in-de-opvang'
from public.shelters s
where s.name = 'Reptielenopvang Zwanenburg'
  and not exists (select 1 from public.animals a where a.name = 'Chinese driekielschildpad' and a.shelter_id = s.id)
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_urls, external_url)
select s.id, 'Zwanenburg', 'Afrikaanse moerasschildpad', 'Afrikaanse moerasschildpad (Pelomedusa subrufa)', 'reptile', 'available', true, ARRAY['https://cdn.shopify.com/s/files/1/0947/8648/6602/files/Afbeelding_van_WhatsApp_op_2025-08-30_om_18.38.37_86bda82c.jpg?v=1756666313']::text[], 'https://reptileessentials.nl/pages/dieren-in-de-opvang'
from public.shelters s
where s.name = 'Reptielenopvang Zwanenburg'
  and not exists (select 1 from public.animals a where a.name = 'Afrikaanse moerasschildpad' and a.shelter_id = s.id)
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_urls, external_url)
select s.id, 'Zwanenburg', 'Baardagame', 'Baardagame (Pogona vitticeps)', 'reptile', 'available', true, ARRAY['https://cdn.shopify.com/s/files/1/0947/8648/6602/files/IMG_2730.jpg?v=1756225370']::text[], 'https://reptileessentials.nl/pages/dieren-in-de-opvang'
from public.shelters s
where s.name = 'Reptielenopvang Zwanenburg'
  and not exists (select 1 from public.animals a where a.name = 'Baardagame' and a.shelter_id = s.id)
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_urls, external_url)
select s.id, 'Zwanenburg', 'Rode rattenslang', 'Rode rattenslang (Pantherophis guttatus)', 'reptile', 'available', true, ARRAY['https://cdn.shopify.com/s/files/1/0947/8648/6602/files/IMG_2778.jpg?v=1756225368', 'https://cdn.shopify.com/s/files/1/0947/8648/6602/files/IMG_2721.jpg?v=1756225370', 'https://cdn.shopify.com/s/files/1/0947/8648/6602/files/IMG_3207.jpg?v=1756225365', 'https://cdn.shopify.com/s/files/1/0947/8648/6602/files/IMG_2765.jpg?v=1756225370']::text[], 'https://reptileessentials.nl/pages/dieren-in-de-opvang'
from public.shelters s
where s.name = 'Reptielenopvang Zwanenburg'
  and not exists (select 1 from public.animals a where a.name = 'Rode rattenslang' and a.shelter_id = s.id)
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_urls, external_url)
select s.id, 'Zwanenburg', 'Oostelijke diamantratelslang', 'Oostelijke diamantratelslang (Crotalus adamanteus)', 'reptile', 'available', true, ARRAY['https://cdn.shopify.com/s/files/1/0947/8648/6602/files/Afbeelding_van_WhatsApp_op_2025-08-31_om_20.42.57_729f9df4.jpg?v=1756666311', 'https://cdn.shopify.com/s/files/1/0947/8648/6602/files/ratelslang.webp?v=1769171229']::text[], 'https://reptileessentials.nl/pages/dieren-in-de-opvang'
from public.shelters s
where s.name = 'Reptielenopvang Zwanenburg'
  and not exists (select 1 from public.animals a where a.name = 'Oostelijke diamantratelslang' and a.shelter_id = s.id)
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_urls, external_url)
select s.id, 'Zwanenburg', 'Tapijtpython', 'Tapijtpython (Morelia spilota spilota)', 'reptile', 'available', true, ARRAY['https://cdn.shopify.com/s/files/1/0947/8648/6602/files/IMG_2734.jpg?v=1756225372']::text[], 'https://reptileessentials.nl/pages/dieren-in-de-opvang'
from public.shelters s
where s.name = 'Reptielenopvang Zwanenburg'
  and not exists (select 1 from public.animals a where a.name = 'Tapijtpython' and a.shelter_id = s.id)
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_urls, external_url)
select s.id, 'Zwanenburg', 'Balpython / Koningspython', 'Balpython / Koningspython (Python regius)', 'reptile', 'available', true, ARRAY['https://cdn.shopify.com/s/files/1/0947/8648/6602/files/IMG_3215.jpg?v=1756225366']::text[], 'https://reptileessentials.nl/pages/dieren-in-de-opvang'
from public.shelters s
where s.name = 'Reptielenopvang Zwanenburg'
  and not exists (select 1 from public.animals a where a.name = 'Balpython / Koningspython' and a.shelter_id = s.id)
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_urls, external_url)
select s.id, 'Zwanenburg', 'Schorpioen', 'Schorpioen', 'arachnid', 'available', true, ARRAY['https://cdn.shopify.com/s/files/1/0947/8648/6602/files/IMG_2702.jpg?v=1756225367', 'https://cdn.shopify.com/s/files/1/0947/8648/6602/files/Afbeelding_van_WhatsApp_op_2025-08-31_om_20.42.57_f30e42c8.jpg?v=1756666311']::text[], 'https://reptileessentials.nl/pages/dieren-in-de-opvang'
from public.shelters s
where s.name = 'Reptielenopvang Zwanenburg'
  and not exists (select 1 from public.animals a where a.name = 'Schorpioen' and a.shelter_id = s.id)
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_urls, external_url)
select s.id, 'Zwanenburg', 'Luipaardgekko', 'Luipaardgekko (Eublepharis macularius)', 'reptile', 'available', true, ARRAY['https://cdn.shopify.com/s/files/1/0947/8648/6602/files/Afbeelding_van_WhatsApp_op_2025-07-21_om_17.47.51_18085559_dd841480-d03d-44dc-990d-59f5060b3a07.jpg?v=1756666314', 'https://cdn.shopify.com/s/files/1/0947/8648/6602/files/Afbeelding_van_WhatsApp_op_2025-08-30_om_18.46.53_d0796a83.jpg?v=1756666314', 'https://cdn.shopify.com/s/files/1/0947/8648/6602/files/Afbeelding_van_WhatsApp_op_2025-08-30_om_18.45.38_1d920064.jpg?v=1756666313']::text[], 'https://reptileessentials.nl/pages/dieren-in-de-opvang'
from public.shelters s
where s.name = 'Reptielenopvang Zwanenburg'
  and not exists (select 1 from public.animals a where a.name = 'Luipaardgekko' and a.shelter_id = s.id)
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_urls, external_url)
select s.id, 'Zwanenburg', 'Kaaimannen', 'Kaaimannen (Caimaninae)', 'reptile', 'available', true, ARRAY['https://cdn.shopify.com/s/files/1/0947/8648/6602/files/Afbeelding_van_WhatsApp_op_2025-08-30_om_18.38.38_481514e7.jpg?v=1756666314', 'https://cdn.shopify.com/s/files/1/0947/8648/6602/files/Afbeelding_van_WhatsApp_op_2025-08-30_om_18.38.38_271919f5.jpg?v=1756666314', 'https://cdn.shopify.com/s/files/1/0947/8648/6602/files/Afbeelding_van_WhatsApp_op_2025-08-30_om_18.42.13_e2e36909.jpg?v=1756666313']::text[], 'https://reptileessentials.nl/pages/dieren-in-de-opvang'
from public.shelters s
where s.name = 'Reptielenopvang Zwanenburg'
  and not exists (select 1 from public.animals a where a.name = 'Kaaimannen' and a.shelter_id = s.id)
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_urls, external_url)
select s.id, 'Zwanenburg', 'Jemen kameleon', 'Jemen kameleon (Chamaeleo calyptratus)', 'reptile', 'available', true, ARRAY['https://cdn.shopify.com/s/files/1/0947/8648/6602/files/Afbeelding_van_WhatsApp_op_2025-08-30_om_18.45.18_c81abe5e.jpg?v=1756666314', 'https://cdn.shopify.com/s/files/1/0947/8648/6602/files/Afbeelding_van_WhatsApp_op_2025-08-30_om_18.51.11_ad699ad5.jpg?v=1756666313']::text[], 'https://reptileessentials.nl/pages/dieren-in-de-opvang'
from public.shelters s
where s.name = 'Reptielenopvang Zwanenburg'
  and not exists (select 1 from public.animals a where a.name = 'Jemen kameleon' and a.shelter_id = s.id)
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_urls, external_url)
select s.id, 'Zwanenburg', 'Indische cobra', 'Indische cobra', 'reptile', 'available', true, ARRAY['https://cdn.shopify.com/s/files/1/0947/8648/6602/files/Afbeelding_van_WhatsApp_op_2025-09-01_om_20.39.26_c77b0154.jpg?v=1756824862', 'https://cdn.shopify.com/s/files/1/0947/8648/6602/files/najanaja5_dad2e656-5cd3-4a4d-9d87-38e385d5d94b.jpg?v=1771152150', 'https://cdn.shopify.com/s/files/1/0947/8648/6602/files/Afbeelding_van_WhatsApp_op_2025-08-31_om_20.42.57_246284f9_aace3933-b661-403a-b660-991114c671d7.jpg?v=1756824878']::text[], 'https://reptileessentials.nl/pages/dieren-in-de-opvang'
from public.shelters s
where s.name = 'Reptielenopvang Zwanenburg'
  and not exists (select 1 from public.animals a where a.name = 'Indische cobra' and a.shelter_id = s.id)
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_urls, external_url)
select s.id, 'Zwanenburg', 'Katteoogslang', 'Katteoogslang (leptodeira)', 'reptile', 'available', true, ARRAY['https://cdn.shopify.com/s/files/1/0947/8648/6602/files/kattenoog.jpg?v=1771008172', 'https://cdn.shopify.com/s/files/1/0947/8648/6602/files/kattenoog2.jpg?v=1771008171', 'https://cdn.shopify.com/s/files/1/0947/8648/6602/files/kattenoog4.jpg?v=1771008171', 'https://cdn.shopify.com/s/files/1/0947/8648/6602/files/kattenoog6.jpg?v=1771008171']::text[], 'https://reptileessentials.nl/pages/dieren-in-de-opvang'
from public.shelters s
where s.name = 'Reptielenopvang Zwanenburg'
  and not exists (select 1 from public.animals a where a.name = 'Katteoogslang' and a.shelter_id = s.id)
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_urls, external_url)
select s.id, 'Zwanenburg', 'Zandadder', 'Zandadder (Vipera ammodytes)', 'reptile', 'available', true, ARRAY['https://cdn.shopify.com/s/files/1/0947/8648/6602/files/WhatsApp_Image_2026-01-27_at_17.5455.jpg?v=1771008746', 'https://cdn.shopify.com/s/files/1/0947/8648/6602/files/WhatsApp_Image_2026-01-27_at_17afdf.jpg?v=1771008746', 'https://cdn.shopify.com/s/files/1/0947/8648/6602/files/ggg.jpg?v=1771008746', 'https://cdn.shopify.com/s/files/1/0947/8648/6602/files/g.jpg?v=1771008746']::text[], 'https://reptileessentials.nl/pages/dieren-in-de-opvang'
from public.shelters s
where s.name = 'Reptielenopvang Zwanenburg'
  and not exists (select 1 from public.animals a where a.name = 'Zandadder' and a.shelter_id = s.id)
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_urls, external_url)
select s.id, 'Zwanenburg', 'Landschildpadden', 'Landschildpadden', 'reptile', 'available', true, ARRAY['https://cdn.shopify.com/s/files/1/0947/8648/6602/files/schildpadden.jpg?v=1771151796', 'https://cdn.shopify.com/s/files/1/0947/8648/6602/files/kleinelandschildpad2.jpg?v=1771151796', 'https://cdn.shopify.com/s/files/1/0947/8648/6602/files/schildpadden2.jpg?v=1771151796']::text[], 'https://reptileessentials.nl/pages/dieren-in-de-opvang'
from public.shelters s
where s.name = 'Reptielenopvang Zwanenburg'
  and not exists (select 1 from public.animals a where a.name = 'Landschildpadden' and a.shelter_id = s.id)
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_urls, external_url)
select s.id, 'Zwanenburg', 'Super Dwarf Reticulated Pythons', 'Super Dwarf Reticulated Pythons (Malayopython reticulatus)', 'reptile', 'available', true, ARRAY['https://cdn.shopify.com/s/files/1/0947/8648/6602/files/WhatsApp_Image_2026-04-24_at_13.26.40.jpg?v=1777030732', 'https://cdn.shopify.com/s/files/1/0947/8648/6602/files/WhatsApp_Image_2026-04-24_at_13.29.15.jpg?v=1777030733']::text[], 'https://reptileessentials.nl/pages/dieren-in-de-opvang'
from public.shelters s
where s.name = 'Reptielenopvang Zwanenburg'
  and not exists (select 1 from public.animals a where a.name = 'Super Dwarf Reticulated Pythons' and a.shelter_id = s.id)
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_urls, external_url)
select s.id, 'Zwanenburg', 'Jemenkameleon', 'Jemenkameleon (Chamaeleo calyptratus)', 'reptile', 'available', true, ARRAY['https://cdn.shopify.com/s/files/1/0947/8648/6602/files/WhatsApp_Image_2026-04-24_at_13.27.46.jpg?v=1777030966']::text[], 'https://reptileessentials.nl/pages/dieren-in-de-opvang'
from public.shelters s
where s.name = 'Reptielenopvang Zwanenburg'
  and not exists (select 1 from public.animals a where a.name = 'Jemenkameleon' and a.shelter_id = s.id)
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_urls, external_url)
select s.id, 'Zwanenburg', 'Zwarte Argentijnse teju', 'Zwarte Argentijnse teju', 'reptile', 'available', true, ARRAY['https://cdn.shopify.com/s/files/1/0947/8648/6602/files/WhatsApp_Image_2026-04-24_at_13.31.17.jpg?v=1777031067', 'https://cdn.shopify.com/s/files/1/0947/8648/6602/files/WhatsApp_Image_2026-04-24_at_13.28.54.jpg?v=1777031067']::text[], 'https://reptileessentials.nl/pages/dieren-in-de-opvang'
from public.shelters s
where s.name = 'Reptielenopvang Zwanenburg'
  and not exists (select 1 from public.animals a where a.name = 'Zwarte Argentijnse teju' and a.shelter_id = s.id)
limit 1;
