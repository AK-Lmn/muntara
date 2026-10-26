import { useEffect, useMemo, useRef, useState } from 'react'
import type * as Leaflet from 'leaflet'
import { MapPin } from 'lucide-react'
import type { Place } from '@/types'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/Button'

interface PlaceMapProps {
  places: Place[]
  selectedPlaceId?: string | null
  onSelectPlace?: (id: string) => void
  className?: string
}

type MapSession = { leaflet: typeof Leaflet; map: Leaflet.Map }
const TILE_URL = import.meta.env.VITE_MAP_TILE_URL?.trim() || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const ATTRIBUTION = import.meta.env.VITE_MAP_ATTRIBUTION?.trim() ||
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'

export function PlaceMap({ places, selectedPlaceId, onSelectPlace, className }: PlaceMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<Leaflet.Map | null>(null)
  const tileLayerRef = useRef<Leaflet.TileLayer | null>(null)
  const markerLayerRef = useRef<Leaflet.LayerGroup | null>(null)
  const [session, setSession] = useState<MapSession | null>(null)
  const [initError, setInitError] = useState(false)
  const [tileError, setTileError] = useState(false)
  const [retryAttempt, setRetryAttempt] = useState(0)
  const mappedPlaces = useMemo(() => places.filter((place) => place.location !== null), [places])
  const hasLocations = mappedPlaces.length > 0
  const missingCount = places.length - mappedPlaces.length

  useEffect(() => {
    if (!hasLocations || !containerRef.current) return
    let active = true
    let map: Leaflet.Map | undefined
    let observer: ResizeObserver | undefined
    import('leaflet').then((leaflet) => {
      if (!active || !containerRef.current) return
      try {
        leaflet.Util.template(TILE_URL, { x: 0, y: 0, z: 0, s: 'a', r: '' })
        map = leaflet.map(containerRef.current, { scrollWheelZoom: false, zoomAnimation: false, fadeAnimation: false })
        map.attributionControl.setPrefix(false)
        map.zoomControl.getContainer()?.querySelectorAll('a').forEach((control) => control.classList.add('tap-target', '!flex', 'items-center', 'justify-center'))
        mapRef.current = map
        markerLayerRef.current = leaflet.layerGroup().addTo(map)
        let failedThisLoad = false
        const tiles = leaflet.tileLayer(TILE_URL, { attribution: ATTRIBUTION, maxZoom: 19, keepBuffer: 1 })
        tiles.on('loading', () => { failedThisLoad = false })
        tiles.on('tileerror', () => { failedThisLoad = true; if (active) setTileError(true) })
        tiles.on('load', () => { if (active && !failedThisLoad) setTileError(false) })
        tileLayerRef.current = tiles.addTo(map)
        if (typeof ResizeObserver !== 'undefined') {
          observer = new ResizeObserver(() => map?.invalidateSize())
          observer.observe(containerRef.current)
        }
        setInitError(false)
        setSession({ leaflet, map })
      } catch {
        map?.remove()
        map = undefined
        mapRef.current = null
        markerLayerRef.current = null
        tileLayerRef.current = null
        if (active) setInitError(true)
      }
    }).catch(() => { if (active) setInitError(true) })
    return () => {
      active = false
      observer?.disconnect()
      map?.remove()
      mapRef.current = null
      markerLayerRef.current = null
      tileLayerRef.current = null
    }
  }, [hasLocations, retryAttempt])

  useEffect(() => {
    if (!session || session.map !== mapRef.current || !markerLayerRef.current) return
    const { leaflet, map } = session
    const layer = markerLayerRef.current
    const focusedGroupKey = document.activeElement?.classList.contains('leaflet-marker-icon')
      ? document.activeElement.getAttribute('data-map-group-key') : null
    layer.clearLayers()
    const groups = new Map<string, Place[]>()
    for (const place of mappedPlaces) {
      const key = `${place.location!.lat},${place.location!.lng}`
      groups.set(key, [...(groups.get(key) ?? []), place])
    }
    for (const [groupKey, group] of groups) {
      const selected = group.some((place) => place.id === selectedPlaceId)
      const title = group.length === 1 ? group[0].name : `${group.length} listings at this location`
      const iconContent = document.createElement('span')
      iconContent.className = cn('flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-sm font-bold text-white shadow-md',
        selected ? 'bg-brand-900 ring-4 ring-brand-300' : 'bg-brand-700')
      if (group.length > 1) iconContent.textContent = String(group.length)
      else iconContent.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>'
      const marker = leaflet.marker([group[0].location!.lat, group[0].location!.lng], {
        icon: leaflet.divIcon({ html: iconContent, className: '', iconSize: [44, 44], iconAnchor: [18, 36] }),
        title, keyboard: true, zIndexOffset: selected ? 1000 : 0,
      })
      const tooltip = document.createElement('span')
      tooltip.textContent = title
      marker.bindTooltip(tooltip, { direction: 'top', permanent: selected })
      const popup = document.createElement('div')
      for (const place of group) {
        const item = document.createElement(group.length > 1 && onSelectPlace ? 'button' : 'p')
        item.textContent = place.name
        item.className = 'block text-sm font-medium text-map-on-canvas'
        if (item instanceof HTMLButtonElement) {
          item.type = 'button'
          item.className += ' tap-target w-full rounded-lg px-2 text-left hover:bg-map-popup-hover'
          item.setAttribute('aria-pressed', String(place.id === selectedPlaceId))
          item.addEventListener('click', () => { onSelectPlace?.(place.id); map.closePopup(); marker.getElement()?.focus({ preventScroll: true }) })
        }
        popup.append(item)
      }
      marker.bindPopup(popup)
      marker.on('click', () => { if (group.length === 1) onSelectPlace?.(group[0].id) })
      marker.on('add', () => {
        const element = marker.getElement()
        element?.setAttribute('aria-label', title)
        element?.setAttribute('data-map-group-key', groupKey)
        element?.setAttribute('aria-pressed', String(selected))
        if (groupKey === focusedGroupKey) element?.focus({ preventScroll: true })
        element?.addEventListener('keydown', (event) => {
          if (event.code === 'Space' || event.code === 'Enter') { event.preventDefault(); marker.fire('click'); marker.openPopup() }
        })
      })
      marker.addTo(layer)
    }
  }, [session, mappedPlaces, selectedPlaceId, onSelectPlace])

  useEffect(() => {
    if (!session || session.map !== mapRef.current || mappedPlaces.length === 0) return
    const points = mappedPlaces.map((place) => [place.location!.lat, place.location!.lng] as Leaflet.LatLngTuple)
    if (points.length === 1) session.map.setView(points[0], 16, { animate: false })
    else session.map.fitBounds(points, { padding: [32, 32], maxZoom: 16, animate: false })
  }, [session, mappedPlaces])

  const retry = () => {
    setTileError(false)
    if (tileLayerRef.current && !initError) tileLayerRef.current.redraw()
    else { setInitError(false); setRetryAttempt((attempt) => attempt + 1) }
  }

  return (
    <section aria-label="Public service locations" className={cn('space-y-2', className)}>
      {hasLocations ? (
        <>
          <div data-map-surface ref={containerRef} role="region" aria-label="Map of public service locations"
            className={cn('relative z-0 h-80 w-full overflow-hidden rounded-2xl border border-map-border bg-map-canvas text-map-on-canvas sm:h-96', initError && 'hidden')} />
          {(initError || tileError) && (
            <div role="alert" className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-map-border bg-map-surface p-3 text-sm text-map-copy">
              <p>{initError ? 'Map unavailable.' : 'Some map tiles could not load.'} The directory remains available below.</p>
              <Button variant="secondary" onClick={retry}>Retry map</Button>
            </div>
          )}
          <p className="text-xs text-map-muted">{mappedPlaces.length} mapped {mappedPlaces.length === 1 ? 'listing' : 'listings'}.
            {missingCount > 0 && ` ${missingCount} ${missingCount === 1 ? 'listing without confirmed coordinates remains' : 'listings without confirmed coordinates remain'} available in the list.`}</p>
        </>
      ) : (
        <p className="flex items-center gap-2 rounded-xl border border-map-border bg-map-surface p-4 text-sm text-map-muted">
          <MapPin size={18} aria-hidden="true" />Map location not confirmed. Listings remain available in the directory.
        </p>
      )}
      <a href="https://www.openstreetmap.org/fixthemap" target="_blank" rel="noreferrer noopener"
        className="inline-flex min-h-11 items-center text-xs font-medium text-map-link underline hover:text-map-link-hover">Report a map issue</a>
    </section>
  )
}
