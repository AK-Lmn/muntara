import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { PlaceMap } from '../../src/components/map/PlaceMap'
import type { Place } from '../../src/types'
import 'leaflet/dist/leaflet.css'
import '../../src/index.css'

const base: Place = {
  id: '', name: '', category: 'government', barangay: 'Tunasan', address: null,
  location: null, description: '', services: [], publicPhone: null, publicEmail: null,
  sources: [], nearbyLandmarks: [], tags: [], alternateNames: [], photoPlaceholderCount: 0,
  access: { entranceNotes: '', wheelchairAccess: 'unknown', parkingNotes: null, hoursNote: null, additionalNotes: null },
  verification: { state: 'awaiting_review', lastCheckedAt: null, method: null, checkedBy: null, corroborations: 0 },
}
const firstLocation = { lat: 14.3891958, lng: 121.0442405 }
const secondLocation = { lat: 14.3811, lng: 121.0516 }
const places: Place[] = [
  { ...base, id: 'first-a', name: 'First group A', location: firstLocation },
  { ...base, id: 'first-b', name: 'First group B', location: firstLocation },
  { ...base, id: 'second-a', name: 'Second group A', location: secondLocation },
  { ...base, id: 'second-b', name: 'Second group B', location: secondLocation },
]

export function FocusFixture() {
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null)
  return (
    <main className="mx-auto max-w-3xl space-y-3 bg-white p-4 text-slate-900">
      <h1 className="text-xl font-bold">Map focus regression fixture</h1>
      <p>Test data only. Both markers contain two listings and have the same visible label.</p>
      <p>Choose First group A in the northern marker. Focus must return to that marker and remain pressed.</p>
      <p role="status">Selected: {selectedPlaceId ?? 'none'}</p>
      <PlaceMap places={places} selectedPlaceId={selectedPlaceId} onSelectPlace={setSelectedPlaceId} />
    </main>
  )
}

createRoot(document.getElementById('root')!).render(<StrictMode><FocusFixture /></StrictMode>)
