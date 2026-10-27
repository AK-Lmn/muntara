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
    <Card className="p-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-700">Evidence</p>
        <h2 className="mt-1 text-lg font-bold text-ink">Sources</h2>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-copy">Each source supports only the fields listed. An official page does not confirm an in-person visit.</p>
      {groups.size === 0 ? <p className="mt-4 text-sm text-muted">Sources not confirmed</p> : (
        <ul className="mt-4 divide-y divide-line">
          {[...groups.entries()].map(([key, { source, fields }]) => {
            const url = safeUrl(source.sourceUrl)
            const date = new Date(source.checkedAt)
            const checkedAt = Number.isNaN(date.getTime()) ? 'Not confirmed' : date.toLocaleDateString('en-PH', {
              year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC',
            })
            return (
              <li key={key} className="space-y-2 py-4 text-sm first:pt-0 last:pb-0">
                <p className="font-semibold text-ink">{SOURCE_LABELS[source.sourceType]}</p>
                {url ? (
                  <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1 break-all font-semibold text-brand-800 underline underline-offset-4 hover:text-brand-950">
                    {source.sourceName}<ExternalLink size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ) : <p className="text-copy">{source.sourceName}</p>}
                <p className="text-copy"><span className="font-semibold">Checked:</span> {checkedAt}</p>
                <p className="text-copy"><span className="font-semibold">Supports:</span> {[...fields].join(', ')}</p>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
