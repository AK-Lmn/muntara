# Muntara public services pilot

**Status:** Draft for user approval  
**Date:** 2026-10-27

## Intent

Build a polished Muntara prototype that can also serve as a useful local guide. The first pilot covers Tunasan and Poblacion, helping residents find public government offices, clinics, and schools, understand what each location offers, and report information that needs correction.

## Decisions from the conversation

- The project should serve both as a polished prototype and as a guide residents can use.
- Start in Tunasan and Poblacion.
- Include every public-facing government office in those barangays, plus public clinics and schools.
- Build the full pilot: real listings and map, with corrections that persist and moderation that works.
- Keep public browsing and correction submission account-free; put sign-in in a separate admin area.

## Current state

The project uses React, TypeScript, and Vite. Explore, place details, correction submission, tracking, and moderation exist, but read and write in-memory arrays. The current session and moderator role are hard-coded. Imported OpenStreetMap data is empty and not wired into the app. `MapPlaceholder` draws markers on a grid without streets or a map service. Existing places and walking routes are explicitly fictional.

This pilot must replace fictional place records in resident-facing views. Walking routes stay out of the pilot until real routes can be checked and represented honestly.

## Goals

- Provide a complete, searchable directory for the two pilot barangays.
- Show real locations on a usable mobile map and in a list. Let visitors browse without signing in.
- Give each listing a name, type, barangay, address, and map location. Show public contact details, hours, and services when reliable sources provide them. Show entrance and accessibility notes only when checked. Show “not confirmed” when a field is unknown.
- Show where each fact came from and when it was last checked. Distinguish information confirmed by an official source from details checked at the location; an official listing alone must not imply a field check.
- Let anyone submit a correction without an account. Give each report a private receipt code or link that lets its submitter check status and answer a request for more information after returning later.
- Let authenticated moderators review, accept, reject, or request more information in a separate admin area. Keep an audit history and do not treat an accepted community report as an on-site check.
- Preserve the prototype’s mobile-first layout, clear trust labels, and accessible controls.

## Scope boundary

“Government office” means a public-facing government service location physically inside Tunasan or Poblacion. Include barangay offices, city offices or service desks, and national-agency service points when they operate in either barangay. Include public clinics and government-run schools or learning centers. Exclude private clinics and schools, internal offices without public visitors, and facilities outside the two barangay boundaries even when they serve residents there. Give distinct public-facing services separate listings when they share an address; the map may cluster their pins.

Do not claim the pilot is complete until available official directories have been reconciled with the barangays and relevant facility owners. Keep a visible coverage state such as “pilot listings in progress” while gaps remain. Never invent an office, address, service, phone number, schedule, entrance, or coordinate to fill a gap.

## Data and trust

Use the city’s Tunasan and Poblacion pages, its department directory and GIS catalogue, DepEd’s Muntinlupa school inventory, and DOH or other official facility listings as source leads. These pages provide useful records, but the research so far does not prove that any one directory is complete or current. Confirm the inventory with the relevant barangay or agency. OpenStreetMap can help locate candidate map points; it is not proof of an office’s services, hours, access, or current operation. Keep required attribution if OSM data or tiles are used.

Store source URL or citation, source type, and date checked for each listing and relevant field. Preserve a separate field-check date and method for entrance and access information. On the page, use plain labels such as “Official source checked” and “Visited in person.” Keep unknown or conflicting details visible as unknown or disputed. Do not expose employee names or personal contact details unless they are published as the office’s public contact.

## Corrections and access

Use Supabase as the default managed backend: Postgres for places, sources, field checks, corrections, and moderation history; Supabase Auth for administrators and moderators only. This is a design choice based on the existing React/Vite app and the need for durable corrections. Public browsing and correction submission require no account. Submit corrections through a server-side endpoint that creates an unguessable private receipt code; store only a hash of the code. A separate server-side receipt handler validates the code and returns only that report’s status and submitter-facing replies; it cannot edit public place data. Users must save the code or link; it cannot be recovered if lost. Apply server-side rate limits and spam checks to anonymous submissions and lookups. Moderators must be explicitly assigned a privileged role; users cannot grant themselves moderator access. Database row-level security must enforce public read access and moderator actions. Explicitly grant only the client operations each table needs, and never use user-editable profile metadata to authorize moderators. Keep privileged keys out of browser code.

New corrections enter the review queue and do not overwrite official or field-checked facts automatically. A moderator decision records who acted, when, and why. An accepted community correction remains community-reported until a reliable source or field check confirms it. Do not collect contributor accounts or email addresses. Show a contributor only the report they can access with its receipt code. Store the receipt code as a hash.

Full moderation audit history is visible only to moderators. Each contributor can see their own correction status and the user-facing decision note. The public sees no correction audit history.

## Approaches

1. **Directory pilot:** add sourced listings, provenance labels, and a real map for the two barangays. This is quicker and supports lookup, but corrections cannot persist for ongoing maintenance.
2. **Full local pilot — selected:** add the same listings and map, plus anonymous durable correction tracking and a separate authenticated admin area. This takes longer but supports both a credible demo and continued community use without requiring public sign-up.

The user selected the full local pilot. The existing React/TypeScript/Vite stack stays in place. Supabase is the proposed backend call above. The map provider remains a builder choice; it must work on phones, show clear attribution, and use a tile service whose terms fit the pilot.

## Non-goals

- Citywide coverage in the first pilot.
- Private businesses or private schools and clinics.
- Turn-by-turn navigation or walking routes.
- Public social profiles, leaderboards, or collection of sensitive personal or health information.
- Public user accounts or sign-up.
- Presenting mock locations, mock routes, or unconfirmed access details as real.

## Acceptance conditions

- Every facility found in the confirmed pilot inventory is accounted for, with unresolved coverage gaps shown plainly.
- No fictional place or route appears as real pilot content.
- Each published listing has a source record and a visible confidence state. Unknown hours, services, contact details, and access details remain unknown.
- Residents can find a listing by name, barangay, and type, and can open it from the list or a correctly located map marker.
- Anyone can submit a correction without signing up and receive a private receipt code or link. It retrieves only that report’s status and submitter-facing decision note; it cannot expose other reports or modify place records.
- A moderator can sign in to the separate admin area, review a correction, choose a valid decision, and leave a durable audit record. Contributors see only their own status and decision note; the public sees no audit history.
- The map and correction flows work on a phone, with keyboard-accessible controls and status labels that do not rely on color alone.

## Calls left to the builder

- Reconcile and document complete official source inventories, checking data terms before copying or importing records.
- Design the database schema and migrations around field-level provenance and the existing correction transitions.
- Implement private receipt-code access safely, including hashed token storage, rate limits, and protection against report enumeration and spam.
- Choose a map library and suitable tile provider after checking current usage terms and likely pilot traffic.
- Plan the public pilot’s release and operating ownership for source updates, moderator invitations, correction review, and rechecks.

## Preliminary source references

- [Tunasan barangay profile](https://muntinlupacity.gov.ph/barangays/brgy-tunasan/)
- [Poblacion barangay profile](https://muntinlupacity.gov.ph/barangays/brgy-poblacion/)
- [City Health Office](https://muntinlupacity.gov.ph/departments-offices/city-health-office/)
- [Muntinlupa GIS catalogue](https://cgis.muntinlupacity.gov.ph/catalogue/)
- [DepEd Muntinlupa school inventory](https://nid.deped.gov.ph/public-dashboard/region/NCR/division/Muntinlupa%20City?filter=submitted)
- [DOH National TB Control Program facility record for Tunasan Health Center](https://ntp.doh.gov.ph/view-facility/?id=13140)
- [Supabase React Auth guide](https://supabase.com/docs/guides/auth/quickstarts/react)
- [Supabase Row Level Security guide](https://supabase.com/docs/guides/database/postgres/row-level-security)
