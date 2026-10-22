# Muntinlupa Explorer — Boilerplate / Prototype

A mobile-first app (and web app) concept to help residents and visitors of
**Muntinlupa City, Philippines** find local places and navigate with an
honest picture of how trustworthy the information actually is.

**This is a boilerplate/prototype, not a production app.** It uses
clearly-labeled mock data, a non-functional placeholder map, and no live
services or deployments. Nothing in it should be read as verified
information about real places in Muntinlupa.

---

## 1. Project foundation

### Target users

- **Residents** who know the area broadly but want quick, trustworthy
  answers about a specific office, clinic, or service point — especially
  ones they don't visit often (e.g. a barangay hall, a rarely-used
  government office).
- **Visitors** (balikbayans, tourists, people visiting for business or
  errands) with little local knowledge, who need orientation help:
  addresses that make sense on the ground, not just on paper, and realistic
  walking directions.
- **Residents with mobility needs** (wheelchair users, elderly residents,
  parents with strollers) for whom "is the entrance actually accessible"
  matters more than the fact that a place merely exists.
- **Community contributors** — residents willing to submit corrections or
  confirm details, who need a low-friction way to do that and to see their
  contribution's status.
- **Moderators** (could be city staff, barangay volunteers, or trusted
  community members) who need a manageable queue and enough signal to
  triage quickly without specialized tools.

### Core use cases

1. "I need to find the nearest [health center / barangay hall / market]
   and actually be able to locate its entrance."
2. "I'm not sure if this information is current — can I tell at a glance?"
3. "I noticed something is wrong or outdated — how do I report it, and
   will anything happen?"
4. "I want to walk from A to B — has anyone actually confirmed this path
   is walkable, or is it just a straight line on a map?"
5. (Moderator) "A correction came in — is it plausible, and what's already
   known about this place?"

### MVP scope (what a real MVP — not this prototype — would include)

**In scope for MVP:**
- Searchable list + map of places with core categories relevant to daily
  life (government, health, transport, education, markets, parks).
- Place detail pages with address, entrance/access notes, and nearby
  landmarks.
- Transparent verification/freshness indicators on every place.
- A basic correction-submission flow with status tracking.
- A minimal moderation queue (even if staffed manually at first).
- A small set of walking routes between commonly-paired places (e.g.
  "barangay hall to the nearest market"), each labeled mapped-only vs
  field-verified.

**Explicitly out of scope for MVP** (later phases):
- Turn-by-turn live navigation.
- User accounts / social features (following, profiles, leaderboards).
- Automated spam detection beyond simple heuristics.
- Business listings, ads, or paid placement.
- Multi-city expansion.

### Key design principles

1. **Never overstate certainty.** Every place and route carries an
   explicit, visible status. "We don't know yet" is a legitimate and
   frequently-used state, not something to hide.
2. **Color is never the only signal.** Verification state is always icon +
   label + color together, for accessibility and for printed/grayscale
   contexts.
3. **Plain language over jargon.** "Mapped only — not field-checked" beats
   a vague "unverified" badge with no explanation.
4. **Mobile-first, outdoors-first.** This is used standing on a sidewalk in
   daylight, often on a mid-range phone. High contrast and large tap
   targets matter more than visual flourish.
5. **Local naming is a first-class citizen.** Alternate/informal names
   residents actually use (not just official signage names) are part of
   the data model, not an afterthought.
6. **Corrections are a conversation, not a black hole.** Submitters can see
   what happened to their report.
7. **Extend, don't rebuild.** The mock data layer, map component, and
   verification model are built so later phases can swap implementations
   (real map SDK, real backend, real auth) without rewriting the UI layer.

---

## 2. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | React 19 + TypeScript | Matches your existing React/TS/Vite projects (e.g. QuestTime); strong typing helps keep the verification/trust model consistent. |
| Build tool | Vite 8 | Fast local dev, simple static output, easy to deploy later. |
| Styling | Tailwind CSS v4 | Utility-first, fast to iterate on mobile layouts; theme tokens defined once in `src/index.css`. |
| Routing | React Router v7 | Standard, lightweight client-side routing for a handful of screens. |
| Icons | lucide-react | Consistent icon set, tree-shakeable. |
| Data layer | In-memory mock data + a thin `lib/mockApi.ts` wrapper | Lets every component call "API-shaped" async functions now, so swapping in a real backend later is a one-file change. |
| Map | Custom `MapPlaceholder` component (no SDK) | Avoids wiring a real map provider / API key before there's real geodata worth showing. Clearly labeled as a placeholder. |

No backend, database, auth provider, or map SDK is connected. Everything
runs client-side against mock arrays.

---

## 3. Setup instructions

```bash
# from the project folder
npm install
npm run dev       # starts Vite dev server (shows a local URL, e.g. http://localhost:5173)
npm run build      # type-checks and builds a static production bundle into dist/
npm run preview    # serves the built dist/ bundle locally, for a final check
npm run lint       # runs oxlint
```

Requires Node.js 20+ (anything reasonably current works with Vite 8).

Nothing needs an `.env` file yet — there are no API keys or live services in
this prototype. When a real map provider or backend is added later, keep
their keys in environment variables (`.env.local`, git-ignored), never
hard-coded in components.

---

## 4. Folder structure

```
src/
├── components/
│   ├── layout/        AppShell, TopBar (desktop), BottomNav (mobile)
│   ├── ui/             Generic primitives: Button, Card, Badge, Chip,
│   │                    TextInput, TextArea, Select, EmptyState
│   ├── map/            MapPlaceholder (dev-only placeholder map)
│   ├── places/         PlaceCard, AccessInfoPanel, LandmarkList,
│   │                    PhotoPlaceholders, categoryMeta
│   ├── verification/   VerificationBadge, FreshnessNote
│   ├── routes/          RouteVerificationBadge
│   └── corrections/    CorrectionStatusBadge, TrustSignalMeter
├── pages/               One component per route (Explore, PlaceDetail,
│                        Routes, RouteDetail, SubmitCorrection, Moderation)
├── data/                Mock data arrays, clearly labeled as fictional
├── types/               Shared TypeScript types — the actual data model
├── lib/
│   ├── mockApi.ts       Thin async wrapper around the mock data (the
│   │                     seam where a real API client will plug in later)
│   └── cn.ts            Small classname helper
├── App.tsx              Router setup + mock session
├── main.tsx             Entry point
└── index.css            Tailwind import + theme tokens + base styles
```

This is organized by **feature domain** (places, verification, routes,
corrections) rather than by file type, so a later phase can grow any one
area — e.g. turning `corrections/` into a richer moderation tool — without
reshuffling everything else.

---

## 5. Data model

Defined in `src/types/index.ts`. Highlights:

- **`Place`** — name, category, barangay, address, placeholder
  coordinates, `AccessInfo` (entrance notes, wheelchair access, parking),
  nearby landmarks, alternate/local names, and a `VerificationMeta` block.
- **`VerificationMeta`** — `state` (`verified` / `community_reported` /
  `awaiting_review` / `needs_recheck` / `disputed`), `lastCheckedAt`,
  `method`, `checkedBy`, `corroborations`. This is deliberately more
  granular than a yes/no "verified" flag.
- **`WalkingRoute`** — start/end place, placeholder path points, distance,
  estimated time, and a **separate** `RouteVerificationState`
  (`mapped_only` / `field_verified` / `field_verified_stale`) plus a
  mandatory `uncertaintyNote` that's always rendered, never optional.
- **`Correction`** — the field being corrected, proposed change, submitter
  note, status (`pending` / `in_review` / `accepted` / `rejected` /
  `needs_more_info`), and a placeholder `trustSignalScore` standing in for
  a future real spam/abuse signal.

---

## 6. What's mock, and what real data collection would involve

**Everything in `src/data/*.ts` is fictional**, prefixed `[MOCK]` and
marked with large comments at the top of each file. No real Muntinlupa
place names, addresses, coordinates, entrances, or routes are used
anywhere in this prototype — that was a deliberate choice, not an
oversight, since inventing "plausible-looking" real-world details would be
far more misleading than obvious placeholders.

**Data that will eventually need trustworthy sourcing:**
- Official place names, categories, and addresses — candidate sources:
  LGU/barangay directories, DOH facility lists (for health), DepEd/CHED
  listings (for schools), OpenStreetMap as a starting scaffold (not a
  source of truth on its own).
- Entrance/access details, parking, wheelchair accessibility — this is
  exactly the kind of detail that's rarely in any official dataset and
  genuinely needs **in-person verification**, which is why the data model
  treats it as a first-class verifiable fact rather than a static field.
- Nearby landmarks and informal/local names — best sourced from residents
  directly, since these are inherently local knowledge.
- Walking paths — should come from actual walks (a volunteer or staff
  member walking the route with a GPS trace), not generated from a routing
  engine alone, if the app wants to claim "field-verified."

**Suggested approach for a later phase:**
1. Start with a small, bounded pilot area (a few barangays) rather than
   the whole city, so a small volunteer/staff team can realistically
   field-verify a meaningful fraction of entries.
2. Seed structural data (names, categories, rough locations) from
   OpenStreetMap + any available LGU open data, but mark everything
   `awaiting_review` until checked.
3. Recruit community verifiers (residents, barangay volunteers, local
   student groups) with a simple checklist matching the `AccessInfo`
   fields, so verification is consistent across contributors.
4. Treat the correction/moderation flow built here as the main ongoing
   maintenance mechanism once the initial seed is verified — freshness
   should be expected to decay, and `needs_recheck` should trigger
   automatically after a set time window (e.g. 6–12 months), not rely on
   someone remembering.
5. Any partnership with the Muntinlupa City LGU or barangays should be
   treated as the most credible source for official details (addresses,
   office hours), with community reports supplementing — never replacing —
   that where available.

---

## 7. Accessibility, performance, privacy & safety notes

**Accessibility**
- All interactive elements use a 44×44px minimum tap target
  (`.tap-target` utility).
- Verification/status information is always icon + label + color, never
  color alone.
- Visible focus rings on all focusable elements (important for keyboard
  and switch-device users doing wayfinding, not just mouse users).
- A "skip to content" link is included in `AppShell`.
- Form fields use associated `<label>` elements, not placeholder-only
  labels.
- This prototype hasn't been run through a screen reader or formal audit
  yet — that's a concrete to-do before any real release, not something to
  assume is solved by the above.

**Mobile performance**
- No map SDK, tile loading, or large JS dependency is included yet —
  the placeholder map is pure CSS/SVG. When a real map is added, lazy-load
  it (route-level code splitting) so it doesn't block the initial paint of
  text-heavy screens like place lists.
- Images are represented as labeled placeholder blocks, not loaded — a
  real build should use responsive images and lazy loading once photos
  exist.

**Privacy**
- No real accounts, auth, or tracking exist in this prototype — the
  "session" is a single hard-coded mock object.
- Submitter identity in `Correction.submittedBy` is deliberately generic
  ("Resident (mock, anonymized)") — a real system should think carefully
  about how much identity is actually needed to deter abuse vs. how much
  exposes contributors, especially since some corrections (e.g. "this
  gate is unsafe at night") could be sensitive to attribute publicly.
- No location is actually read from the user's device in this prototype —
  "near me" style features would need an explicit permission prompt and a
  clear explanation of why, when added.

**Safety**
- Route uncertainty notes are mandatory and rendered prominently — a later
  phase should resist any pressure to hide or shrink these in the name of
  a cleaner UI; they're the main thing standing between "convenient" and
  "someone walks into traffic because the app implied a sidewalk exists."
- Entrance/access notes for sensitive categories (e.g. `emergency_services`)
  should get extra verification priority in a real rollout, since being
  wrong there matters more.

**Locally relevant names**
- `Place.alternateNames` exists specifically so informal/local names
  (e.g. what residents actually call a place, as opposed to its signage
  name) are stored and searchable, not discarded in favor of only the
  "official" name.

---

## 8. Phased roadmap

**Phase 0 — Boilerplate/prototype (this delivery)**
Mock data, placeholder map, core screens, component library, no live
services. ✅ Done.

**Phase 1 — MVP**
- Replace the mock data layer with a real backend (API + database) behind
  the same `lib/mockApi.ts`-shaped interface.
- Wire up a real map provider (e.g. MapLibre GL with OSM tiles, or Google
  Maps if budget allows) behind the same `MapPlaceholder` component
  interface.
- Real authentication for contributors and moderators, with real
  moderation actions (accept/reject/request-info) instead of the
  read-only queue here.
- Begin the pilot-area data collection described in Section 6.
- Accessibility audit with real assistive-tech testing.

**Phase 2 — Production hardening**
- Real abuse/spam protection (rate limiting, trust scoring informed by
  actual submission history, not the placeholder meter).
- Automated freshness decay (`needs_recheck` triggers on a schedule).
- Offline support / low-connectivity resilience (service worker caching
  of recently-viewed places).
- Expand beyond the pilot area, city-wide.
- Formal privacy review and a public privacy policy.
- Performance budget enforcement (bundle size, image weight) given
  real map tiles and real photos will be heavier than this prototype.

**Phase 3 — Growth**
- Multi-barangay moderation delegation (local moderators per area).
- Partnerships with the LGU / barangays for authoritative data feeds.
- Possibly multi-city expansion using the same architecture.

---

*Only Phase 0 has been implemented. Say the word if you'd like to move
into Phase 1 (real backend, real map, real auth) — none of that has been
started yet.*
