import { createSupabaseClient } from './supabaseClient'
import { pilotPlaces } from '@/data/pilotPlaces'
import type { Place, PlaceSource } from '@/types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()
export const isLocalPilotPreview = !supabaseUrl && !supabaseKey

type SourceRow = {
  id: string
  field_key: string
  source_name: string
  source_url: string | null
  source_type: PlaceSource['sourceType']
  checked_at: string
}

type PlaceRow = {
  id: string
  name: string
  category: Place['category']
  barangay: string
  address: string | null
  latitude: number | null
  longitude: number | null
  description: string
  services: string[]
  public_phone: string | null
  public_email: string | null
  entrance_notes: string
  wheelchair_access: Place['access']['wheelchairAccess']
  parking_notes: string | null
  hours_note: string | null
  additional_notes: string | null
  nearby_landmarks: Place['nearbyLandmarks']
  tags: string[]
  alternate_names: string[]
  verification_state: Place['verification']['state']
  last_checked_at: string | null
  verification_method: string | null
  checked_by: string | null
  corroborations: number
  photo_placeholder_count: number
  place_sources: SourceRow[]
}

const PLACE_SELECT = `
  id, name, category, barangay, address, latitude, longitude, description, services,
  public_phone, public_email, entrance_notes, wheelchair_access, parking_notes,
  hours_note, additional_notes, nearby_landmarks, tags, alternate_names,
  verification_state, last_checked_at, verification_method, checked_by,
  corroborations, photo_placeholder_count,
  place_sources(id, field_key, source_name, source_url, source_type, checked_at)
`

let client: ReturnType<typeof createSupabaseClient> | undefined

function publishedPlaces() {
  client ??= createSupabaseClient()
  return client.from('places').select(PLACE_SELECT).eq('publication_state', 'published')
}

function toPlace(row: PlaceRow): Place {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    barangay: row.barangay,
    address: row.address,
    location: row.latitude === null || row.longitude === null ? null : { lat: row.latitude, lng: row.longitude },
    description: row.description,
    services: row.services,
    publicPhone: row.public_phone,
    publicEmail: row.public_email,
    sources: row.place_sources.map((source) => ({
      id: source.id, fieldKey: source.field_key, sourceName: source.source_name,
      sourceUrl: source.source_url, sourceType: source.source_type, checkedAt: source.checked_at,
    })),
    access: {
      entranceNotes: row.entrance_notes, wheelchairAccess: row.wheelchair_access,
      parkingNotes: row.parking_notes, hoursNote: row.hours_note, additionalNotes: row.additional_notes,
    },
    nearbyLandmarks: row.nearby_landmarks,
    tags: row.tags,
    alternateNames: row.alternate_names,
    verification: {
      state: row.verification_state, lastCheckedAt: row.last_checked_at,
      method: row.verification_method, checkedBy: row.checked_by, corroborations: row.corroborations,
    },
    photoPlaceholderCount: row.photo_placeholder_count,
  }
}

export async function fetchPlaces(): Promise<Place[]> {
  if (isLocalPilotPreview) return [...pilotPlaces].sort((a, b) => a.name.localeCompare(b.name))
  const { data, error } = await publishedPlaces().order('name').overrideTypes<PlaceRow[], { merge: false }>()
  if (error) throw new Error('The directory could not be loaded. Please try again.')
  return (data ?? []).map(toPlace)
}

export async function fetchPlaceById(id: string): Promise<Place | null> {
  if (isLocalPilotPreview) return pilotPlaces.find((place) => place.id === id) ?? null
  const { data, error } = await publishedPlaces().eq('id', id).maybeSingle().overrideTypes<PlaceRow | null, { merge: false }>()
  if (error) throw new Error('This place could not be loaded. Please try again.')
  return data ? toPlace(data) : null
}
