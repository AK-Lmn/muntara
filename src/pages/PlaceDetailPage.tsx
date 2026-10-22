import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ClipboardEdit, MapPin, Route as RouteIcon } from 'lucide-react'
import { MapPlaceholder } from '@/components/map/MapPlaceholder'
import { AccessInfoPanel } from '@/components/places/AccessInfoPanel'
import { LandmarkList } from '@/components/places/LandmarkList'
import { PhotoPlaceholders } from '@/components/places/PhotoPlaceholders'
import { CATEGORY_META } from '@/components/places/categoryMeta'
import { VerificationBadge } from '@/components/verification/VerificationBadge'
import { FreshnessNote } from '@/components/verification/FreshnessNote'
import { RouteVerificationBadge } from '@/components/routes/RouteVerificationBadge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { fetchPlaceById, fetchPlaces, fetchRoutesForPlace } from '@/lib/mockApi'
import type { Place, WalkingRoute } from '@/types'

export function PlaceDetailPage() {
  const { placeId } = useParams<{ placeId: string }>()
  const [place, setPlace] = useState<Place | null | undefined>(undefined)
  const [allPlaces, setAllPlaces] = useState<Place[]>([])
  const [routes, setRoutes] = useState<WalkingRoute[]>([])

  useEffect(() => {
    if (!placeId) return
    fetchPlaceById(placeId).then((p) => setPlace(p ?? null))
    fetchPlaces().then(setAllPlaces)
    fetchRoutesForPlace(placeId).then(setRoutes)
  }, [placeId])

  if (place === undefined) {
    return <p className="py-10 text-center text-sm text-slate-500">Loading…</p>
  }

  if (place === null) {
    return (
      <EmptyState
        icon={<MapPin size={28} />}
        title="Place not found"
        description="This mock place doesn't exist. It may have been removed from the sample dataset."
        action={
          <Link to="/" className="text-sm font-medium text-brand-600">
            Back to Explore
          </Link>
        }
      />
    )
  }

  const { label: categoryLabel, icon: CategoryIcon } = CATEGORY_META[place.category]

  return (
    <div className="space-y-5 pb-6">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700">
        <ArrowLeft size={16} />
        Back to Explore
      </Link>

      <div>
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <CategoryIcon size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-snug text-slate-900">{place.name}</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              {place.barangay} · {categoryLabel}
            </p>
            {place.alternateNames.length > 0 && (
              <p className="mt-0.5 text-xs italic text-slate-400">
                Also known as: {place.alternateNames.join(', ')}
              </p>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <VerificationBadge state={place.verification.state} />
          {place.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <MapPlaceholder places={[place]} selectedPlaceId={place.id} />

      <Card className="p-4">
        <h2 className="mb-1 font-semibold text-slate-900">About</h2>
        <p className="text-sm text-slate-600">{place.description}</p>
        <p className="mt-3 flex items-start gap-2 text-sm text-slate-700">
          <MapPin size={16} className="mt-0.5 shrink-0 text-slate-400" />
          {place.address}
        </p>
      </Card>

      <AccessInfoPanel access={place.access} />

      <Card className="p-4">
        <h2 className="mb-2 font-semibold text-slate-900">Nearby landmarks</h2>
        <LandmarkList landmarks={place.nearbyLandmarks} />
      </Card>

      <Card className="p-4">
        <h2 className="mb-2 font-semibold text-slate-900">Photos</h2>
        <PhotoPlaceholders count={place.photoPlaceholderCount} />
      </Card>

      <div>
        <h2 className="mb-2 font-semibold text-slate-900">Verification</h2>
        <FreshnessNote verification={place.verification} />
      </div>

      {routes.length > 0 && (
        <div>
          <h2 className="mb-2 flex items-center gap-1.5 font-semibold text-slate-900">
            <RouteIcon size={18} className="text-slate-400" />
            Walking routes involving this place
          </h2>
          <div className="space-y-2">
            {routes.map((route) => {
              const other = allPlaces.find(
                (p) => p.id === (route.startPlaceId === place.id ? route.endPlaceId : route.startPlaceId),
              )
              return (
                <Link key={route.id} to={`/routes/${route.id}`}>
                  <Card interactive className="flex items-center justify-between gap-3 p-3.5">
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {route.startPlaceId === place.id ? 'To' : 'From'} {other?.name ?? 'another place'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {(route.distanceMeters / 1000).toFixed(1)} km · ~{route.estimatedMinutes} min
                      </p>
                    </div>
                    <RouteVerificationBadge state={route.verification} />
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      <Link to={`/corrections/new?placeId=${place.id}`}>
        <Button variant="secondary" icon={<ClipboardEdit size={16} />} fullWidth>
          Suggest a correction for this place
        </Button>
      </Link>
    </div>
  )
}
