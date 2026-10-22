import type { WalkingRoute } from '@/types'

/**
 * ⚠️ MOCK DATA — fictional placeholder walking routes.
 * Path points are illustrative only and were not generated from a real
 * routing engine or a field survey. Distances and times are made up.
 */
export const mockRoutes: WalkingRoute[] = [
  {
    id: 'route-001',
    name: '[MOCK] Barangay Hall → Sample Public Market',
    startPlaceId: 'place-001',
    endPlaceId: 'place-002',
    pathPlaceholder: [
      { lat: 14.4081, lng: 121.0415 },
      { lat: 14.405, lng: 121.039 },
      { lat: 14.3994, lng: 121.0359 },
    ],
    distanceMeters: 950,
    estimatedMinutes: 12,
    verification: 'field_verified',
    lastFieldCheckAt: '2026-09-02',
    uncertaintyNote:
      '[MOCK] Example uncertainty note: "Walked in full by a prototype tester on the date above. Sidewalk condition may have changed since."',
    segmentNotes: [
      { description: '[MOCK] Placeholder Street to Market Road', caution: '[MOCK] Narrow sidewalk, example note' },
      { description: '[MOCK] Market Road to main gate', caution: null },
    ],
    wheelchairFriendly: 'partial',
  },
  {
    id: 'route-002',
    name: '[MOCK] Sample Public Market → Placeholder Health Center',
    startPlaceId: 'place-002',
    endPlaceId: 'place-003',
    pathPlaceholder: [
      { lat: 14.3994, lng: 121.0359 },
      { lat: 14.406, lng: 121.04 },
      { lat: 14.4123, lng: 121.0442 },
    ],
    distanceMeters: 1800,
    estimatedMinutes: 23,
    verification: 'mapped_only',
    lastFieldCheckAt: null,
    uncertaintyNote:
      '[MOCK] This path is drawn from placeholder map data only. Nobody has walked it to confirm it is correct, safe, or currently passable — treat it as a rough guide, not a confirmed route.',
    segmentNotes: [],
    wheelchairFriendly: 'unknown',
  },
  {
    id: 'route-003',
    name: '[MOCK] Barangay Hall → Placeholder Riverside Park',
    startPlaceId: 'place-001',
    endPlaceId: 'place-004',
    pathPlaceholder: [
      { lat: 14.4081, lng: 121.0415 },
      { lat: 14.402, lng: 121.035 },
      { lat: 14.3951, lng: 121.0287 },
    ],
    distanceMeters: 2400,
    estimatedMinutes: 31,
    verification: 'field_verified_stale',
    lastFieldCheckAt: '2025-10-05',
    uncertaintyNote:
      '[MOCK] This route was field-verified previously, but that check is now over a year old. Conditions (construction, closures) may have changed — treat as "probably fine" rather than confirmed.',
    segmentNotes: [
      { description: '[MOCK] Placeholder Street to riverside path', caution: '[MOCK] Example: unlit after dark' },
    ],
    wheelchairFriendly: 'yes',
  },
]
