import { useEffect, useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Chip } from '@/components/ui/Chip'
import { EmptyState } from '@/components/ui/EmptyState'
import { CorrectionActions } from '@/components/corrections/CorrectionActions'
import { CorrectionStatusBadge } from '@/components/corrections/CorrectionStatusBadge'
import { TrustSignalMeter } from '@/components/corrections/TrustSignalMeter'
import { fetchCorrections, moderateCorrection, type ModerationDecision, type ModerationInput } from '@/lib/mockApi'
import type { Correction, CorrectionStatus, MockSession } from '@/types'

const STATUS_FILTERS: (CorrectionStatus | 'all')[] = [
  'all',
  'pending',
  'in_review',
  'accepted',
  'rejected',
  'needs_more_info',
  'withdrawn',
]

const STATUS_LABEL: Record<CorrectionStatus | 'all', string> = {
  all: 'All',
  pending: 'Pending',
  in_review: 'In review',
  accepted: 'Accepted',
  rejected: 'Rejected',
  needs_more_info: 'Needs info',
  withdrawn: 'Withdrawn',
}

/** What each decision becomes, for the optimistic update before the API answers. */
const OPTIMISTIC_STATUS: Record<ModerationDecision, CorrectionStatus> = {
  start_review: 'in_review',
  accept: 'accepted',
  reject: 'rejected',
  request_info: 'needs_more_info',
  reopen: 'in_review',
}

/**
 * Moderator queue. Actions are real in-memory state transitions (see
 * mockApi.ts); nothing persists beyond the session and there is no real
 * auth behind the role check — it just shows where the guard will live.
 */
export function ModerationPage({ session }: { session: MockSession }) {
  const [corrections, setCorrections] = useState<Correction[]>([])
  const [statusFilter, setStatusFilter] = useState<CorrectionStatus | 'all'>('all')

  useEffect(() => {
    fetchCorrections().then(setCorrections)
  }, [])

  if (session.role !== 'moderator') {
    return (
      <EmptyState
        icon={<ShieldCheck size={28} />}
        title="Moderator access required"
        description="This queue is only visible to moderators. A real deployment would check this against real accounts."
      />
    )
  }

  const filtered = corrections.filter((c) => statusFilter === 'all' || c.status === statusFilter)

  async function handleAction(
    correction: Correction,
    decision: ModerationDecision,
    input: ModerationInput,
  ): Promise<string | undefined> {
    const snapshot = corrections
    // Optimistic: show the new state immediately, then replace with the
    // authoritative record, or roll the whole list back if the API refuses.
    setCorrections((prev) =>
      prev.map((c) => (c.id === correction.id ? { ...c, status: OPTIMISTIC_STATUS[decision] } : c)),
    )
    try {
      const updated = await moderateCorrection(correction.id, decision, input, session.displayName)
      setCorrections((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
      return undefined
    } catch (error) {
      setCorrections(snapshot)
      return error instanceof Error ? error.message : 'Something went wrong'
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <ShieldCheck size={22} className="text-brand-600" />
          Moderation queue
        </h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Mock moderator view of community-submitted corrections. Actions update this session only — nothing is sent
          anywhere or stored beyond a reload.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((status) => (
          <Chip key={status} active={statusFilter === status} onClick={() => setStatusFilter(status)}>
            {STATUS_LABEL[status]}
          </Chip>
        ))}
      </div>

      {filtered.length === 0 && (
        <EmptyState icon={<ShieldCheck size={28} />} title="No corrections in this status" />
      )}

      <div className="space-y-3">
        {filtered.map((correction) => (
          <Card key={correction.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{correction.placeName}</p>
                <p className="text-xs text-slate-500">
                  Field: {correction.field} · Submitted {correction.submittedAt} by {correction.submittedBy}
                </p>
              </div>
              <CorrectionStatusBadge status={correction.status} />
            </div>

            <p className="mt-2.5 text-sm text-slate-700">{correction.proposedChange}</p>
            {correction.submitterNote && (
              <p className="mt-1 whitespace-pre-line text-sm italic text-slate-500">"{correction.submitterNote}"</p>
            )}

            <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
              <TrustSignalMeter score={correction.trustSignalScore} />
            </div>

            {correction.moderationNotes && (
              <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                Moderator note: {correction.moderationNotes}
              </p>
            )}

            {correction.resolvedBy && correction.resolvedAt && (
              <p className="mt-2 text-xs text-slate-500">
                Resolved by {correction.resolvedBy} on {correction.resolvedAt}
              </p>
            )}

            <CorrectionActions
              correction={correction}
              onSubmit={(decision, input) => handleAction(correction, decision, input)}
            />
          </Card>
        ))}
      </div>
    </div>
  )
}
