import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { MapPlaceholder } from '@/components/map/MapPlaceholder'
import { PlaceCard } from '@/components/places/PlaceCard'
import { CATEGORY_META } from '@/components/places/categoryMeta'
import { Chip } from '@/components/ui/Chip'
import { TextInput } from '@/components/ui/TextInput'
import { EmptyState } from '@/components/ui/EmptyState'
import { VerificationBadge } from '@/components/verification/VerificationBadge'
import { fetchPlaces } from '@/lib/mockApi'
import type { Place, PlaceCategory, VerificationState } from '@/types'

const VERIFICATION_FILTERS: VerificationState[] = [
  'verified',
  'community_reported',
  'awaiting_review',
  'needs_recheck',
  'disputed',
]

export function ExplorePage() {
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<PlaceCategory | null>(null)
  const [verificationFilter, setVerificationFilter] = useState<VerificationState | null>(null)
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null)

  useEffect(() => {
    fetchPlaces()
      .then(setPlaces)
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return places.filter((place) => {
      const matchesQuery =
        q.length === 0 ||
        place.name.toLowerCase().includes(q) ||
        place.barangay.toLowerCase().includes(q) ||
        place.tags.some((t) => t.toLowerCase().includes(q)) ||
        place.alternateNames.some((n) => n.toLowerCase().includes(q))
      const matchesCategory = !categoryFilter || place.category === categoryFilter
      const matchesVerification = !verificationFilter || place.verification.state === verificationFilter
      return matchesQuery && matchesCategory && matchesVerification
    })
  }, [places, query, categoryFilter, verificationFilter])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Find a place in Muntinlupa</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Search by name, barangay, or landmark. All data below is mock/prototype data.
        </p>
      </div>

      <TextInput
        icon={<Search size={16} />}
        placeholder="Search places, barangays, landmarks…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search places"
      />

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        <Chip active={categoryFilter === null} onClick={() => setCategoryFilter(null)}>
          All categories
        </Chip>
        {(Object.keys(CATEGORY_META) as PlaceCategory[]).map((cat) => {
          const { label, icon: Icon } = CATEGORY_META[cat]
          return (
            <Chip
              key={cat}
              active={categoryFilter === cat}
              icon={<Icon size={14} />}
              onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat)}
            >
              {label}
            </Chip>
          )
        })}
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {VERIFICATION_FILTERS.map((state) => (
          <button
            key={state}
            onClick={() => setVerificationFilter(verificationFilter === state ? null : state)}
            className={
              verificationFilter === state
                ? 'rounded-full ring-2 ring-brand-500 ring-offset-1'
                : 'rounded-full opacity-70 hover:opacity-100'
            }
          >
            <VerificationBadge state={state} />
          </button>
        ))}
      </div>

      <MapPlaceholder
        places={filtered}
        selectedPlaceId={selectedPlaceId}
        onSelectPlace={setSelectedPlaceId}
        className="h-auto"
      />

      <div>
        <p className="mb-2 text-sm font-medium text-slate-500">
          {loading ? 'Loading…' : `${filtered.length} place${filtered.length === 1 ? '' : 's'}`}
        </p>

        {!loading && filtered.length === 0 && (
          <EmptyState
            icon={<Search size={28} />}
            title="No places match your filters"
            description="Try clearing the search text or a filter chip."
          />
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((place) => (
            <PlaceCard key={place.id} place={place} highlighted={place.id === selectedPlaceId} />
          ))}
        </div>
      </div>
    </div>
  )
}
