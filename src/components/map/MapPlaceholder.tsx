import { MapPinned } from 'lucide-react'
import type { GeoPoint, Place } from '@/types'
import { cn } from '@/lib/cn'

interface MapPlaceholderProps {
  places: Place[]
  selectedPlaceId?: string | null
  onSelectPlace?: (id: string) => void
  className?: string
}

// Rough bounding box covering the mock points in src/data/mockPlaces.ts.
// Replace with real projection math (or a real map SDK's own coordinate
// system) once a map provider is wired up — see README "Map integration".
const BOUNDS = { minLat: 14.392, maxLat: 14.415, minLng: 121.026, maxLng: 121.049 }

function project(point: GeoPoint) {
  const x = ((point.lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * 100
  const y = 100 - ((point.lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * 100
  return { x: Math.min(96, Math.max(4, x)), y: Math.min(94, Math.max(6, y)) }
}

/**
 * DEVELOPMENT-ONLY PLACEHOLDER.
 *
 * This is NOT a real map. It renders mock place markers on a stylized grid
 * using a crude linear projection of their placeholder coordinates — there
 * is no basemap, no real streets, no tiles, and no connection to any
 * mapping service. It exists purely so the surrounding UI (search, filters,
 * place selection) can be built and tested now.
 *
 * To integrate a real map later: swap this component's internals for a
 * provider SDK (e.g. MapLibre GL, Leaflet + OSM tiles, or Google Maps),
 * keeping the same `places` / `selectedPlaceId` / `onSelectPlace` props so
 * nothing else in the app has to change. Keep any API keys in
 * environment variables, never hard-coded in the client.
 */
export function MapPlaceholder({ places, selectedPlaceId, onSelectPlace, className }: MapPlaceholderProps) {
  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-[linear-gradient(0deg,transparent_24%,rgba(31,155,124,0.08)_25%,rgba(31,155,124,0.08)_26%,transparent_27%,transparent_74%,rgba(31,155,124,0.08)_75%,rgba(31,155,124,0.08)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(31,155,124,0.08)_25%,rgba(31,155,124,0.08)_26%,transparent_27%,transparent_74%,rgba(31,155,124,0.08)_75%,rgba(31,155,124,0.08)_76%,transparent_77%,transparent)] bg-slate-100 [background-size:25%_25%]',
        className,
      )}
    >
      <div className="absolute left-2 top-2 z-10 flex items-center gap-1.5 rounded-lg bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-800">
        <MapPinned size={13} />
        Placeholder map — no live map service connected
      </div>

      <div className="relative aspect-[4/3] w-full sm:aspect-[16/9]">
        {places.map((place) => {
          const { x, y } = project(place.location)
          const isSelected = place.id === selectedPlaceId
          return (
            <button
              key={place.id}
              type="button"
              onClick={() => onSelectPlace?.(place.id)}
              style={{ left: `${x}%`, top: `${y}%` }}
              className={cn(
                'absolute -translate-x-1/2 -translate-y-full rounded-full border-2 border-white shadow-md transition-transform',
                'flex h-7 w-7 items-center justify-center text-white',
                isSelected ? 'z-20 scale-125 bg-accent-500' : 'z-10 bg-brand-600 hover:scale-110',
              )}
              aria-label={`${place.name} marker`}
              title={place.name}
            >
              <MapPinned size={14} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
