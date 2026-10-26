import { ExternalLink } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import type { PlaceSource } from '@/types'

const FIELD_LABELS: Record<string, string> = {
  name: 'Name', category: 'Category', barangay: 'Barangay', address: 'Address', location: 'Map coordinates',
  description: 'Description', services: 'Services', publicPhone: 'Public phone', publicEmail: 'Public email',
  'access.entranceNotes': 'Entrance', 'access.wheelchairAccess': 'Wheelchair access',
  'access.parkingNotes': 'Parking', 'access.hoursNote': 'Opening hours', 'access.additionalNotes': 'Other access notes',
}

const SOURCE_LABELS: Record<PlaceSource['sourceType'], string> = {
  official: 'Official source checked',
  field_visit: 'Visited in person',
  openstreetmap: 'Map coordinates from OpenStreetMap',
}

function safeUrl(value: string | null): string | null {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null
  } catch {
    return null
  }
}

export function PlaceSourcesPanel({ sources }: { sources: PlaceSource[] }) {
  const groups = new Map<string, { source: PlaceSource; fields: Set<string> }>()
  for (const source of sources) {
    const key = JSON.stringify([source.sourceName, source.sourceUrl, source.sourceType, source.checkedAt])
    const group = groups.get(key) ?? { source, fields: new Set<string>() }
    group.fields.add(FIELD_LABELS[source.fieldKey] ?? source.fieldKey)
    groups.set(key, group)
  }

  return (
    <Card className="p-4">
      <h2 className="font-semibold text-slate-900">Sources</h2>
      <p className="mt-1 text-sm text-slate-500">Each source supports only the fields shown. An official listing does not confirm an in-person visit.</p>
      {groups.size === 0 ? <p className="mt-3 text-sm text-slate-500">Not confirmed</p> : (
        <ul className="mt-3 space-y-4">
          {[...groups.entries()].map(([key, { source, fields }]) => {
            const url = safeUrl(source.sourceUrl)
            const date = new Date(source.checkedAt)
            const checkedAt = Number.isNaN(date.getTime()) ? 'Not confirmed' : date.toLocaleDateString('en-PH', {
              year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC',
            })
            return (
              <li key={key} className="space-y-1 text-sm">
                <p className="font-medium text-slate-800">{SOURCE_LABELS[source.sourceType]}</p>
                {url ? (
                  <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-1 break-words text-brand-700 underline underline-offset-2">
                    {source.sourceName}<ExternalLink size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ) : <p className="text-slate-700">{source.sourceName}</p>}
                <p className="text-slate-600">Checked: {checkedAt}</p>
                <p className="text-slate-600">Fields: {[...fields].join(', ')}</p>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
