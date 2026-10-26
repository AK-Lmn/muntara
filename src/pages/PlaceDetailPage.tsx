import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, MapPin } from 'lucide-react'
import { PlaceMap } from '@/components/map/PlaceMap'
import { AccessInfoPanel } from '@/components/places/AccessInfoPanel'
import { PlaceSourcesPanel } from '@/components/places/PlaceSourcesPanel'
import { CATEGORY_META } from '@/components/places/categoryMeta'
import { VerificationBadge } from '@/components/verification/VerificationBadge'
import { FreshnessNote } from '@/components/verification/FreshnessNote'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
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

  if (loading) return <p role="status" className="py-10 text-center text-sm text-slate-500">Loading place...</p>
  if (error) return (
    <div role="alert">
      <EmptyState title="Place unavailable" description="This place could not be loaded. Please try again."
        action={<Button variant="secondary" onClick={() => setLoadAttempt((attempt) => attempt + 1)}>Try again</Button>} />
      <Link to="/" className="block text-center text-sm font-medium text-brand-700">Back to Explore</Link>
    </div>
  )
  if (!place) return (
    <EmptyState icon={<MapPin size={28} />} title="Place not found" description="This listing is unavailable or is no longer published."
      action={<Link to="/" className="text-sm font-medium text-brand-700">Back to Explore</Link>} />
  )

  const { label: categoryLabel, icon: CategoryIcon } = CATEGORY_META[place.category]

  return (
    <div className="space-y-5 pb-6">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-800">
        <ArrowLeft size={16} aria-hidden="true" />Back to Explore
      </Link>
      <div>
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <CategoryIcon size={24} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold leading-snug text-slate-900">{place.name}</h1>
            <p className="mt-0.5 text-sm text-slate-600">{place.barangay} · {categoryLabel}</p>
            {place.alternateNames.length > 0 && <p className="mt-1 text-xs text-slate-500">Also known as: {place.alternateNames.join(', ')}</p>}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <VerificationBadge state={place.verification.state} />
          {place.tags.map((tag) => <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">{tag}</span>)}
        </div>
      </div>

      {place.location ? <PlaceMap places={[place]} selectedPlaceId={place.id} /> : (
        <p className="rounded-xl bg-slate-100 p-3 text-sm text-slate-600">Map location: Not confirmed. Use the sourced address below when available.</p>
      )}

      <Card className="space-y-3 p-4">
        <h2 className="font-semibold text-slate-900">About</h2>
        <p className="text-sm text-slate-600">{place.description || 'Not confirmed'}</p>
        <dl className="text-sm">
          <dt className="font-medium text-slate-800">Address</dt>
          <dd className="mt-1 text-slate-600">{place.address || 'Not confirmed'}</dd>
        </dl>
      </Card>

      <Card className="p-4">
        <h2 className="mb-2 font-semibold text-slate-900">Services</h2>
        {place.services.length > 0 ? <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
          {place.services.map((service) => <li key={service}>{service}</li>)}
        </ul> : <p className="text-sm text-slate-500">Not confirmed</p>}
      </Card>

      <Card className="p-4">
        <h2 className="mb-2 font-semibold text-slate-900">Public contact</h2>
        <dl className="space-y-3 text-sm">
          <div><dt className="font-medium text-slate-800">Phone</dt><dd className="mt-1 break-words text-slate-600">{place.publicPhone || 'Not confirmed'}</dd></div>
          <div><dt className="font-medium text-slate-800">Email</dt><dd className="mt-1 break-all text-slate-600">
            {place.publicEmail ? <a className="text-brand-700 underline underline-offset-2" href={`mailto:${place.publicEmail}`}>{place.publicEmail}</a> : 'Not confirmed'}
          </dd></div>
        </dl>
      </Card>

      <AccessInfoPanel access={place.access} />
      <section aria-labelledby="verification-heading">
        <h2 id="verification-heading" className="mb-2 font-semibold text-slate-900">Checks & review</h2>
        <FreshnessNote verification={place.verification} sources={place.sources} />
      </section>
      <PlaceSourcesPanel sources={place.sources} />
      <p className="text-xs text-slate-500">Pilot listings in progress for Tunasan and Poblacion. Confirm details with the office before a visit.</p>
    </div>
  )
}
