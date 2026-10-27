import inventory from '../../data/pilot-places.json'
import type { Place, PlaceSource } from '@/types'

export const pilotPlaces: Place[] = inventory.map((record) => ({
  id: record.sourceKey,
  name: record.name,
  category: record.category as Place['category'],
  barangay: record.barangay,
  address: record.address,
  location: record.location,
  description: record.description,
  services: record.services,
  publicPhone: record.publicPhone,
  publicEmail: record.publicEmail,
  sources: record.sources.map((source, index): PlaceSource => ({
    id: `${record.sourceKey}:${index}`,
    fieldKey: source.fieldKey,
    sourceName: source.sourceName,
    sourceUrl: source.sourceUrl,
    sourceType: source.sourceType as PlaceSource['sourceType'],
    checkedAt: source.checkedAt,
  })),
  access: {
    entranceNotes: record.access.entranceNotes,
    wheelchairAccess: record.access.wheelchairAccess as Place['access']['wheelchairAccess'],
    parkingNotes: record.access.parkingNotes,
    hoursNote: record.access.hoursNote,
    additionalNotes: record.access.additionalNotes,
  },
  nearbyLandmarks: [],
  tags: [],
  alternateNames: [],
  verification: {
    state: 'awaiting_review',
    lastCheckedAt: null,
    method: null,
    checkedBy: null,
    corroborations: 0,
  },
  photoPlaceholderCount: 0,
}))
