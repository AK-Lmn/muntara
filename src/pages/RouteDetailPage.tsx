import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Accessibility, AlertTriangle, Route as RouteIcon } from 'lucide-react'
import { MapPlaceholder } from '@/components/map/MapPlaceholder'
import { RouteVerificationBadge } from '@/components/routes/RouteVerificationBadge'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { fetchPlaces, fetchRoutes } from '@/lib/mockApi'
import type { Place, WalkingRoute } from '@/types'

const WHEELCHAIR_LABEL: Record<WalkingRoute['wheelchairFriendly'], string> = {
  yes: 'Wheelchair-friendly',
  no: 'Not wheelchair-friendly',
  partial: 'Partially wheelchair-friendly',
  unknown: 'Wheelchair-friendliness not yet confirmed',
}

export function RouteDetailPage() {
  const { routeId } = useParams<{ routeId: string }>()
  const [route, setRoute] = useState<WalkingRoute | null | undefined>(undefined)
  const [places, setPlaces] = useState<Place[]>([])

  useEffect(() => {
    if (!routeId) return
    fetchRoutes().then((routes) => setRoute(routes.find((r) => r.id === routeId) ?? null))
    fetchPlaces().then(setPlaces)
  }, [routeId])

  if (route === undefined) {
    return <p className="py-10 text-center text-sm text-muted">Loading…</p>
  }

  if (route === null) {
    return (
      <EmptyState
        icon={<RouteIcon size={28} />}
        title="Route not found"
        action={
          <Link to="/routes" className="text-sm font-medium text-brand-600">
            Back to Routes
          </Link>
        }
      />
    )
  }

  const start = places.find((p) => p.id === route.startPlaceId)
  const end = places.find((p) => p.id === route.endPlaceId)
  const endpointPlaces = [start, end].filter((p): p is Place => Boolean(p))

  return (
    <div className="space-y-5 pb-6">
      <Link to="/routes" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-copy">
        <ArrowLeft size={16} />
        Back to Routes
      </Link>

      <div>
        <h1 className="text-xl font-bold leading-snug text-ink">
          {start?.name ?? 'Unknown'} → {end?.name ?? 'Unknown'}
        </h1>
        <p className="mt-0.5 text-sm text-muted">
          {(route.distanceMeters / 1000).toFixed(1)} km · ~{route.estimatedMinutes} min walk
        </p>
        <div className="mt-3">
          <RouteVerificationBadge state={route.verification} />
        </div>
      </div>

      <MapPlaceholder places={endpointPlaces} />

      <Card
        className={
          route.verification === 'mapped_only'
            ? 'border-[var(--color-community-border)] bg-[var(--color-community-bg)] p-4'
            : route.verification === 'field_verified_stale'
              ? 'border-[var(--color-stale-border)] bg-[var(--color-stale-bg)] p-4'
              : 'border-[var(--color-verified-border)] bg-[var(--color-verified-bg)] p-4'
        }
      >
        <div className="flex gap-2.5">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Uncertainty note</p>
            <p className="mt-1 text-sm">{route.uncertaintyNote}</p>
            {route.lastFieldCheckAt && (
              <p className="mt-1 text-xs opacity-80">Last field-checked: {route.lastFieldCheckAt}</p>
            )}
          </div>
        </div>
      </Card>

      <Card className="flex items-center gap-2.5 p-4 text-sm text-copy">
        <Accessibility size={18} className="shrink-0 text-faint" />
        {WHEELCHAIR_LABEL[route.wheelchairFriendly]}
      </Card>

      {route.segmentNotes.length > 0 && (
        <div>
          <h2 className="mb-2 font-semibold text-ink">Segment notes</h2>
          <ul className="space-y-2">
            {route.segmentNotes.map((segment, i) => (
              <li key={i} className="rounded-xl border border-line bg-paper p-3 text-sm">
                <p className="text-ink">{segment.description}</p>
                {segment.caution && <p className="mt-1 text-review-fg"> {segment.caution}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
