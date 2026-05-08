-- snoopy animals import
-- Generated at (UTC): 2026-05-08T16:16:01.951967+00:00
-- Animals: 11
-- Idempotent: skips rows where external_url already exists for this shelter.

insert into public.animals (shelter_id, city, name, description, species, status, published, image_urls, external_url)
select s.id, 'Pula', 'Boschko', '11 kg, 30 cm, mix, fokusiran na ljude, aktivan, uspješno mu je operiran lom zadnje lijeve noge, obiteljski pas, prijateljski, uskoro će se testirati, Cijepljen, Čipiran, Kastriran', 'dog', 'available', true, ARRAY['https://snoopy.hr/wp-content/uploads/2026/02/BOSCHKO-WEB.jpg', 'https://snoopy.hr/wp-content/uploads/2026/02/BOSCHKO2-WEB.jpg', 'https://snoopy.hr/wp-content/uploads/2026/02/BOSCHKO2-WEB-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2026/02/BOSCHKO3-WEB.jpg', 'https://snoopy.hr/wp-content/uploads/2026/02/BOSCHKO3-WEB-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2026/02/BOSCHKO4-WEB.jpg', 'https://snoopy.hr/wp-content/uploads/2026/02/BOSCHKO4-WEB-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2026/02/BOSCHKO5-WEB.jpg', 'https://snoopy.hr/wp-content/uploads/2026/02/BOSCHKO5-WEB-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2026/02/BOSCHKO-WEB-400x284.jpg']::text[], 'https://snoopy.hr/muzjaci/boschko/'
from public.shelters s
where s.name = 'Udruga Snoopy'
  and not exists (select 1 from public.animals a where a.external_url = 'https://snoopy.hr/muzjaci/boschko/')
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_urls, external_url)
select s.id, 'Pula', 'Gaston', '35 kg, 60 cm, mix, fokusiran na ljude, mirna energija, za iskusne vlasnike, prijateljski prema simpatijama, slaže se s macama, Cijepljen, Čipiran, Kastriran', 'dog', 'available', true, ARRAY['https://snoopy.hr/wp-content/uploads/2025/07/gaston9-web.jpg', 'https://snoopy.hr/wp-content/uploads/2025/07/GASTON20-WEB.jpg', 'https://snoopy.hr/wp-content/uploads/2025/07/GASTON20-WEB-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2025/07/GASTON19-WEB.jpg', 'https://snoopy.hr/wp-content/uploads/2025/07/GASTON19-WEB-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2025/07/GASTON18-WEB.jpg', 'https://snoopy.hr/wp-content/uploads/2025/07/GASTON18-WEB-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2025/07/GASTON17-WEB.jpg', 'https://snoopy.hr/wp-content/uploads/2025/07/GASTON17-WEB-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2025/07/GASTON16-WEB.jpg', 'https://snoopy.hr/wp-content/uploads/2025/07/GASTON16-WEB-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2025/07/GASTON15-WEB.jpg', 'https://snoopy.hr/wp-content/uploads/2025/07/GASTON15-WEB-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2025/07/GASTON14-WEB.jpg', 'https://snoopy.hr/wp-content/uploads/2025/07/GASTON14-WEB-400x284.jpg']::text[], 'https://snoopy.hr/muzjaci/gaston/'
from public.shelters s
where s.name = 'Udruga Snoopy'
  and not exists (select 1 from public.animals a where a.external_url = 'https://snoopy.hr/muzjaci/gaston/')
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_urls, external_url)
select s.id, 'Pula', 'Bigi', '24 kg, 52 cm, njemački ovčar mix, zaigran, aktivan, za iskusne vlasnike, prijateljski prema simpatijama, ne slaže se s macama, Cijepljen, Čipiran, Kastriran', 'dog', 'available', true, ARRAY['https://snoopy.hr/wp-content/uploads/2025/07/bigi16-web.jpg', 'https://snoopy.hr/wp-content/uploads/2025/07/bigi17-web.jpg', 'https://snoopy.hr/wp-content/uploads/2025/07/bigi17-web-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2025/07/bigi16-web-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2025/07/BIGI15-WEB.jpg', 'https://snoopy.hr/wp-content/uploads/2025/07/BIGI15-WEB-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2025/07/BIGI14-WEB.jpg', 'https://snoopy.hr/wp-content/uploads/2025/07/BIGI14-WEB-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2025/07/BIGI13-WEB.jpg', 'https://snoopy.hr/wp-content/uploads/2025/07/BIGI13-WEB-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2025/07/BIGI12-WEB.jpg', 'https://snoopy.hr/wp-content/uploads/2025/07/BIGI12-WEB-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2025/07/BIGI11-WEB.jpg', 'https://snoopy.hr/wp-content/uploads/2025/07/BIGI11-WEB-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2025/07/bigi10-web.jpg']::text[], 'https://snoopy.hr/muzjaci/gino/'
from public.shelters s
where s.name = 'Udruga Snoopy'
  and not exists (select 1 from public.animals a where a.external_url = 'https://snoopy.hr/muzjaci/gino/')
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_urls, external_url)
select s.id, 'Pula', 'Jello', '34 kg, 49 cm, mix, fokusiran na ljude, aktivan, obiteljski pas, prijateljski, uskoro će se testirati, Cijepljen, Čipiran, Kastriran', 'dog', 'available', true, ARRAY['https://snoopy.hr/wp-content/uploads/2026/04/jello4-web.jpg', 'https://snoopy.hr/wp-content/uploads/2026/04/jello2-web.jpg', 'https://snoopy.hr/wp-content/uploads/2026/04/jello2-web-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2026/04/jello3-web.jpg', 'https://snoopy.hr/wp-content/uploads/2026/04/jello3-web-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2026/04/jello4-web-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2026/04/jello5-web.jpg', 'https://snoopy.hr/wp-content/uploads/2026/04/jello5-web-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2026/04/jello6-web.jpg', 'https://snoopy.hr/wp-content/uploads/2026/04/jello6-web-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2026/04/jello-web.jpg', 'https://snoopy.hr/wp-content/uploads/2026/04/jello-web-400x284.jpg']::text[], 'https://snoopy.hr/muzjaci/jello/'
from public.shelters s
where s.name = 'Udruga Snoopy'
  and not exists (select 1 from public.animals a where a.external_url = 'https://snoopy.hr/muzjaci/jello/')
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_urls, external_url)
select s.id, 'Pula', 'Juma', '33 kg, 49 cm, mix, fokusiran na ljude, aktivan, obiteljski pas, prijateljski, uskoro će se testirati, Cijepljen, Čipiran, Kastriran', 'dog', 'available', true, ARRAY['https://snoopy.hr/wp-content/uploads/2026/04/juma4-web.jpg', 'https://snoopy.hr/wp-content/uploads/2026/04/juma2-web.jpg', 'https://snoopy.hr/wp-content/uploads/2026/04/juma2-web-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2026/04/juma3-web.jpg', 'https://snoopy.hr/wp-content/uploads/2026/04/juma3-web-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2026/04/juma4-web-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2026/04/juma5-web.jpg', 'https://snoopy.hr/wp-content/uploads/2026/04/juma5-web-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2026/04/juma6-web.jpg', 'https://snoopy.hr/wp-content/uploads/2026/04/juma6-web-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2026/04/juma-web.jpg', 'https://snoopy.hr/wp-content/uploads/2026/04/juma-web-400x284.jpg']::text[], 'https://snoopy.hr/muzjaci/juma/'
from public.shelters s
where s.name = 'Udruga Snoopy'
  and not exists (select 1 from public.animals a where a.external_url = 'https://snoopy.hr/muzjaci/juma/')
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_urls, external_url)
select s.id, 'Pula', 'Topaz', '38 kg, 60 cm, mix, zaigran, aktivan, za iskusne vlasnike, prijateljski prema simpatijama, slaže se s macama, Cijepljen, Čipiran, Kastriran', 'dog', 'available', true, ARRAY['https://snoopy.hr/wp-content/uploads/2025/07/TOPAZ4_WEB.jpg', 'https://snoopy.hr/wp-content/uploads/2025/07/topaz11-web.jpg', 'https://snoopy.hr/wp-content/uploads/2025/07/topaz11-web-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2025/07/topaz10-web.jpg', 'https://snoopy.hr/wp-content/uploads/2025/07/topaz10-web-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2025/07/topaz9-web.jpg', 'https://snoopy.hr/wp-content/uploads/2025/07/topaz9-web-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2025/07/TOPAZ8-WEB.jpg', 'https://snoopy.hr/wp-content/uploads/2025/07/TOPAZ8-WEB-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2025/07/TOPAZ6-WEB.jpg', 'https://snoopy.hr/wp-content/uploads/2025/07/TOPAZ6-WEB-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2025/07/TOPAZ5-WEB.jpg', 'https://snoopy.hr/wp-content/uploads/2025/07/TOPAZ5-WEB-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2025/07/TOPAZ4_WEB-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2025/07/TOPAZ3_WEB.jpg']::text[], 'https://snoopy.hr/muzjaci/topaz/'
from public.shelters s
where s.name = 'Udruga Snoopy'
  and not exists (select 1 from public.animals a where a.external_url = 'https://snoopy.hr/muzjaci/topaz/')
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_urls, external_url)
select s.id, 'Pula', 'Medo', '55 kg, 68 cm, mix, fokusiran na ljude, mirna energija, za iskusne vlasnike, prijateljski prema simpatijama, slaže se s macama, Cijepljen, Čipiran, Kastriran', 'dog', 'available', true, ARRAY['https://snoopy.hr/wp-content/uploads/2025/07/MEDO3-WEB.jpg', 'https://snoopy.hr/wp-content/uploads/2025/07/MEDO7-WEB.jpg', 'https://snoopy.hr/wp-content/uploads/2025/07/MEDO7-WEB-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2025/07/MEDO6-WEB.jpg', 'https://snoopy.hr/wp-content/uploads/2025/07/MEDO6-WEB-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2025/07/MEDO6-WEB-1.jpg', 'https://snoopy.hr/wp-content/uploads/2025/07/MEDO6-WEB-1-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2025/07/MEDO5-WEB.jpg', 'https://snoopy.hr/wp-content/uploads/2025/07/MEDO5-WEB-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2025/07/MEDO5-WEB-1.jpg', 'https://snoopy.hr/wp-content/uploads/2025/07/MEDO5-WEB-1-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2025/07/MEDO4-WEB.jpg', 'https://snoopy.hr/wp-content/uploads/2025/07/MEDO4-WEB-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2025/07/MEDO4-WEB-1.jpg', 'https://snoopy.hr/wp-content/uploads/2025/07/MEDO4-WEB-1-400x284.jpg']::text[], 'https://snoopy.hr/stariji_psi/medo/'
from public.shelters s
where s.name = 'Udruga Snoopy'
  and not exists (select 1 from public.animals a where a.external_url = 'https://snoopy.hr/stariji_psi/medo/')
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_urls, external_url)
select s.id, 'Pula', 'Iskra', '19 kg, 49 cm, mix, fokusirana na ljude, aktivna, obiteljski pas, prijateljski, uskoro će se testirati, Cijepljena, Čipirana, Kastrirana', 'dog', 'available', true, ARRAY['https://snoopy.hr/wp-content/uploads/2026/04/ISKRA6-WEB.jpg', 'https://snoopy.hr/wp-content/uploads/2026/04/ISKRA2-WEB.jpg', 'https://snoopy.hr/wp-content/uploads/2026/04/ISKRA2-WEB-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2026/04/ISKRA3-WEB.jpg', 'https://snoopy.hr/wp-content/uploads/2026/04/ISKRA3-WEB-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2026/04/ISKRA4-WEB.jpg', 'https://snoopy.hr/wp-content/uploads/2026/04/ISKRA4-WEB-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2026/04/ISKRA5-WEB.jpg', 'https://snoopy.hr/wp-content/uploads/2026/04/ISKRA5-WEB-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2026/04/ISKRA6-WEB-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2026/04/ISKRA7-WEB.jpg', 'https://snoopy.hr/wp-content/uploads/2026/04/ISKRA7-WEB-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2026/04/ISKRA-WEB.jpg', 'https://snoopy.hr/wp-content/uploads/2026/04/ISKRA-WEB-400x284.jpg']::text[], 'https://snoopy.hr/zenke/iskra/'
from public.shelters s
where s.name = 'Udruga Snoopy'
  and not exists (select 1 from public.animals a where a.external_url = 'https://snoopy.hr/zenke/iskra/')
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_urls, external_url)
select s.id, 'Pula', 'Lota', '18 kg, 50 cm, labby mix, fokusirana na ljude, aktivna, obiteljski pas, prijateljski, uskoro će se testirati, Cijepljena, Čipirana, Kastrirana', 'dog', 'available', true, ARRAY['https://snoopy.hr/wp-content/uploads/2026/04/LOTA6-WEB.jpg', 'https://snoopy.hr/wp-content/uploads/2026/04/LOTA2-WEB.jpg', 'https://snoopy.hr/wp-content/uploads/2026/04/LOTA2-WEB-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2026/04/LOTA3-WEB.jpg', 'https://snoopy.hr/wp-content/uploads/2026/04/LOTA3-WEB-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2026/04/LOTA4-WEB.jpg', 'https://snoopy.hr/wp-content/uploads/2026/04/LOTA4-WEB-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2026/04/LOTA5-WEB.jpg', 'https://snoopy.hr/wp-content/uploads/2026/04/LOTA5-WEB-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2026/04/LOTA6-WEB-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2026/04/LOTA-WEB.jpg', 'https://snoopy.hr/wp-content/uploads/2026/04/LOTA-WEB-400x284.jpg']::text[], 'https://snoopy.hr/zenke/lota/'
from public.shelters s
where s.name = 'Udruga Snoopy'
  and not exists (select 1 from public.animals a where a.external_url = 'https://snoopy.hr/zenke/lota/')
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_urls, external_url)
select s.id, 'Pula', 'Rosalia', '20 kg, 51 cm, mix, zaigrana, aktivna, obiteljski pas, prijateljski, uskoro će se testirati, Cijepljena, Čipirana, Kastrirana', 'dog', 'available', true, ARRAY['https://snoopy.hr/wp-content/uploads/2026/03/ROSALIA5-WEB.jpg', 'https://snoopy.hr/wp-content/uploads/2026/03/ROSALIA2-WEB.jpg', 'https://snoopy.hr/wp-content/uploads/2026/03/ROSALIA2-WEB-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2026/03/ROSALIA3-WEB.jpg', 'https://snoopy.hr/wp-content/uploads/2026/03/ROSALIA3-WEB-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2026/03/ROSALIA4-WEB.jpg', 'https://snoopy.hr/wp-content/uploads/2026/03/ROSALIA4-WEB-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2026/03/ROSALIA5-WEB-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2026/03/ROSALIA6-WEB.jpg', 'https://snoopy.hr/wp-content/uploads/2026/03/ROSALIA6-WEB-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2026/03/ROSALIA-WEB.jpg', 'https://snoopy.hr/wp-content/uploads/2026/03/ROSALIA-WEB-400x284.jpg']::text[], 'https://snoopy.hr/zenke/rosalia/'
from public.shelters s
where s.name = 'Udruga Snoopy'
  and not exists (select 1 from public.animals a where a.external_url = 'https://snoopy.hr/zenke/rosalia/')
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_urls, external_url)
select s.id, 'Pula', 'Sheila', '15 kg, 48 cm, mix, fokusirana na ljude, mirna energija, obiteljski pas, prijateljski, uskoro će se testirati, Cijepljena, Čipirana, Kastrirana', 'dog', 'available', true, ARRAY['https://snoopy.hr/wp-content/uploads/2026/03/SHEILA2-WEB.jpg', 'https://snoopy.hr/wp-content/uploads/2026/03/SHEILA2-WEB-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2026/03/SHEILA3-WEB.jpg', 'https://snoopy.hr/wp-content/uploads/2026/03/SHEILA3-WEB-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2026/03/SHEILA4-WEB.jpg', 'https://snoopy.hr/wp-content/uploads/2026/03/SHEILA4-WEB-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2026/03/SHEILA5-WEB.jpg', 'https://snoopy.hr/wp-content/uploads/2026/03/SHEILA5-WEB-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2026/03/SHEILA6-WEB.jpg', 'https://snoopy.hr/wp-content/uploads/2026/03/SHEILA6-WEB-400x284.jpg', 'https://snoopy.hr/wp-content/uploads/2026/03/SHEILA-WEB.jpg', 'https://snoopy.hr/wp-content/uploads/2026/03/SHEILA-WEB-400x284.jpg']::text[], 'https://snoopy.hr/zenke/sheila/'
from public.shelters s
where s.name = 'Udruga Snoopy'
  and not exists (select 1 from public.animals a where a.external_url = 'https://snoopy.hr/zenke/sheila/')
limit 1;
