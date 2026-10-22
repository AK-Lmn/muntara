import { CalendarCheck, HelpCircle } from 'lucide-react'
import type { VerificationMeta } from '@/types'

interface FreshnessNoteProps {
  verification: VerificationMeta
}

function formatDate(iso: string | null): string {
  if (!iso) return 'never'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
}

/**
 * Plain-language "when and how was this checked" block. Always renders,
 * even when there's nothing to show (lastCheckedAt is null) — an explicit
 * "never checked" beats silence, which could be misread as "fine."
 */
export function FreshnessNote({ verification }: FreshnessNoteProps) {
  const { lastCheckedAt, method, checkedBy, corroborations } = verification

  return (
    <div className="flex items-start gap-2 rounded-xl bg-slate-50 px-3.5 py-3 text-sm text-slate-600 dark:bg-white/5">
      {lastCheckedAt ? (
        <CalendarCheck size={16} className="mt-0.5 shrink-0 text-slate-400" />
      ) : (
        <HelpCircle size={16} className="mt-0.5 shrink-0 text-slate-400" />
      )}
      <div className="space-y-0.5">
        <p>
          <span className="font-medium text-slate-800">Last checked:</span> {formatDate(lastCheckedAt)}
        </p>
        {method && <p className="text-slate-500">{method}</p>}
        {checkedBy && <p className="text-slate-500">By: {checkedBy}</p>}
        {corroborations > 0 && (
          <p className="text-slate-500">
            {corroborations} other {corroborations === 1 ? 'report' : 'reports'} agree with this
          </p>
        )}
      </div>
    </div>
  )
}
