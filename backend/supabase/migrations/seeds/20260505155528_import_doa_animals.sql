-- doa animals import
-- Generated at (UTC): 2026-05-05T15:55:28.033294+00:00
-- Animals: 36
-- Idempotent: skips rows where external_url already exists for this shelter.

insert into public.animals (shelter_id, city, name, description, species, status, published, image_url, external_url)
select s.id, 'Amsterdam', 'Pieter', 'Europese Korthaar, mannelijk, 7 Mar 2021', 'cat', 'available', true, 'https://doa-dierenasiel.nl/wp-content/uploads/kenneldata/57639_1.jpg', 'https://doa-dierenasiel.nl/adoptiedieren/pieter/'
from public.shelters s
where s.name = 'DOA dierenasiel'
  and not exists (select 1 from public.animals a where a.external_url = 'https://doa-dierenasiel.nl/adoptiedieren/pieter/')
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_url, external_url)
select s.id, 'Amsterdam', 'Mila', 'Chihuahua, vrouwelijk, 29 Jul 2015', 'dog', 'available', true, 'https://doa-dierenasiel.nl/wp-content/uploads/kenneldata/59554_1.jpg', 'https://doa-dierenasiel.nl/adoptiedieren/mila/'
from public.shelters s
where s.name = 'DOA dierenasiel'
  and not exists (select 1 from public.animals a where a.external_url = 'https://doa-dierenasiel.nl/adoptiedieren/mila/')
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_url, external_url)
select s.id, 'Amsterdam', 'Max', 'Chihuahua, mannelijk, 29 Jul 2017', 'dog', 'available', true, 'https://doa-dierenasiel.nl/wp-content/uploads/kenneldata/59553_1.jpg', 'https://doa-dierenasiel.nl/adoptiedieren/max-2/'
from public.shelters s
where s.name = 'DOA dierenasiel'
  and not exists (select 1 from public.animals a where a.external_url = 'https://doa-dierenasiel.nl/adoptiedieren/max-2/')
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_url, external_url)
select s.id, 'Amsterdam', 'Lucky', 'Europese Korthaar, vrouwelijk, 24 Aug 2015', 'cat', 'available', true, 'https://doa-dierenasiel.nl/wp-content/uploads/kenneldata/59751_1.jpg', 'https://doa-dierenasiel.nl/adoptiedieren/lucky/'
from public.shelters s
where s.name = 'DOA dierenasiel'
  and not exists (select 1 from public.animals a where a.external_url = 'https://doa-dierenasiel.nl/adoptiedieren/lucky/')
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_url, external_url)
select s.id, 'Amsterdam', 'Lizzy', 'Border Collie, vrouwelijk, 5 Jun 2023', 'dog', 'available', true, 'https://doa-dierenasiel.nl/wp-content/uploads/kenneldata/59415_1.jpg', 'https://doa-dierenasiel.nl/adoptiedieren/lizzy/'
from public.shelters s
where s.name = 'DOA dierenasiel'
  and not exists (select 1 from public.animals a where a.external_url = 'https://doa-dierenasiel.nl/adoptiedieren/lizzy/')
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_url, external_url)
select s.id, 'Amsterdam', 'Polleke', 'Europese Korthaar, vrouwelijk, 14 May 2025', 'cat', 'available', true, 'https://doa-dierenasiel.nl/wp-content/uploads/kenneldata/59640_1.jpg', 'https://doa-dierenasiel.nl/adoptiedieren/polleke/'
from public.shelters s
where s.name = 'DOA dierenasiel'
  and not exists (select 1 from public.animals a where a.external_url = 'https://doa-dierenasiel.nl/adoptiedieren/polleke/')
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_url, external_url)
select s.id, 'Amsterdam', 'Tonic', 'Onbekend, vrouwelijk, 1 Mar 2022', 'rabbit', 'available', true, 'https://doa-dierenasiel.nl/wp-content/uploads/kenneldata/51928_1.jpg', 'https://doa-dierenasiel.nl/adoptiedieren/tonic/'
from public.shelters s
where s.name = 'DOA dierenasiel'
  and not exists (select 1 from public.animals a where a.external_url = 'https://doa-dierenasiel.nl/adoptiedieren/tonic/')
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_url, external_url)
select s.id, 'Amsterdam', 'Zippy', 'Konijn, mannelijk, 14 Feb 2022', 'rabbit', 'available', true, 'https://doa-dierenasiel.nl/wp-content/uploads/kenneldata/50044_1.jpg', 'https://doa-dierenasiel.nl/adoptiedieren/zippy/'
from public.shelters s
where s.name = 'DOA dierenasiel'
  and not exists (select 1 from public.animals a where a.external_url = 'https://doa-dierenasiel.nl/adoptiedieren/zippy/')
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_url, external_url)
select s.id, 'Amsterdam', 'Flakey', 'Kruising groot, vrouwelijk, 30 Sep 2024', 'dog', 'available', true, 'https://doa-dierenasiel.nl/wp-content/uploads/kenneldata/57918_1.jpg', 'https://doa-dierenasiel.nl/adoptiedieren/flakey-2/'
from public.shelters s
where s.name = 'DOA dierenasiel'
  and not exists (select 1 from public.animals a where a.external_url = 'https://doa-dierenasiel.nl/adoptiedieren/flakey-2/')
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_url, external_url)
select s.id, 'Amsterdam', 'Floris', 'Europese Korthaar, mannelijk, 1 Jan 2020', 'cat', 'available', true, 'https://doa-dierenasiel.nl/wp-content/uploads/kenneldata/59440_1.jpg', 'https://doa-dierenasiel.nl/adoptiedieren/floris/'
from public.shelters s
where s.name = 'DOA dierenasiel'
  and not exists (select 1 from public.animals a where a.external_url = 'https://doa-dierenasiel.nl/adoptiedieren/floris/')
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_url, external_url)
select s.id, 'Amsterdam', 'Brink', 'Europese Korthaar, mannelijk, 30 Aug 2024', 'cat', 'available', true, 'https://doa-dierenasiel.nl/wp-content/uploads/kenneldata/58669_1.jpg', 'https://doa-dierenasiel.nl/adoptiedieren/brink/'
from public.shelters s
where s.name = 'DOA dierenasiel'
  and not exists (select 1 from public.animals a where a.external_url = 'https://doa-dierenasiel.nl/adoptiedieren/brink/')
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_url, external_url)
select s.id, 'Amsterdam', 'Max', 'Perzische Kat, mannelijk, 7 Apr 2023', 'cat', 'available', true, 'https://doa-dierenasiel.nl/wp-content/uploads/kenneldata/59368_1.jpg', 'https://doa-dierenasiel.nl/adoptiedieren/max/'
from public.shelters s
where s.name = 'DOA dierenasiel'
  and not exists (select 1 from public.animals a where a.external_url = 'https://doa-dierenasiel.nl/adoptiedieren/max/')
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_url, external_url)
select s.id, 'Amsterdam', 'Tjemp', 'Bengaal, mannelijk, 18 May 2024', 'cat', 'available', true, 'https://doa-dierenasiel.nl/wp-content/uploads/kenneldata/59655_1.jpg', 'https://doa-dierenasiel.nl/adoptiedieren/tjemp/'
from public.shelters s
where s.name = 'DOA dierenasiel'
  and not exists (select 1 from public.animals a where a.external_url = 'https://doa-dierenasiel.nl/adoptiedieren/tjemp/')
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_url, external_url)
select s.id, 'Amsterdam', 'Boeffie', 'Europese Korthaar, mannelijk, 30 Mar 2022', 'cat', 'available', true, 'https://doa-dierenasiel.nl/wp-content/uploads/kenneldata/59615_1.jpg', 'https://doa-dierenasiel.nl/adoptiedieren/boeffie/'
from public.shelters s
where s.name = 'DOA dierenasiel'
  and not exists (select 1 from public.animals a where a.external_url = 'https://doa-dierenasiel.nl/adoptiedieren/boeffie/')
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_url, external_url)
select s.id, 'Amsterdam', 'Poeski', 'Maine Coon, vrouwelijk, 18 Mar 2015', 'cat', 'available', true, 'https://doa-dierenasiel.nl/wp-content/uploads/kenneldata/59650_1.jpg', 'https://doa-dierenasiel.nl/adoptiedieren/poeski/'
from public.shelters s
where s.name = 'DOA dierenasiel'
  and not exists (select 1 from public.animals a where a.external_url = 'https://doa-dierenasiel.nl/adoptiedieren/poeski/')
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_url, external_url)
select s.id, 'Amsterdam', 'Grace', 'Rhodesian Ridgeback, vrouwelijk, 1 Jan 2021', 'dog', 'available', true, 'https://doa-dierenasiel.nl/wp-content/uploads/kenneldata/59450_1.jpg', 'https://doa-dierenasiel.nl/adoptiedieren/grace/'
from public.shelters s
where s.name = 'DOA dierenasiel'
  and not exists (select 1 from public.animals a where a.external_url = 'https://doa-dierenasiel.nl/adoptiedieren/grace/')
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_url, external_url)
select s.id, 'Amsterdam', 'Jessie', 'Siberische Husky, vrouwelijk, 13 Mar 2022', 'dog', 'available', true, 'https://doa-dierenasiel.nl/wp-content/uploads/kenneldata/59451_1.jpg', 'https://doa-dierenasiel.nl/adoptiedieren/jessie-bella/'
from public.shelters s
where s.name = 'DOA dierenasiel'
  and not exists (select 1 from public.animals a where a.external_url = 'https://doa-dierenasiel.nl/adoptiedieren/jessie-bella/')
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_url, external_url)
select s.id, 'Amsterdam', 'Poez', 'Europese Korthaar, mannelijk, 27 Nov 2019', 'cat', 'available', true, 'https://doa-dierenasiel.nl/wp-content/uploads/kenneldata/53043_1.jpg', 'https://doa-dierenasiel.nl/adoptiedieren/poez/'
from public.shelters s
where s.name = 'DOA dierenasiel'
  and not exists (select 1 from public.animals a where a.external_url = 'https://doa-dierenasiel.nl/adoptiedieren/poez/')
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_url, external_url)
select s.id, 'Amsterdam', 'Zorah', 'Rhodesian Ridgeback, vrouwelijk, 1 Apr 2019', 'dog', 'available', true, 'https://doa-dierenasiel.nl/wp-content/uploads/kenneldata/59449_1.jpg', 'https://doa-dierenasiel.nl/adoptiedieren/zorah/'
from public.shelters s
where s.name = 'DOA dierenasiel'
  and not exists (select 1 from public.animals a where a.external_url = 'https://doa-dierenasiel.nl/adoptiedieren/zorah/')
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_url, external_url)
select s.id, 'Amsterdam', 'Penne', 'Europese Korthaar, vrouwelijk, 25 Jun 2025', 'cat', 'available', true, 'https://doa-dierenasiel.nl/wp-content/uploads/kenneldata/58505_1.jpg', 'https://doa-dierenasiel.nl/adoptiedieren/penne/'
from public.shelters s
where s.name = 'DOA dierenasiel'
  and not exists (select 1 from public.animals a where a.external_url = 'https://doa-dierenasiel.nl/adoptiedieren/penne/')
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_url, external_url)
select s.id, 'Amsterdam', 'Spaghetti', 'Europese Korthaar, mannelijk, 10 Jun 2025', 'cat', 'available', true, 'https://doa-dierenasiel.nl/wp-content/uploads/kenneldata/58506_1.jpg', 'https://doa-dierenasiel.nl/adoptiedieren/spaghetti/'
from public.shelters s
where s.name = 'DOA dierenasiel'
  and not exists (select 1 from public.animals a where a.external_url = 'https://doa-dierenasiel.nl/adoptiedieren/spaghetti/')
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_url, external_url)
select s.id, 'Amsterdam', 'Akira Amarok', 'Siberische Husky, mannelijk, 5 Nov 2019', 'dog', 'available', true, 'https://doa-dierenasiel.nl/wp-content/uploads/kenneldata/59228_1.jpg', 'https://doa-dierenasiel.nl/adoptiedieren/akira-amarok/'
from public.shelters s
where s.name = 'DOA dierenasiel'
  and not exists (select 1 from public.animals a where a.external_url = 'https://doa-dierenasiel.nl/adoptiedieren/akira-amarok/')
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_url, external_url)
select s.id, 'Amsterdam', 'Taxus', 'Rhodesian Ridgeback, vrouwelijk, 15 Jan 2023', 'dog', 'available', true, 'https://doa-dierenasiel.nl/wp-content/uploads/kenneldata/59134_1.jpg', 'https://doa-dierenasiel.nl/adoptiedieren/taxus/'
from public.shelters s
where s.name = 'DOA dierenasiel'
  and not exists (select 1 from public.animals a where a.external_url = 'https://doa-dierenasiel.nl/adoptiedieren/taxus/')
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_url, external_url)
select s.id, 'Amsterdam', 'Bugs', 'Onbekend, mannelijk,', 'rabbit', 'available', true, 'https://doa-dierenasiel.nl/wp-content/uploads/kenneldata/59725_1.jpg', 'https://doa-dierenasiel.nl/adoptiedieren/bugs/'
from public.shelters s
where s.name = 'DOA dierenasiel'
  and not exists (select 1 from public.animals a where a.external_url = 'https://doa-dierenasiel.nl/adoptiedieren/bugs/')
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_url, external_url)
select s.id, 'Amsterdam', 'Mitzi', 'Europese Korthaar, vrouwelijk, 13 Jun 2011', 'cat', 'available', true, 'https://doa-dierenasiel.nl/wp-content/uploads/kenneldata/58131_1.jpg', 'https://doa-dierenasiel.nl/adoptiedieren/mitzi/'
from public.shelters s
where s.name = 'DOA dierenasiel'
  and not exists (select 1 from public.animals a where a.external_url = 'https://doa-dierenasiel.nl/adoptiedieren/mitzi/')
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_url, external_url)
select s.id, 'Amsterdam', 'Gatito', 'Europese Korthaar, mannelijk, 8 Apr 2021', 'cat', 'available', true, 'https://doa-dierenasiel.nl/wp-content/uploads/kenneldata/59548_1.jpg', 'https://doa-dierenasiel.nl/adoptiedieren/gatito/'
from public.shelters s
where s.name = 'DOA dierenasiel'
  and not exists (select 1 from public.animals a where a.external_url = 'https://doa-dierenasiel.nl/adoptiedieren/gatito/')
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_url, external_url)
select s.id, 'Amsterdam', 'Jonko', 'Europese Korthaar, vrouwelijk, 20 May 2020', 'cat', 'available', true, 'https://doa-dierenasiel.nl/wp-content/uploads/kenneldata/59465_1.jpg', 'https://doa-dierenasiel.nl/adoptiedieren/jonko/'
from public.shelters s
where s.name = 'DOA dierenasiel'
  and not exists (select 1 from public.animals a where a.external_url = 'https://doa-dierenasiel.nl/adoptiedieren/jonko/')
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_url, external_url)
select s.id, 'Amsterdam', 'Joep', 'Europese Korthaar, mannelijk, 24 May 2021', 'cat', 'available', true, 'https://doa-dierenasiel.nl/wp-content/uploads/kenneldata/59466_1.jpg', 'https://doa-dierenasiel.nl/adoptiedieren/joep-2/'
from public.shelters s
where s.name = 'DOA dierenasiel'
  and not exists (select 1 from public.animals a where a.external_url = 'https://doa-dierenasiel.nl/adoptiedieren/joep-2/')
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_url, external_url)
select s.id, 'Amsterdam', 'Susan', 'Shih Tzu, vrouwelijk, 1 Sep 2012', 'dog', 'available', true, 'https://doa-dierenasiel.nl/wp-content/uploads/kenneldata/59136_1.jpg', 'https://doa-dierenasiel.nl/adoptiedieren/susan/'
from public.shelters s
where s.name = 'DOA dierenasiel'
  and not exists (select 1 from public.animals a where a.external_url = 'https://doa-dierenasiel.nl/adoptiedieren/susan/')
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_url, external_url)
select s.id, 'Amsterdam', 'Kalash', 'Kruising groot, mannelijk, 5 Jan 2021', 'dog', 'available', true, 'https://doa-dierenasiel.nl/wp-content/uploads/kenneldata/59216_1.jpg', 'https://doa-dierenasiel.nl/adoptiedieren/kalash/'
from public.shelters s
where s.name = 'DOA dierenasiel'
  and not exists (select 1 from public.animals a where a.external_url = 'https://doa-dierenasiel.nl/adoptiedieren/kalash/')
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_url, external_url)
select s.id, 'Amsterdam', 'Mvr. Appelboom', 'Rhodesian Ridgeback, vrouwelijk, 11 Aug 2022', 'dog', 'available', true, 'https://doa-dierenasiel.nl/wp-content/uploads/kenneldata/59130_1.jpg', 'https://doa-dierenasiel.nl/adoptiedieren/mvr-appelboom-6/'
from public.shelters s
where s.name = 'DOA dierenasiel'
  and not exists (select 1 from public.animals a where a.external_url = 'https://doa-dierenasiel.nl/adoptiedieren/mvr-appelboom-6/')
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_url, external_url)
select s.id, 'Amsterdam', 'Linde', 'Rhodesian Ridgeback, vrouwelijk, 11 Dec 2022', 'dog', 'available', true, 'https://doa-dierenasiel.nl/wp-content/uploads/kenneldata/59129_1.jpg', 'https://doa-dierenasiel.nl/adoptiedieren/linde-5/'
from public.shelters s
where s.name = 'DOA dierenasiel'
  and not exists (select 1 from public.animals a where a.external_url = 'https://doa-dierenasiel.nl/adoptiedieren/linde-5/')
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_url, external_url)
select s.id, 'Amsterdam', 'Meneer Walnoot', 'Rhodesian Ridgeback, mannelijk, 15 Dec 2021', 'dog', 'available', true, 'https://doa-dierenasiel.nl/wp-content/uploads/kenneldata/59132_1.jpg', 'https://doa-dierenasiel.nl/adoptiedieren/meneer-walnoot/'
from public.shelters s
where s.name = 'DOA dierenasiel'
  and not exists (select 1 from public.animals a where a.external_url = 'https://doa-dierenasiel.nl/adoptiedieren/meneer-walnoot/')
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_url, external_url)
select s.id, 'Amsterdam', 'Poekie', 'Europese Korthaar, vrouwelijk, 4 Feb 2014', 'cat', 'available', true, 'https://doa-dierenasiel.nl/wp-content/uploads/kenneldata/59260_1.jpg', 'https://doa-dierenasiel.nl/adoptiedieren/poekie/'
from public.shelters s
where s.name = 'DOA dierenasiel'
  and not exists (select 1 from public.animals a where a.external_url = 'https://doa-dierenasiel.nl/adoptiedieren/poekie/')
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_url, external_url)
select s.id, 'Amsterdam', 'Heester', 'Europese Korthaar, mannelijk, 31 Jan 2024', 'cat', 'available', true, 'https://doa-dierenasiel.nl/wp-content/uploads/kenneldata/59347_1.jpg', 'https://doa-dierenasiel.nl/adoptiedieren/heester/'
from public.shelters s
where s.name = 'DOA dierenasiel'
  and not exists (select 1 from public.animals a where a.external_url = 'https://doa-dierenasiel.nl/adoptiedieren/heester/')
limit 1;

insert into public.animals (shelter_id, city, name, description, species, status, published, image_url, external_url)
select s.id, 'Amsterdam', 'Boem', 'Amerikaanse Staffordshire Terrier, mannelijk, 1 Jan 2024', 'dog', 'available', true, 'https://doa-dierenasiel.nl/wp-content/uploads/kenneldata/58589_1.jpg', 'https://doa-dierenasiel.nl/adoptiedieren/boem/'
from public.shelters s
where s.name = 'DOA dierenasiel'
  and not exists (select 1 from public.animals a where a.external_url = 'https://doa-dierenasiel.nl/adoptiedieren/boem/')
limit 1;
