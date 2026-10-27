import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight, MapPin } from 'lucide-react'
import { PlaceMap } from '@/components/map/PlaceMap'
import { AccessInfoPanel } from '@/components/places/AccessInfoPanel'
import { PlaceSourcesPanel } from '@/components/places/PlaceSourcesPanel'
import { CATEGORY_META } from '@/components/places/categoryMeta'
import { VerificationBadge } from '@/components/verification/VerificationBadge'
import { FreshnessNote } from '@/components/verification/FreshnessNote'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { fetchPlaceById } from '@/lib/placeApi'
import type { Place } from '@/types'

export function PlaceDetailPage() {
  const { placeId } = useParams<{ placeId: string }>()
  const [loadAttempt, setLoadAttempt] = useState(0)
  const [result, setResult] = useState<{ key: string; place: Place | null; error: boolean } | null>(null)
  const requestKey = `${placeId ?? ''}:${loadAttempt}`
  const loading = result?.key !== requestKey
  const place = result?.place
  const error = result?.error

  useEffect(() => {
    let active = true
    const request = placeId ? fetchPlaceById(placeId) : Promise.resolve(null)
    request.then((loaded) => { if (active) setResult({ key: requestKey, place: loaded, error: false }) })
      .catch(() => { if (active) setResult({ key: requestKey, place: null, error: true }) })
    return () => { active = false }
  }, [placeId, requestKey])

  if (loading) return <p role="status" className="grid min-h-64 place-items-center text-sm text-muted">Loading listing...</p>
  if (error) return (
    <div role="alert" className="mx-auto max-w-xl py-10">
      <EmptyState title="Place unavailable" description="This place could not be loaded. Please try again."
        action={<Button variant="secondary" onClick={() => setLoadAttempt((attempt) => attempt + 1)}>Try again</Button>} />
      <Link to="/" className="mt-4 block text-center text-sm font-semibold text-brand-800 underline underline-offset-4">Back to directory</Link>
    </div>
  )
  if (!place) return (
    <EmptyState icon={<MapPin size={28} />} title="Place not found" description="This listing is unavailable or is no longer published."
      action={<Link to="/" className="text-sm font-medium text-brand-700">Back to Explore</Link>} />
  )

  const { label: categoryLabel, icon: CategoryIcon } = CATEGORY_META[place.category]

  return (
    <div className="space-y-8 pb-8">
      <Link to="/" className="group inline-flex min-h-11 items-center gap-2 rounded-md pr-3 text-sm font-semibold text-copy hover:text-brand-800">
        <ArrowLeft size={17} aria-hidden="true" className="transition-transform group-hover:-translate-x-0.5" />Back to directory
      </Link>

      <section className="grid gap-6 border-b border-line pb-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold text-brand-800">
            <CategoryIcon size={17} aria-hidden="true" />{categoryLabel}<span aria-hidden="true">/</span>{place.barangay}
          </p>
          <h1 className="mt-4 max-w-[20ch] text-display font-bold leading-tight tracking-tight text-ink sm:text-display-lg">{place.name}</h1>
          {place.alternateNames.length > 0 && <p className="mt-3 text-sm text-copy">Also known as {place.alternateNames.join(', ')}</p>}
          <p className="mt-4 flex max-w-2xl items-start gap-2 text-base text-copy">
            <MapPin size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-brand-700" />
            <span>{place.address || 'Street address not confirmed'}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2 lg:justify-end">
          <VerificationBadge state={place.verification.state} />
          <Link to={`/corrections/new?placeId=${encodeURIComponent(place.id)}`}
            className="tap-target inline-flex items-center justify-center gap-2 rounded-md bg-action-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-action-primary-hover active:bg-action-primary-active focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas">
            Suggest an edit<ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.55fr)_minmax(18rem,0.8fr)]">
        <div className="min-w-0 space-y-9">
          {place.location ? (
            <section aria-labelledby="map-heading">
              <div className="mb-3 flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-700">Location</p>
                  <h2 id="map-heading" className="mt-1 text-xl font-bold text-ink">Map location</h2>
                </div>
                <p className="text-right text-xs text-muted">Coordinates from a project source, not a site visit.</p>
              </div>
              <PlaceMap places={[place]} selectedPlaceId={place.id} />
            </section>
          ) : (
            <p className="flex items-start gap-3 rounded-lg border border-line bg-surface p-4 text-sm text-copy">
              <MapPin size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-muted" />
              Map coordinates are not confirmed. Use the sourced address above when available.
            </p>
          )}

          <section className="space-y-4" aria-labelledby="about-heading">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-700">At a glance</p>
              <h2 id="about-heading" className="mt-1 text-2xl font-bold tracking-tight text-ink">About this place</h2>
            </div>
            <p className="max-w-3xl text-base leading-relaxed text-copy">{place.description || 'Description not confirmed'}</p>
            <div className="border-t border-line pt-4">
              <h3 className="font-semibold text-ink">Services</h3>
              {place.services.length > 0 ? (
                <ul className="mt-3 space-y-2 text-sm text-copy">
                  {place.services.map((service) => <li key={service} className="flex gap-3"><span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-700" />{service}</li>)}
                </ul>
              ) : <p className="mt-2 text-sm text-muted">Services not confirmed</p>}
            </div>
          </section>

          <section className="space-y-4 border-t border-line pt-6" aria-labelledby="contact-heading">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-700">Contact</p>
              <h2 id="contact-heading" className="mt-1 text-xl font-bold text-ink">Public contact details</h2>
            </div>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Phone</dt>
                <dd className="mt-1 break-words text-sm text-copy">{place.publicPhone || 'Not confirmed'}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Email</dt>
                <dd className="mt-1 break-all text-sm text-copy">
                  {place.publicEmail ? <a className="font-semibold text-brand-800 underline underline-offset-4 hover:text-brand-950" href={`mailto:${place.publicEmail}`}>{place.publicEmail}</a> : 'Not confirmed'}
                </dd>
              </div>
            </dl>
          </section>

          <AccessInfoPanel access={place.access} />
        </div>

        <aside className="space-y-7 lg:sticky lg:top-24 lg:self-start">
          <section aria-labelledby="review-heading">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-700">Trust and freshness</p>
            <h2 id="review-heading" className="mt-1 mb-3 text-xl font-bold text-ink">What has been checked</h2>
            <FreshnessNote verification={place.verification} sources={place.sources} />
          </section>
          <PlaceSourcesPanel sources={place.sources} />
        </aside>
      </div>
      <p className="border-t border-line pt-5 text-sm text-muted">
        Pilot listings are still in progress. Confirm details with the office before visiting.
      </p>
    </div>
  )
}
