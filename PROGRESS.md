# Progress — moderation flows + real data import

Last worked on: 2026-10-22. Session was paused mid-Phase B.

`npm run build` and `npm run lint` both pass on the current state. Nothing is
half-applied in a broken way; the only incomplete piece is the data import
(bottom of this file).

---

## Phase A — moderation action flows: DONE (build + lint green)

Implements accept / reject / request-info / re-open / withdraw, plus applying
accepted corrections to the place they point at.

| File | What changed |
|---|---|
| `src/types/index.ts` | `Correction.newValue`, `Correction.rejectReason`, `CorrectionStatus` + `'withdrawn'`, new `RejectReason` type, `AccessInfo.hoursNote` |
| `src/lib/mockApi.ts` | `FLOW_RULES` transition table (single source of truth), `availableDecisions` / `availableSubmitterActions`, `moderateCorrection`, `replyToCorrection`, `withdrawCorrection`, `applyToPlace` (verification outcomes), `FIELD_APPLIERS`, `sessionSubmissionCount`, fetch* now return array copies |
| `src/components/corrections/CorrectionActions.tsx` | NEW — inline moderator panel; buttons derived from `availableDecisions` so UI can't offer an illegal action |
| `src/pages/ModerationPage.tsx` | Takes `session` prop, role gate, actions wired with optimistic update + snapshot rollback, `withdrawn` filter chip |
| `src/pages/SubmitCorrectionPage.tsx` | Captures exact replacement text (`newValue`; category Select), session rate note, links to the tracker |
| `src/pages/MyCorrectionsPage.tsx` | NEW — `/corrections` status tracker with reply + withdraw |
| `src/components/corrections/CorrectionStatusBadge.tsx` | `withdrawn` entry, widened tone union |
| `src/components/places/AccessInfoPanel.tsx` | Renders `hoursNote` |
| `src/data/mockCorrections.ts` | New fields + a seeded `needs_more_info` item (`corr-005`, owned by `'You (mock session)'`) so the reply flow is demoable |
| `src/data/mockPlaces.ts` | `hoursNote: null` on all six mock places |
| `src/App.tsx` | `/corrections` route; passes `mockSession` into `ModerationPage` |

### Rules encoded (do not re-litigate without reason)

- `pending` → `in_review` (start review) → `accepted` | `rejected` | `needs_more_info`; `accepted`/`rejected` → `in_review` (re-open); `pending` → `withdrawn` (submitter only); `needs_more_info` → `in_review` (submitter reply).
- Note required for: reject, request_info, reopen, reply, and accept out of `needs_more_info`.
- Reject requires a reason: `spam` or `conflict`; `conflict` sets the place's verification to `disputed`.
- Accept with "I confirmed this in person" ticked → place `verified` + fresh `lastCheckedAt`. Unticked: place was `verified` → `needs_recheck`; otherwise → `community_reported` with corroborations + 1.
- `newValue` writes into the place only for `name`/`address`/`access`/`hours`/`landmarks`; `category` only when the value is a real category; `other` never auto-applies.

### Still to verify (no test runner in this repo)

Manual checklist, in the dev server:
1. Accept `corr-001` → place-002 becomes `community_reported`, corroborations 3→4.
2. Reject with no note → blocked. With note + `conflict` → corr-002's place becomes `disputed`.
3. Accept a place that was `verified`, unticked → `needs_recheck`. Same accept with the tick → `verified`.
4. `corr-005` → reply as submitter on `/corrections` → goes back to `in_review`; moderator sees the reply in `submitterNote`.
5. Re-open an accepted item → `resolvedBy`/`resolvedAt` cleared.
6. Withdraw a freshly submitted pending item → `withdrawn`, no actions left.

---

## Phase B — real data import: PARTIAL

### Done

- `scripts/import-osm.mjs` + `npm run import:osm` — Overpass importer that writes `src/data/importedPlaces.ts`, mapping OSM tags to `PlaceCategory` and marking every entry `awaiting_review` with `verification.method` = the OSM source.
- `src/data/importedPlaces.ts` exists but currently holds **0 places** (written by a run that found nothing) and **is not yet wired into the app**.

### Blocked on an external outage

All five public Overpass instances were down/saturated when this was tried:
api.de `502 at capacity`, kumi.systems + private.coffee hang, mail.ru `504`,
osm.jp unreachable. This is not a code problem — retry later.

Two notes for the retry:
- The area filter originally used `admin_level=8`. In OSM, **Philippine cities are
  `admin_level=6`; barangays are `8`** — the OSM script still needs this corrected,
  and it should fail loudly instead of writing an empty file.
- Fallback that works over plain HTTPS: HOT's HDX export
  `https://production-raw-data-api.s3.amazonaws.com/ISO3/PHL/points_of_interest/hotosm_phl_points_of_interest_osm_geojson.zip`
  (33MB, ODbL). It was downloaded and extracted to
  `C:\Users\ckzz2\AppData\Local\Temp\opencode\phl-poi\` (temp dir — may be wiped).
  Useful fields: `name`, `name_en`, `name_fil`, `amenity`, `shop`, `tourism`,
  `opening_ho`, `addr_*`, `adm3_name` (city = "Muntinlupa"), `adm4_name` (barangay).

### Next steps, in order

1. Retry `npm run import:osm` (after fixing `admin_level=6` + fail-on-empty), **or** write
   `scripts/import-geojson.mjs` to convert the HDX GeoJSON to `importedPlaces.ts`
   (filter `adm3_name === 'Muntinlupa'`). Re-download the zip if the temp dir is gone.
2. Wire it up in `src/lib/mockApi.ts`:
   `import { importedPlaces } from '@/data/importedPlaces'` and
   `fetchPlaces` → `delay([...mockPlaces, ...importedPlaces])`; `fetchPlaceById` searches both.
3. Widen `BOUNDS` in `src/components/map/MapPlaceholder.tsx` — it is currently tuned to the
   mock coordinates (~14.392–14.415 lat, 121.026–121.049 lng) and will clamp real
   Muntinlupa places (~14.355–14.475, ~120.995–121.105) to the edges.
4. Honesty edits: the Explore subtitle says "All data below is mock/prototype data" and
   README §6 says no real Muntinlupa names are used anywhere. Both become false once
   real OSM places are imported — update them, and keep the OSM attribution
   ("© OpenStreetMap contributors, ODbL") visible.
5. Optional: `docs/data-sourcing-plan.md` is referenced by `mockPlaces.ts` but does not
   exist — either create it or drop the reference.

### Data sources discussed (for the DOH/DepEd/city-site half)

- DOH National Health Facility Registry — `nhfr.doh.gov.ph/VActivefacilitiesList` (CSV/Excel per region)
- City Government of Muntinlupa — `muntinlupacity.gov.ph/barangays/` and `/departments-offices/`
- DepEd EBEIS masterlist — `ebeis.deped.gov.ph/beis/reports_info/masterlist` (Region NCR / SDO Muntinlupa City)
- CHED HEI list — `ched.gov.ph/list-higher-education-institutions`; FOI route works (`foi.gov.ph`)
- Pilot scope was agreed as 2–3 barangays first (suggested: Tunasan + Poblacion), not the whole city.
