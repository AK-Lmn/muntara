#!/usr/bin/env node
/**
 * Imports real place data for Muntinlupa City from OpenStreetMap (via the
 * Overpass API) and writes src/data/importedPlaces.ts.
 *
 * Every imported place is marked `awaiting_review` with the OSM source
 * recorded in `verification.method` — nothing here claims to be checked
 * against the real world. Promoting an imported place to `verified` is a
 * human decision made through the moderation flow.
 *
 * Usage:  npm run import:osm
 *
 * Data © OpenStreetMap contributors, licensed ODbL 1.0
 * https://www.openstreetmap.org/copyright
 */

import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const OUT_FILE = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'importedPlaces.ts')

const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.osm.ch/api/interpreter',
]

// Kept to tags that map onto the app's PlaceCategory and that a resident would
// realistically search for. Recreation/leisure included; generic shop=* not.
const QUERY = `[out:json][timeout:180];
area["name"="Muntinlupa"]["admin_level"="8"]->.a;
(
  nwr(area.a)[amenity~"^(townhall|courthouse|post_office|police|fire_station|ambulance_station|library|community_centre|social_facility|marketplace|hospital|clinic|doctors|dentist|pharmacy|veterinary|school|college|university|kindergarten|place_of_worship|bus_station|taxi|ferry_terminal|fuel|restaurant|cafe|fast_food)$"];
  nwr(area.a)[healthcare];
  nwr(area.a)[leisure~"^(park|garden|playground|sports_centre|pitch)$"];
  nwr(area.a)[shop~"^(supermarket|mall|department_store|bakery)$"];
  nwr(area.a)[tourism~"^(hotel|hostel|guest_house|museum|attraction)$"];
);
out center tags;`

/** Maps OSM tags onto the app's categories. Returns null for tags we skip. */
function categoryFor(tags) {
  const amenity = tags.amenity
  if (amenity) {
    if (['townhall', 'courthouse', 'post_office', 'library', 'community_centre', 'social_facility'].includes(amenity)) return 'government'
    if (['police', 'fire_station', 'ambulance_station'].includes(amenity)) return 'emergency_services'
    if (['hospital', 'clinic', 'doctors', 'dentist', 'pharmacy', 'veterinary'].includes(amenity)) return 'health'
    if (['school', 'college', 'university', 'kindergarten'].includes(amenity)) return 'education'
    if (['bus_station', 'taxi', 'ferry_terminal', 'fuel'].includes(amenity)) return 'transport'
    if (['restaurant', 'cafe', 'fast_food'].includes(amenity)) return 'food'
    if (amenity === 'place_of_worship') return 'worship'
    if (amenity === 'marketplace') return 'shopping'
  }
  if (tags.healthcare) return 'health'
  if (tags.leisure) return 'park_recreation'
  if (tags.shop) return 'shopping'
  if (tags.tourism) {
    return tags.tourism === 'hotel' || tags.tourism === 'hostel' || tags.tourism === 'guest_house' ? 'lodging' : 'park_recreation'
  }
  return null
}

function wheelchairFor(value) {
  if (value === 'yes') return 'yes'
  if (value === 'no') return 'no'
  if (value === 'limited' || value === 'partial') return 'partial'
  return 'unknown'
}

function toPlace(element) {
  const tags = element.tags ?? {}
  const name = tags.name ?? tags['name:en'] ?? tags['name:tl']
  if (!name) return null

  const category = categoryFor(tags)
  if (!category) return null

  const lat = element.center?.lat ?? element.lat
  const lng = element.center?.lon ?? element.lon
  if (typeof lat !== 'number' || typeof lng !== 'number') return null

  const street = [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' ')
  const address = street || (tags['addr:place'] ?? '') || 'Address not recorded yet (imported from OpenStreetMap).'
  const localName = tags['name:tl'] ?? tags['name:en']
  const descriptor = tags.amenity ?? tags.healthcare ?? tags.leisure ?? tags.shop ?? tags.tourism ?? category

  return {
    id: `osm-${element.type[0]}${element.id}`,
    name,
    category,
    barangay: tags['addr:barangay'] ?? tags['addr:suburb'] ?? '',
    address: address === street && street ? `${street}, Muntinlupa City` : address,
    location: { lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) },
    description: `Imported from OpenStreetMap (${descriptor}). The name and location come from the map data; everything below — entrance, access, landmarks — still needs a human check.`,
    access: {
      entranceNotes: 'Entrance details not recorded yet — the first thing a field check should capture.',
      wheelchairAccess: wheelchairFor(tags.wheelchair),
      parkingNotes: null,
      hoursNote: tags.opening_hours ?? null,
      additionalNotes: null,
    },
    nearbyLandmarks: [],
    tags: [`osm:${descriptor}`],
    alternateNames: localName && localName !== name ? [localName] : [],
    verification: {
      state: 'awaiting_review',
      lastCheckedAt: null,
      method: `Imported from OpenStreetMap (${element.type}/${element.id})`,
      checkedBy: null,
      corroborations: 0,
    },
    photoPlaceholderCount: 0,
  }
}

async function fetchOverpass() {
  let lastError = null
  for (const url of ENDPOINTS) {
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        process.stdout.write(`Querying ${url} (attempt ${attempt})…\n`)
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'data=' + encodeURIComponent(QUERY),
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return await response.json()
      } catch (error) {
        lastError = error
        process.stdout.write(`  failed: ${error.message}\n`)
      }
    }
  }
  throw lastError ?? new Error('All Overpass endpoints failed')
}

const json = await fetchOverpass()
const raw = json.elements ?? []

const seen = new Set()
const places = []
for (const element of raw) {
  const place = toPlace(element)
  if (!place) continue
  // Duplicate node+way pairs for the same feature come back from the OR query.
  const key = `${place.name.toLowerCase()}|${place.location.lat.toFixed(3)}|${place.location.lng.toFixed(3)}`
  if (seen.has(key)) continue
  seen.add(key)
  places.push(place)
}
places.sort((a, b) => a.name.localeCompare(b.name))

const header = `import type { Place } from '@/types'

/**
 * ============================================================================
 * IMPORTED REAL DATA — OpenStreetMap, Muntinlupa City
 * ============================================================================
 * Generated by \`npm run import:osm\` on ${new Date().toISOString().slice(0, 10)}
 * from OpenStreetMap via the Overpass API. ${places.length} places.
 *
 * These are REAL place names and real coordinates, unlike src/data/mockPlaces.ts.
 * Every entry is \`awaiting_review\` and none of the access details have been
 * checked — that requires a person on the ground, which is what the moderation
 * flow is for.
 *
 * Data © OpenStreetMap contributors, ODbL 1.0
 * https://www.openstreetmap.org/copyright
 * ============================================================================
 */

export const importedPlaces: Place[] = `

await writeFile(OUT_FILE, header + JSON.stringify(places, null, 2) + '\n', 'utf8')
process.stdout.write(`Wrote ${places.length} places to src/data/importedPlaces.ts\n`)
