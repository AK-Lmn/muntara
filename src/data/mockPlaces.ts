import type { Place } from '@/types'

/**
 * ============================================================================
 * ⚠️ MOCK DATA — NOT REAL MUNTINLUPA LOCATIONS ⚠️
 * ============================================================================
 * Every place below is a FICTIONAL placeholder invented for prototyping UI
 * and interaction flows. Names, addresses, coordinates, access notes, and
 * landmarks are made up and must NOT be treated as verified facts about
 * actual places in Muntinlupa City. Coordinates are rough placeholders
 * within Muntinlupa's general area for map-rendering purposes only.
 *
 * Before any real launch, every record here must be replaced with data
 * collected and checked through the process described in
 * `docs/data-sourcing-plan.md`.
 * ============================================================================
 */

export const mockPlaces: Place[] = [
  {
    services: [],
    publicPhone: null,
    publicEmail: null,
    sources: [],
    id: 'place-001',
    name: '[MOCK] Barangay Placeholder Hall — Sample Barangay',
    category: 'government',
    barangay: 'Sample Barangay',
    address: '[MOCK ADDRESS] 123 Placeholder Street, Sample Barangay, Muntinlupa City',
    location: { lat: 14.4081, lng: 121.0415 },
    description:
      'Placeholder description of a barangay hall used to prototype the place-detail layout. Replace with verified copy sourced from an on-site visit or official barangay listing.',
    access: {
      entranceNotes:
        '[MOCK] Example entrance note: "Main entrance is placeholder-facing, near a placeholder landmark."',
      wheelchairAccess: 'unknown',
      parkingNotes: '[MOCK] Placeholder parking note — needs field confirmation.',
      hoursNote: null,
      additionalNotes: '[MOCK] Placeholder note about gate hours or guard checkpoints.',
    },
    nearbyLandmarks: [
      { name: '[MOCK] Placeholder Chapel', relativePosition: 'Across the street (example)' },
      { name: '[MOCK] Sample Elementary School', relativePosition: '2 blocks north (example)' },
    ],
    tags: ['government office', 'barangay services', 'example tag'],
    alternateNames: ['[MOCK] Also called "Placeholder Hall" locally'],
    verification: {
      state: 'verified',
      lastCheckedAt: '2026-09-02',
      method: '[MOCK] Example: visited in person by a prototype tester',
      checkedBy: 'Prototype tester',
      corroborations: 3,
    },
    photoPlaceholderCount: 3,
  },
  {
    services: [],
    publicPhone: null,
    publicEmail: null,
    sources: [],
    id: 'place-002',
    name: '[MOCK] Sample Public Market',
    category: 'shopping',
    barangay: 'Placeholder Poblacion',
    address: '[MOCK ADDRESS] Market Road corner Sample Street, Placeholder Poblacion, Muntinlupa City',
    location: { lat: 14.3994, lng: 121.0359 },
    description:
      'Placeholder market entry demonstrating a busier, multi-entrance location with mixed verification state.',
    access: {
      entranceNotes:
        '[MOCK] Example: "Two entrances in this placeholder scenario — a placeholder main gate and a placeholder side gate used mostly by vendors."',
      wheelchairAccess: 'partial',
      parkingNotes: '[MOCK] Placeholder: limited street parking, example only.',
      hoursNote: null,
      additionalNotes: null,
    },
    nearbyLandmarks: [
      { name: '[MOCK] Placeholder Jeepney Terminal', relativePosition: 'Right outside the main gate (example)' },
    ],
    tags: ['market', 'food', 'example tag'],
    alternateNames: [],
    verification: {
      state: 'community_reported',
      lastCheckedAt: '2026-08-14',
      method: '[MOCK] Example: submitted by a community member, not yet field-checked',
      checkedBy: 'Community contributor (mock)',
      corroborations: 1,
    },
    photoPlaceholderCount: 2,
  },
  {
    services: [],
    publicPhone: null,
    publicEmail: null,
    sources: [],
    id: 'place-003',
    name: '[MOCK] Placeholder Health Center',
    category: 'health',
    barangay: 'Sample Barangay',
    address: '[MOCK ADDRESS] 45 Wellness Ave (placeholder), Sample Barangay, Muntinlupa City',
    location: { lat: 14.4123, lng: 121.0442 },
    description:
      'Placeholder health-center entry used to prototype the "awaiting review" verification state.',
    access: {
      entranceNotes: '[MOCK] Placeholder entrance note — not yet confirmed.',
      wheelchairAccess: 'unknown',
      parkingNotes: null,
      hoursNote: null,
      additionalNotes: '[MOCK] Example note: hours may vary, needs confirmation.',
    },
    nearbyLandmarks: [],
    tags: ['health center', 'example tag'],
    alternateNames: [],
    verification: {
      state: 'awaiting_review',
      lastCheckedAt: null,
      method: null,
      checkedBy: null,
      corroborations: 0,
    },
    photoPlaceholderCount: 0,
  },
  {
    services: [],
    publicPhone: null,
    publicEmail: null,
    sources: [],
    id: 'place-004',
    name: '[MOCK] Placeholder Riverside Park',
    category: 'park_recreation',
    barangay: 'Placeholder Riverside',
    address: '[MOCK ADDRESS] Riverside Walk (placeholder), Placeholder Riverside, Muntinlupa City',
    location: { lat: 14.3951, lng: 121.0287 },
    description:
      'Placeholder park entry used to prototype the "needs recheck" freshness state, where info was once verified but has aged.',
    access: {
      entranceNotes: '[MOCK] Placeholder: main entrance near a placeholder footbridge.',
      wheelchairAccess: 'yes',
      parkingNotes: '[MOCK] Placeholder lot, example only.',
      hoursNote: null,
      additionalNotes: null,
    },
    nearbyLandmarks: [
      { name: '[MOCK] Placeholder Footbridge', relativePosition: 'Right at the entrance (example)' },
    ],
    tags: ['park', 'outdoors', 'example tag'],
    alternateNames: [],
    verification: {
      state: 'needs_recheck',
      lastCheckedAt: '2025-11-20',
      method: '[MOCK] Example: field-checked previously, now past the freshness window',
      checkedBy: 'Prototype tester',
      corroborations: 2,
    },
    photoPlaceholderCount: 1,
  },
  {
    services: [],
    publicPhone: null,
    publicEmail: null,
    sources: [],
    id: 'place-005',
    name: '[MOCK] Sample Terminal Stop',
    category: 'transport',
    barangay: 'Placeholder Poblacion',
    address: '[MOCK ADDRESS] Transport Hub Road (placeholder), Placeholder Poblacion, Muntinlupa City',
    location: { lat: 14.4005, lng: 121.0398 },
    description:
      'Placeholder transit stop entry used to prototype the "disputed" verification state, where two community reports disagree.',
    access: {
      entranceNotes: '[MOCK] Conflicting placeholder reports about which side of the road the stop is on.',
      wheelchairAccess: 'unknown',
      parkingNotes: null,
      hoursNote: null,
      additionalNotes: '[MOCK] Example note flagging the conflict for moderators.',
    },
    nearbyLandmarks: [],
    tags: ['terminal', 'jeepney', 'example tag'],
    alternateNames: ['[MOCK] "Old Terminal" per one placeholder report'],
    verification: {
      state: 'disputed',
      lastCheckedAt: '2026-07-01',
      method: '[MOCK] Example: two community reports conflict on location details',
      checkedBy: 'Community contributors (mock)',
      corroborations: 0,
    },
    photoPlaceholderCount: 0,
  },
  {
    services: [],
    publicPhone: null,
    publicEmail: null,
    sources: [],
    id: 'place-006',
    name: '[MOCK] Placeholder Elementary School',
    category: 'education',
    barangay: 'Sample Barangay',
    address: '[MOCK ADDRESS] School Lane (placeholder), Sample Barangay, Muntinlupa City',
    location: { lat: 14.4098, lng: 121.0461 },
    description: 'Placeholder school entry for category/filter demo purposes.',
    access: {
      entranceNotes: '[MOCK] Placeholder: single gated entrance, example only.',
      wheelchairAccess: 'partial',
      parkingNotes: null,
      hoursNote: null,
      additionalNotes: null,
    },
    nearbyLandmarks: [],
    tags: ['school', 'example tag'],
    alternateNames: [],
    verification: {
      state: 'verified',
      lastCheckedAt: '2026-09-28',
      method: '[MOCK] Example: cross-checked with a placeholder official listing',
      checkedBy: 'Prototype tester',
      corroborations: 4,
    },
    photoPlaceholderCount: 2,
  },
]
