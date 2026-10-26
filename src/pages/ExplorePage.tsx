import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { MapPlaceholder } from '@/components/map/MapPlaceholder'
import { PlaceCard } from '@/components/places/PlaceCard'
import { CATEGORY_META } from '@/components/places/categoryMeta'
import { Button } from '@/components/ui/Button'
import { Chip } from '@/components/ui/Chip'
import { TextInput } from '@/components/ui/TextInput'
import { EmptyState } from '@/components/ui/EmptyState'
import { VerificationBadge } from '@/components/verification/VerificationBadge'
import { fetchPlaces } from '@/lib/placeApi'
import type { PilotBarangay, Place, PlaceCategory, VerificationState } from '@/types'

const PILOT_CATEGORIES: PlaceCategory[] = ['government', 'health', 'education']
const BARANGAYS: PilotBarangay[] = ['Tunasan', 'Poblacion']
const VERIFICATION_FILTERS: VerificationState[] = [
  'verified', 'community_reported', 'awaiting_review', 'needs_recheck', 'disputed',
]

export function ExplorePage() {
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [loadAttempt, setLoadAttempt] = useState(0)
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<PlaceCategory | null>(null)
  const [barangayFilter, setBarangayFilter] = useState<PilotBarangay | null>(null)
  const [verificationFilter, setVerificationFilter] = useState<VerificationState | null>(null)
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    fetchPlaces()
      .then((loaded) => { if (active) setPlaces(loaded) })
      .catch(() => { if (active) setError(true) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [loadAttempt])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return places.filter((place) => {
      const matchesQuery = q.length === 0 ||
        [place.name, place.barangay, ...place.services, ...place.tags, ...place.alternateNames]
          .some((value) => value.toLowerCase().includes(q))
      return matchesQuery && (!categoryFilter || place.category === categoryFilter) &&
        (!barangayFilter || place.barangay === barangayFilter) &&
        (!verificationFilter || place.verification.state === verificationFilter)
    })
  }, [places, query, categoryFilter, barangayFilter, verificationFilter])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Find public services nearby</h1>
        <p className="mt-1 text-sm text-slate-600">Government offices, public clinics, and public schools in Tunasan and Poblacion.</p>
        <p className="mt-1 text-sm text-slate-500">Pilot listings in progress. Unknown details remain marked as not confirmed.</p>
      </div>

      <TextInput icon={<Search size={16} />} placeholder="Search names, barangays, or services"
        value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search places" />

      <div role="group" aria-label="Filter by barangay" className="flex flex-wrap gap-2">
        <Chip active={barangayFilter === null} onClick={() => setBarangayFilter(null)}>Both barangays</Chip>
        {BARANGAYS.map((barangay) => (
          <Chip key={barangay} active={barangayFilter === barangay}
            onClick={() => setBarangayFilter(barangayFilter === barangay ? null : barangay)}>{barangay}</Chip>
        ))}
      </div>

      <div role="group" aria-label="Filter by category" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        <Chip active={categoryFilter === null} onClick={() => setCategoryFilter(null)}>All categories</Chip>
        {PILOT_CATEGORIES.map((category) => {
          const { label, icon: Icon } = CATEGORY_META[category]
          return (
            <Chip key={category} active={categoryFilter === category} icon={<Icon size={14} />}
              onClick={() => setCategoryFilter(categoryFilter === category ? null : category)}>{label}</Chip>
          )
        })}
      </div>

      <div role="group" aria-label="Filter by review status" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        <Chip active={verificationFilter === null} onClick={() => setVerificationFilter(null)}>All review states</Chip>
        {VERIFICATION_FILTERS.map((state) => (
          <button key={state} type="button" aria-pressed={verificationFilter === state}
            onClick={() => setVerificationFilter(verificationFilter === state ? null : state)}
            className={`tap-target rounded-full ${verificationFilter === state ? 'ring-2 ring-brand-500 ring-offset-1' : 'hover:ring-1 hover:ring-slate-300'}`}>
            <VerificationBadge state={state} />
          </button>
        ))}
      </div>

      {loading ? <p role="status" className="py-10 text-center text-sm text-slate-500">Loading the directory...</p> : error ? (
        <div role="alert">
          <EmptyState title="Directory unavailable" description="Places could not be loaded. Please try again."
            action={<Button variant="secondary" onClick={() => { setLoading(true); setError(false); setLoadAttempt((attempt) => attempt + 1) }}>Try again</Button>} />
        </div>
      ) : (
        <>
          {filtered.some((place) => place.location !== null) && (
            <MapPlaceholder places={filtered} selectedPlaceId={selectedPlaceId} onSelectPlace={setSelectedPlaceId} className="h-auto" />
          )}
          <div>
            <p aria-live="polite" className="mb-2 text-sm font-medium text-slate-500">
              {filtered.length} {filtered.length === 1 ? 'place' : 'places'}
            </p>
            {filtered.length > 0 && <p className="mb-3 text-xs text-slate-500">Listings without confirmed coordinates remain available in this list.</p>}
            {filtered.length === 0 && (
              <EmptyState icon={<Search size={28} />} title={places.length === 0 ? 'No pilot listings available yet' : 'No places match your filters'}
                description={places.length === 0 ? 'Pilot listings are in progress. Please check back later.' : 'Try clearing the search text or a filter chip.'} />
            )}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((place) => <PlaceCard key={place.id} place={place} highlighted={place.id === selectedPlaceId} />)}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
