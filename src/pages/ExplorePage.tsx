import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, List, Map as MapIcon, MapPin, Search, X } from 'lucide-react'
import { PlaceMap } from '@/components/map/PlaceMap'
import { PlaceCard } from '@/components/places/PlaceCard'
import { CATEGORY_META } from '@/components/places/categoryMeta'
import { Button } from '@/components/ui/Button'
import { Chip } from '@/components/ui/Chip'
import { TextInput } from '@/components/ui/TextInput'
import { EmptyState } from '@/components/ui/EmptyState'
import { fetchPlaces, isLocalPilotPreview } from '@/lib/placeApi'
import type { PilotBarangay, Place, PlaceCategory } from '@/types'

const PILOT_CATEGORIES: PlaceCategory[] = ['government', 'health', 'education']
const BARANGAYS: PilotBarangay[] = ['Tunasan', 'Poblacion', 'Putatan']

export function ExplorePage() {
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [loadAttempt, setLoadAttempt] = useState(0)
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<PlaceCategory | null>(null)
  const [barangayFilter, setBarangayFilter] = useState<PilotBarangay | null>(null)
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null)
  const [view, setView] = useState<'list' | 'map'>('list')

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
        (!barangayFilter || place.barangay === barangayFilter)
    })
  }, [places, query, categoryFilter, barangayFilter])

  const categoryCounts = useMemo(() => Object.fromEntries(
    PILOT_CATEGORIES.map((category) => [category, places.filter((place) => place.category === category).length]),
  ) as Record<PlaceCategory, number>, [places])
  const mappedCount = filtered.filter((place) => place.location !== null).length
  const hasFilters = Boolean(query || categoryFilter || barangayFilter)

  function clearFilters() {
    setQuery('')
    setCategoryFilter(null)
    setBarangayFilter(null)
  }

  return (
    <div className="space-y-10 pb-8">
      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end" aria-labelledby="explore-heading">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700">
            <MapPin size={16} aria-hidden="true" />Muntinlupa City
          </p>
          <h1 id="explore-heading" className="mt-4 max-w-[18ch] text-display font-bold leading-tight tracking-tight text-ink sm:text-display-lg">
            Public services, closer to home.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-copy">
            Find government offices, clinics, and public schools in Tunasan, Poblacion, and Putatan.
          </p>
        </div>

        <aside className="rounded-lg border border-line bg-surface p-5" aria-label="Pilot coverage">
          <p className="text-sm font-semibold text-brand-800">Tunasan, Poblacion, Putatan</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-ink">{places.length} listings</p>
          <p className="mt-1 text-sm text-muted">Pilot listings in progress. Some details still need confirmation.</p>
        </aside>
      </section>

      <section className="rounded-xl bg-brand-900 p-4 text-white sm:p-6" aria-labelledby="search-heading">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(18rem,1.35fr)] sm:items-center">
          <div>
            <h2 id="search-heading" className="text-lg font-semibold">What do you need?</h2>
            <p className="mt-1 text-sm text-white/80">Search a place, office, or service.</p>
          </div>
          <div className="relative">
            <TextInput
              icon={<Search size={18} />}
              placeholder="Try permits, health, or a school"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search public services"
              className="h-14 rounded-lg border-transparent bg-paper pr-12 text-base shadow-none placeholder:text-muted"
            />
            {query && (
              <button type="button" aria-label="Clear search" onClick={() => setQuery('')}
                className="tap-target absolute right-1 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-md text-muted hover:bg-surface-soft hover:text-ink active:scale-95">
                <X size={18} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-5" aria-label="Directory filters">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-ink">Browse by service</p>
          <div role="group" aria-label="Filter by service type" className="flex flex-wrap gap-2">
            <Chip active={categoryFilter === null} onClick={() => setCategoryFilter(null)}>All services</Chip>
            {PILOT_CATEGORIES.map((category) => {
              const { label, icon: Icon } = CATEGORY_META[category]
              return (
                <Chip key={category} active={categoryFilter === category} icon={<Icon size={16} aria-hidden="true" />}
                  onClick={() => setCategoryFilter(categoryFilter === category ? null : category)}>
                  {label}
                </Chip>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <p className="shrink-0 text-sm font-semibold text-ink">In barangay</p>
          <div role="group" aria-label="Filter by barangay" className="flex flex-wrap gap-2">
            <Chip active={barangayFilter === null} onClick={() => setBarangayFilter(null)}>All barangays</Chip>
            {BARANGAYS.map((barangay) => (
              <Chip key={barangay} active={barangayFilter === barangay}
                onClick={() => setBarangayFilter(barangayFilter === barangay ? null : barangay)}>{barangay}</Chip>
            ))}
          </div>
          {hasFilters && <Button variant="ghost" size="sm" onClick={clearFilters} icon={<X size={15} aria-hidden="true" />}>Clear filters</Button>}
        </div>
      </section>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <section className="min-w-0" aria-labelledby="results-heading">
          <div className="flex flex-col gap-4 border-b border-line pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="results-heading" className="text-2xl font-bold tracking-tight text-ink">Public service directory</h2>
              <p aria-live="polite" className="mt-1 text-sm text-muted">
                {loading ? 'Loading listings' : `${filtered.length} ${filtered.length === 1 ? 'listing' : 'listings'}`}
                {!loading && categoryFilter && ` for ${CATEGORY_META[categoryFilter].label.toLowerCase()}`}
                {!loading && barangayFilter && ` in ${barangayFilter}`}
              </p>
            </div>
            <div role="group" aria-label="Choose results view" className="inline-flex w-fit rounded-lg border border-line bg-surface p-1">
              <button type="button" aria-pressed={view === 'list'} onClick={() => setView('list')}
                className={`tap-target inline-flex items-center gap-2 rounded-md px-3 text-sm font-semibold transition-colors hover:bg-surface-soft active:scale-[0.98] ${view === 'list' ? 'bg-brand-50 text-brand-800' : 'text-copy'}`}>
                <List size={17} aria-hidden="true" />List
              </button>
              <button type="button" aria-pressed={view === 'map'} onClick={() => setView('map')}
                className={`tap-target inline-flex items-center gap-2 rounded-md px-3 text-sm font-semibold transition-colors hover:bg-surface-soft active:scale-[0.98] ${view === 'map' ? 'bg-brand-50 text-brand-800' : 'text-copy'}`}>
                <MapIcon size={17} aria-hidden="true" />Map
              </button>
            </div>
          </div>

          {loading ? (
            <div role="status" className="space-y-3 py-5">
              <span className="sr-only">Loading the public service directory.</span>
              {[0, 1, 2].map((row) => (
                <div key={row} className="h-28 animate-pulse rounded-lg bg-surface-soft" />
              ))}
            </div>
          ) : error ? (
            <div role="alert" className="py-8">
              <EmptyState title="Directory unavailable" description="Listings could not be loaded. Try again."
                action={<Button variant="secondary" onClick={() => { setLoading(true); setError(false); setLoadAttempt((attempt) => attempt + 1) }}>Try again</Button>} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center py-10 text-center">
              <EmptyState icon={<Search size={28} />} title={places.length === 0 ? 'Listings are being prepared' : 'No matching services'}
                description={places.length === 0 ? 'The pilot directory is still in progress.' : 'Try a shorter search or clear one of the filters.'}
                action={hasFilters ? <Button variant="secondary" onClick={clearFilters}>Clear search and filters</Button> : undefined} />
            </div>
          ) : view === 'map' ? (
            <div className="space-y-3 pt-5">
              <PlaceMap places={filtered} selectedPlaceId={selectedPlaceId} onSelectPlace={setSelectedPlaceId} />
              <p className="text-sm text-muted">{mappedCount} of {filtered.length} listings have source-backed map coordinates.</p>
            </div>
          ) : (
            <div className="divide-y divide-line pt-1">
              {filtered.map((place) => (
                <PlaceCard key={place.id} place={place} highlighted={place.id === selectedPlaceId} />
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-7 lg:pt-1">
          <section className="rounded-lg border border-line bg-surface p-5" aria-labelledby="coverage-heading">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-700">About this directory</p>
            <h2 id="coverage-heading" className="mt-2 text-lg font-bold text-ink">Pilot coverage</h2>
            <p className="mt-2 text-sm leading-relaxed text-copy">
              Listings come from public sources. Unknown details stay marked as not confirmed.
            </p>
            <ul className="mt-5 divide-y divide-line border-y border-line">
              {PILOT_CATEGORIES.map((category) => {
                const Icon = CATEGORY_META[category].icon
                return (
                  <li key={category} className="flex items-center justify-between gap-3 py-3 text-sm">
                    <span className="flex items-center gap-2 text-copy">
                      <Icon size={16} aria-hidden="true" />{CATEGORY_META[category].label}
                    </span>
                    <span className="font-semibold tabular-nums text-ink">{categoryCounts[category] ?? 0}</span>
                  </li>
                )
              })}
            </ul>
            <p className="mt-3 text-xs text-muted">Counts reflect this reviewed starting inventory, not complete coverage.</p>
          </section>

          <section className="space-y-3" aria-labelledby="location-heading">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <MapPin size={18} aria-hidden="true" />
              </div>
              <div>
                <h2 id="location-heading" className="font-semibold text-ink">Map locations</h2>
                <p className="mt-1 text-sm text-copy">Only {places.filter((place) => place.location).length} listings have coordinates. Others stay available in the directory.</p>
              </div>
            </div>
            {isLocalPilotPreview && <p className="text-xs text-muted">Local preview. Corrections stay in this browser session only.</p>}
          </section>

          <Link to="/corrections/new" className="group flex items-center justify-between gap-3 rounded-lg bg-brand-900 px-4 py-4 text-white transition-colors hover:bg-brand-800 active:bg-brand-950">
            <span>
              <span className="block text-sm font-semibold">See something to fix?</span>
              <span className="mt-1 block text-xs text-white/80">Suggest an edit to a listing</span>
            </span>
            <ArrowRight size={18} aria-hidden="true" className="shrink-0 transition-transform group-hover:translate-x-1" />
          </Link>
        </aside>
      </div>
    </div>
  )
}
