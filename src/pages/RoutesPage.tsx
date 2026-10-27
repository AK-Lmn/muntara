import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Route as RouteIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { RouteVerificationBadge } from '@/components/routes/RouteVerificationBadge'
import { fetchPlaces, fetchRoutes } from '@/lib/mockApi'
import type { Place, WalkingRoute } from '@/types'

export function RoutesPage() {
  const [routes, setRoutes] = useState<WalkingRoute[]>([])
  const [places, setPlaces] = useState<Place[]>([])

  useEffect(() => {
    fetchRoutes().then(setRoutes)
    fetchPlaces().then(setPlaces)
  }, [])

  const placeName = (id: string) => places.find((p) => p.id === id)?.name ?? 'Unknown place'

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-ink">Walking routes</h1>
        <p className="mt-0.5 text-sm text-muted">
          Every route is labeled as either field-verified or mapped-only. Never assume a route is safe or current
          just because it's listed here.
        </p>
      </div>

      <div className="space-y-3">
        {routes.map((route) => (
          <Link key={route.id} to={`/routes/${route.id}`}>
            <Card interactive className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <RouteIcon size={20} />
                  </div>
                  <div>
                    <p className="font-semibold leading-snug text-ink">
                      {placeName(route.startPlaceId)} → {placeName(route.endPlaceId)}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {(route.distanceMeters / 1000).toFixed(1)} km · ~{route.estimatedMinutes} min walk
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <RouteVerificationBadge state={route.verification} />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
