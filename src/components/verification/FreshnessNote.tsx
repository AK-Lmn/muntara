import { CalendarCheck, HelpCircle } from 'lucide-react'
import type { PlaceSource, VerificationMeta } from '@/types'

interface FreshnessNoteProps {
  verification: VerificationMeta
  sources: PlaceSource[]
}

function formatDate(iso: string | null): string {
  if (!iso) return 'Not confirmed'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'Not confirmed'
  return date.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })
}

function latestCheck(sources: PlaceSource[], type: PlaceSource['sourceType']): string | null {
  return sources.filter((source) => source.sourceType === type && !Number.isNaN(Date.parse(source.checkedAt)))
    .sort((a, b) => Date.parse(b.checkedAt) - Date.parse(a.checkedAt))[0]?.checkedAt ?? null
}

/**
 * Plain-language "when and how was this checked" block. Always renders,
 * even when there's nothing to show (lastCheckedAt is null) — an explicit
 * "never checked" beats silence, which could be misread as "fine."
 */
export function FreshnessNote({ verification, sources }: FreshnessNoteProps) {
  const officialCheck = latestCheck(sources, 'official')
  const fieldCheck = latestCheck(sources, 'field_visit')

  return (
    <div className="flex items-start gap-2 rounded-xl bg-slate-50 px-3.5 py-3 text-sm text-slate-600 dark:bg-white/5">
      {officialCheck || fieldCheck ? (
        <CalendarCheck size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-slate-400" />
      ) : (
        <HelpCircle size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-slate-400" />
      )}
      <div className="space-y-1">
        <p><span className="font-medium text-slate-800">Official source checked:</span> {formatDate(officialCheck)}</p>
        <p><span className="font-medium text-slate-800">Visited in person:</span> {formatDate(fieldCheck)}</p>
        <p className="text-slate-500">Checks apply only to the fields listed in Sources below.</p>
        {verification.lastCheckedAt && (
          <p><span className="font-medium text-slate-800">Review recorded:</span> {formatDate(verification.lastCheckedAt)}</p>
        )}
        {verification.method && <p className="text-slate-500">{verification.method}</p>}
        {verification.corroborations > 0 && (
          <p className="text-slate-500">
            {verification.corroborations} community {verification.corroborations === 1 ? 'report agrees' : 'reports agree'} with this information
          </p>
        )}
      </div>
    </div>
  )
}
