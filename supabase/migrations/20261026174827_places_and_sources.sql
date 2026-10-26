create table public.places (
  id uuid primary key default gen_random_uuid(),
  source_key text not null unique check (btrim(source_key) <> ''),
  name text not null check (btrim(name) <> ''),
  category text not null check (category in ('government', 'health', 'education')),
  barangay text not null check (barangay in ('Tunasan', 'Poblacion')),
  address text,
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  description text not null default '',
  services text[] not null default '{}',
  public_phone text,
  public_email text,
  entrance_notes text not null default '',
  wheelchair_access text not null default 'unknown' check (wheelchair_access in ('yes', 'no', 'partial', 'unknown')),
  parking_notes text,
  hours_note text,
  additional_notes text,
  nearby_landmarks jsonb not null default '[]' check (jsonb_typeof(nearby_landmarks) = 'array'),
  tags text[] not null default '{}',
  alternate_names text[] not null default '{}',
  verification_state text not null default 'awaiting_review' check (verification_state in ('verified', 'community_reported', 'awaiting_review', 'needs_recheck', 'disputed')),
  last_checked_at timestamptz,
  verification_method text,
  checked_by text,
  corroborations integer not null default 0 check (corroborations >= 0),
  photo_placeholder_count integer not null default 0 check (photo_placeholder_count >= 0),
  publication_state text not null default 'draft' check (publication_state in ('draft', 'published')),
  check ((latitude is null) = (longitude is null))
);

create table public.place_sources (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  field_key text not null check (btrim(field_key) <> ''),
  source_name text not null check (btrim(source_name) <> ''),
  source_url text,
  source_type text not null check (source_type in ('official', 'field_visit', 'openstreetmap')),
  checked_at timestamptz not null,
  -- OSM can support coordinates only; service/access claims need separate evidence.
  check (source_type <> 'openstreetmap' or field_key = 'location')
);

create index place_sources_place_id_idx on public.place_sources(place_id);

alter table public.places enable row level security;
alter table public.place_sources enable row level security;
revoke all on public.places, public.place_sources from public, anon, authenticated;
grant select on public.places, public.place_sources to anon, authenticated;
grant all on public.places, public.place_sources to service_role;

create policy published_places_read on public.places
  for select to anon, authenticated
  using (publication_state = 'published');

create policy published_place_sources_read on public.place_sources
  for select to anon, authenticated
  using (exists (
    select 1 from public.places
    where places.id = place_sources.place_id and places.publication_state = 'published'
  ));
