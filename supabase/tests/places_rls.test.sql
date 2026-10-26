begin;
create extension if not exists pgtap with schema extensions;
select plan(20);
insert into public.places (id, source_key, name, category, barangay, publication_state) values
('00000000-0000-0000-0000-000000000001', 'test:published', '[TEST] Published', 'government', 'Tunasan', 'published'),
('00000000-0000-0000-0000-000000000002', 'test:draft', '[TEST] Draft', 'health', 'Poblacion', 'draft');
insert into public.place_sources (place_id, field_key, source_name, source_type, checked_at) values
('00000000-0000-0000-0000-000000000001', 'name', '[TEST] Evidence', 'official', now()),
('00000000-0000-0000-0000-000000000002', 'name', '[TEST] Draft evidence', 'field_visit', now());
set local role anon;
select is((select count(*)::integer from public.places where id = '00000000-0000-0000-0000-000000000001'), 1, 'anon reads published places');
select is((select count(*)::integer from public.places where id = '00000000-0000-0000-0000-000000000002'), 0, 'anon cannot read draft places');
select throws_ok($test$insert into public.places (source_key,name,category,barangay) values ('test:write','[TEST] Write','government','Tunasan')$test$, '42501', 'permission denied for table places', 'anon cannot insert places');
select throws_ok($test$update public.places set name = '[TEST] Changed'$test$, '42501', 'permission denied for table places', 'anon cannot update places');
select throws_ok($test$delete from public.places$test$, '42501', 'permission denied for table places', 'anon cannot delete places');
select is((select count(*)::integer from public.place_sources where place_id = '00000000-0000-0000-0000-000000000001'), 1, 'anon reads published place_sources');
select is((select count(*)::integer from public.place_sources where place_id = '00000000-0000-0000-0000-000000000002'), 0, 'anon cannot read draft place_sources');
select throws_ok($test$insert into public.place_sources (place_id,field_key,source_name,source_type,checked_at) values ('00000000-0000-0000-0000-000000000001','name','[TEST] Write','official',now())$test$, '42501', 'permission denied for table place_sources', 'anon cannot insert place_sources');
select throws_ok($test$update public.place_sources set source_name = '[TEST] Changed'$test$, '42501', 'permission denied for table place_sources', 'anon cannot update place_sources');
select throws_ok($test$delete from public.place_sources$test$, '42501', 'permission denied for table place_sources', 'anon cannot delete place_sources');
reset role;
set local role authenticated;
select is((select count(*)::integer from public.places where id = '00000000-0000-0000-0000-000000000001'), 1, 'authenticated reads published places');
select is((select count(*)::integer from public.places where id = '00000000-0000-0000-0000-000000000002'), 0, 'authenticated cannot read draft places');
select throws_ok($test$insert into public.places (source_key,name,category,barangay) values ('test:write','[TEST] Write','government','Tunasan')$test$, '42501', 'permission denied for table places', 'authenticated cannot insert places');
select throws_ok($test$update public.places set name = '[TEST] Changed'$test$, '42501', 'permission denied for table places', 'authenticated cannot update places');
select throws_ok($test$delete from public.places$test$, '42501', 'permission denied for table places', 'authenticated cannot delete places');
select is((select count(*)::integer from public.place_sources where place_id = '00000000-0000-0000-0000-000000000001'), 1, 'authenticated reads published place_sources');
select is((select count(*)::integer from public.place_sources where place_id = '00000000-0000-0000-0000-000000000002'), 0, 'authenticated cannot read draft place_sources');
select throws_ok($test$insert into public.place_sources (place_id,field_key,source_name,source_type,checked_at) values ('00000000-0000-0000-0000-000000000001','name','[TEST] Write','official',now())$test$, '42501', 'permission denied for table place_sources', 'authenticated cannot insert place_sources');
select throws_ok($test$update public.place_sources set source_name = '[TEST] Changed'$test$, '42501', 'permission denied for table place_sources', 'authenticated cannot update place_sources');
select throws_ok($test$delete from public.place_sources$test$, '42501', 'permission denied for table place_sources', 'authenticated cannot delete place_sources');
reset role;
select * from finish();
rollback;
