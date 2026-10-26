# Public Directory and Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a sourced, searchable public directory and real map for government offices, public clinics, and public schools in Tunasan and Poblacion.

**Architecture:** React reads published place records and field-level source evidence from Supabase through `src/lib/placeApi.ts`. A Leaflet map shows only records with coordinates; list and detail views show source confidence and unknown fields plainly.

**Tech Stack:** React 19, TypeScript, Vite 8, Supabase Postgres and `@supabase/supabase-js` 2.118.0, Leaflet 1.9.4, Tailwind CSS 4.

**Spec:** `docs/superpowers/specs/2026-10-27-muntinlupa-public-services-pilot-design.md`

## Global Constraints

- Start in Tunasan and Poblacion.
- Include every public-facing government office in those barangays, plus public clinics and schools.
- Never invent an office, address, service, phone number, schedule, entrance, or coordinate to fill a gap.
- Distinguish information confirmed by an official source from details checked at the location.
- Keep unknown or conflicting details visible as unknown or disputed.
- OpenStreetMap can help locate candidate map points; it is not proof of an office’s services, hours, access, or current operation.
- Keep required map attribution visible; do not prefetch tiles or offer offline tile downloads.
- Walking routes stay out of the pilot until real routes can be checked and represented honestly.

## Review Focus

- A source row points outside the two pilot barangays or duplicates another service location: reject or resolve it before import.
- A listing has no checked coordinate: keep it in the directory and show no map pin.
- A contact, hour, or access field has no supporting evidence: show “not confirmed.”
- Two public services share one address: preserve separate directory records and keep their map markers selectable.
- Map tiles fail to load: keep search, list, and place details usable and show a map error state.

---

## File Map

- `supabase/migrations/`: place and source-evidence schema with public-read-only policies.
- `supabase/tests/places_rls.test.sql`: anonymous and authenticated access assertions.
- `src/types/index.ts`: place, barangay, and source-evidence contracts.
- `src/lib/supabaseClient.ts`: browser client using publishable configuration only.
- `src/lib/placeApi.ts`: published place reads.
- `data/pilot-places.json` and `scripts/import-pilot-places.mjs`: reviewed source inventory and repeatable import.
- `src/components/map/PlaceMap.tsx`: Leaflet map with the existing marker-selection contract.
- `src/pages/ExplorePage.tsx`, `PlaceDetailPage.tsx`, `PlaceCard.tsx`, and `AccessInfoPanel.tsx`: public browse and detail experience.
- `src/components/places/PlaceSourcesPanel.tsx`: visible source and check history.
- `src/App.tsx`, `AppShell.tsx`, `TopBar.tsx`, and `BottomNav.tsx`: public-only navigation; mock correction, moderation, and route screens stay unmounted until their own live implementation.

### Task 1: Create the public place data boundary

**Files:**
- Create: `supabase/config.toml`
- Create: `supabase/migrations/<generated>_places_and_sources.sql`
- Create: `supabase/tests/places_rls.test.sql`
- Create: `src/lib/supabaseClient.ts`
- Modify: `src/types/index.ts`
- Modify: `package.json`, `package-lock.json`
- Modify: `.env.example` only if added; keep real credentials in ignored `.env.local`

**Interfaces:**
- `createSupabaseClient(): SupabaseClient` reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`; it must fail with a clear setup error when either is absent.
- Add `PilotBarangay = 'Tunasan' | 'Poblacion'`.
- Add `PlaceSource { id: string; fieldKey: string; sourceName: string; sourceUrl: string | null; sourceType: 'official' | 'field_visit' | 'openstreetmap'; checkedAt: string }`.
- Extend `Place` with `services: string[]`, `publicPhone: string | null`, `publicEmail: string | null`, `sources: PlaceSource[]`, and `location: GeoPoint | null`.
- Persist place fields used by `Place`: name, category, barangay, address, coordinates, description, services, public contact, access information, verification state, and publication state. Store source evidence in `place_sources`, one row per place and field.

- [ ] **Step 1: Initialize local Supabase configuration**

Run `supabase --help`, then `supabase init` using the installed CLI. Keep the CLI configuration and migrations in the repository; do not link a hosted project in this task.

- [ ] **Step 2: Create the place/source migration**

Run `supabase migration --help`, then create the migration with the CLI. Constrain `barangay` to Tunasan or Poblacion, `category` to government, health, or education, and coordinates to valid latitude/longitude ranges. Permit null address or coordinates when a reliable source has not confirmed them. Add a stable unique `source_key` for imports.

- [ ] **Step 3: Add public read policies and explicit grants**

Enable RLS on both tables. Grant anonymous and authenticated clients only `SELECT`; policies return published places and their source evidence only. Deny client writes. Keep privileged import keys out of browser code.

- [ ] **Step 4: Add the TypeScript contract and browser client**

Implement the interfaces above. Pin `@supabase/supabase-js` to `2.118.0` in `package.json` and commit the lockfile change when implementation begins.

- [ ] **Step 5: Add database access assertions**

In `supabase/tests/places_rls.test.sql`, assert that anonymous and ordinary authenticated roles can read published place/source rows, cannot read drafts, and cannot insert, update, or delete either table.

- [ ] **Step 6: Run the local database checks**

Run: `supabase start` then `supabase test db`  
Expected: all place/source RLS assertions pass.

### Task 2: Build the reviewed pilot inventory and import

**Files:**
- Create: `docs/data-sources/tunasan-poblacion-inventory.md`
- Create: `data/pilot-places.json`
- Create: `scripts/import-pilot-places.mjs`
- Create: `scripts/import-pilot-places.test.mjs`
- Modify: `.gitignore` if needed to exclude `.env.local`

**Interfaces:**
- `scripts/import-pilot-places.mjs --input data/pilot-places.json` validates all rows before writing, then idempotently upserts by `source_key`.
- Each JSON record contains `sourceKey`, `name`, `category`, `barangay`, `address`, `location`, `description`, `services`, `publicPhone`, `publicEmail`, `access`, and `sources`.
- Each non-null public fact has at least one `sources` entry with `fieldKey`, `sourceName`, `sourceUrl`, `sourceType`, and `checkedAt`.

- [ ] **Step 1: Write importer validation cases**

Use Node’s built-in test runner. Cover a valid record, unsupported barangay/category, duplicate `sourceKey`, invalid coordinates, and a public fact without evidence.

- [ ] **Step 2: Run importer tests and confirm they fail**

Run: `node --test scripts/import-pilot-places.test.mjs`  
Expected: FAIL because the validator is not implemented.

- [ ] **Step 3: Reconcile source records into the inventory**

Use the official city, barangay, DepEd, and DOH source leads in the design document. Record the source URL and access date for every fact. Confirm each facility is physically in the pilot boundary before including it. Use OSM only as a coordinate lead, and keep that evidence labeled as OSM. Leave uncertain fields null and track coverage gaps; do not claim completeness until the barangays or facility owners reconcile the inventory.

- [ ] **Step 4: Implement validation and idempotent import**

Read the import key only from `SUPABASE_URL` and `SUPABASE_SECRET_KEY` in the local process environment. Validate the entire file before the first write. Upsert places and source rows by stable keys. Never echo secrets or write them to the JSON file.

- [ ] **Step 5: Run importer tests and load the local pilot data**

Run: `node --test scripts/import-pilot-places.test.mjs`  
Expected: all validation cases pass. Then import the reviewed file into local Supabase and confirm a second import creates no duplicates.

### Task 3: Replace mock place reads and expose provenance

**Files:**
- Create: `src/lib/placeApi.ts`
- Create: `src/components/places/PlaceSourcesPanel.tsx`
- Modify: `src/pages/ExplorePage.tsx`
- Modify: `src/pages/PlaceDetailPage.tsx`
- Modify: `src/components/places/PlaceCard.tsx`
- Modify: `src/components/places/AccessInfoPanel.tsx`
- Modify: `src/components/verification/VerificationBadge.tsx` and `FreshnessNote.tsx` as needed

**Interfaces:**
- `fetchPlaces(): Promise<Place[]>` returns published rows with source evidence.
- `fetchPlaceById(id: string): Promise<Place | null>` returns one published row or `null`.
- `PlaceSourcesPanel({ sources }: { sources: PlaceSource[] })` displays source type, source link when present, and check date.

- [ ] **Step 1: Implement Supabase read functions**

Create `placeApi.ts`; return typed results and surface request errors to pages. Remove place reads from `mockApi.ts` only after both public pages use the new functions.

- [ ] **Step 2: Add list filters and truthful empty/error states**

In Explore, preserve text/category/verification filters and add a barangay filter. Search name, barangay, services, and alternate names. Replace mock-data copy with the two-barangay pilot coverage state. Keep results usable while map coordinates are missing.

- [ ] **Step 3: Add sources and practical place details**

Show address, services, public contact, hours, access notes, source evidence, and the distinct official-source and field-check states. Display “not confirmed” for null values. Remove placeholder photos, unsourced landmarks, and mock route links from the detail page.

- [ ] **Step 4: Review with sourced and incomplete records**

Open one record with official contact/hours and one with unknown fields. Confirm evidence and unknown labels remain visible and the page does not call a source-only record field-verified.

### Task 4: Replace the grid with a real map

**Files:**
- Create: `src/components/map/PlaceMap.tsx`
- Remove: `src/components/map/MapPlaceholder.tsx` after all imports move
- Modify: `src/main.tsx`
- Modify: `src/pages/ExplorePage.tsx`
- Modify: `src/pages/PlaceDetailPage.tsx`
- Modify: `package.json`, `package-lock.json`
- Modify: `.env.example` with non-secret map settings

**Interfaces:**
- `PlaceMap({ places, selectedPlaceId, onSelectPlace, className }: { places: Place[]; selectedPlaceId?: string | null; onSelectPlace?: (id: string) => void; className?: string })` retains the placeholder’s selection contract.
- Read `VITE_MAP_TILE_URL` and `VITE_MAP_ATTRIBUTION`; use a documented low-volume pilot tile source and visible attribution.

- [ ] **Step 1: Install Leaflet and type definitions**

Pin `leaflet` to `1.9.4` and `@types/leaflet` to `1.9.22` in `package.json`; commit the lockfile change when implementation begins.

- [ ] **Step 2: Implement the Leaflet component lifecycle**

Create the map once in `useEffect`, retain the map and marker layer in refs, update markers when place or selection props change, and remove the map on unmount. Skip markers with null coordinates. A marker click calls `onSelectPlace(place.id)`.

- [ ] **Step 3: Configure attribution and map behavior**

Import Leaflet CSS in `src/main.tsx`. Fit the viewport to valid pilot coordinates; use a single-point zoom when only one coordinate exists. Keep the list available when tiles fail. Do not prefetch tiles or offer offline downloads. Use the required visible attribution and a map-issue link.

- [ ] **Step 4: Check map behavior in the browser**

Confirm multiple markers, selected-marker state, a record with no coordinate, tile failure, mobile sizing, and visible attribution. The official OSM tile service is best-effort and has no SLA; confirm its current policy before public use or change the configured provider.

### Task 5: Make the public shell match the pilot

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/layout/AppShell.tsx`
- Modify: `src/components/layout/TopBar.tsx`
- Modify: `src/components/layout/BottomNav.tsx`
- Modify: `README.md`

- [ ] **Step 1: Remove prototype-only screens from public routes**

Remove mock route pages and current in-memory correction/moderation pages from `App.tsx` and public navigation. The second plan restores corrections only after they use durable anonymous receipts and a separate admin sign-in.

- [ ] **Step 2: Remove the hard-coded public session**

Remove `mockSession` from `App.tsx`, the `session` prop from `AppShell` and `TopBar`, and the public moderation tab. Use the project name Muntara and label the current coverage as Tunasan and Poblacion.

- [ ] **Step 3: Update project documentation**

Replace README claims that all data are fictional with the actual pilot-source workflow, unknown-field rules, current coverage gaps, and OSM attribution/provider policy.

- [ ] **Step 4: Run the public-directory checks**

Run: `npm run build` and `npm run lint`  
Expected: both pass. In the browser, verify search, all filters, list/detail navigation, empty/error states, and that no mock place or route appears as real pilot content.

## References

- [Leaflet quick start](https://leafletjs.com/examples/quick-start)
- [OpenStreetMap tile usage policy](https://operations.osmfoundation.org/policies/tiles/)
- Official data leads are listed in the [design document](../specs/2026-10-27-muntinlupa-public-services-pilot-design.md).
