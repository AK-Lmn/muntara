import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { TextArea } from '@/components/ui/TextArea'
import { CorrectionStatusBadge } from '@/components/corrections/CorrectionStatusBadge'
import {
  availableSubmitterActions,
  fetchCorrections,
  replyToCorrection,
  withdrawCorrection,
  type SubmitterAction,
} from '@/lib/mockApi'
import type { Correction } from '@/types'

/** The mock session's submissions are labeled this way at submit time. */
const SUBMITTER_LABEL = 'You (mock session)'

const STATUS_HINT: Partial<Record<Correction['status'], string>> = {
  pending: 'Waiting in the moderation queue.',
  in_review: 'A moderator is looking at this.',
  needs_more_info: 'A moderator needs more from you — reply below.',
  accepted: 'Accepted and applied to the listing.',
  rejected: 'Not accepted. The reason is above.',
  withdrawn: 'You withdrew this.',
}

function SubmitterActions({
  correction,
  onSubmit,
}: {
  correction: Correction
  onSubmit: (action: SubmitterAction, note?: string) => Promise<string | undefined>
}) {
  const [replying, setReplying] = useState(false)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const actions = availableSubmitterActions(correction.status)
  if (actions.length === 0) return null

  async function run(action: SubmitterAction) {
    setBusy(true)
    setError(null)
    const message = await onSubmit(action, note)
    setBusy(false)
    if (message) setError(message)
    else {
      setReplying(false)
      setNote('')
    }
  }

  return (
    <div className="mt-3 border-t border-slate-100 pt-3">
      {replying ? (
        <div className="space-y-2">
          <TextArea
            label="What did you find out?"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          {error && <p className="text-sm font-medium text-red-600">{error}</p>}
          <div className="flex gap-2">
            <Button size="sm" disabled={busy} onClick={() => run('reply')}>
              {busy ? 'Sending…' : 'Send reply'}
            </Button>
            <Button size="sm" variant="ghost" disabled={busy} onClick={() => setReplying(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {actions.includes('reply') && (
            <Button size="sm" onClick={() => setReplying(true)} disabled={busy}>
              Provide the info
            </Button>
          )}
          {actions.includes('withdraw') && (
            <Button size="sm" variant="ghost" disabled={busy} onClick={() => run('withdraw')}>
              Withdraw
            </Button>
          )}
          {error && <p className="w-full text-sm font-medium text-red-600">{error}</p>}
        </div>
      )}
    </div>
  )
}

/**
 * Status tracker for the submitter. In a real deployment this would show
 * only the signed-in user's own submissions; with no accounts yet, items
 * submitted from this session are shown as "yours", and the seeded demo
 * entries are shown only when you have none of your own.
 */
export function MyCorrectionsPage() {
  const [corrections, setCorrections] = useState<Correction[]>([])
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    fetchCorrections().then(setCorrections)
  }, [])

  const mine = corrections.filter((c) => c.submittedBy === SUBMITTER_LABEL)
  const showingDemo = mine.length === 0
  const list = showingDemo ? corrections : mine

  async function handleSubmitterAction(id: string, action: SubmitterAction, note?: string): Promise<string | undefined> {
    setBusyId(id)
    try {
      const updated = action === 'reply' ? await replyToCorrection(id, note ?? '') : await withdrawCorrection(id)
      setCorrections((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
      return undefined
    } catch (error) {
      return error instanceof Error ? error.message : 'Something went wrong'
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5 pb-6">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <ClipboardList size={22} className="text-brand-600" />
          Your corrections
        </h1>
        <p className="mt-0.5 text-sm text-slate-500">
          What happened to what you reported — moderators' notes are shown as-is. Nothing here persists past a reload.
        </p>
      </div>

      {showingDemo && list.length > 0 && (
        <Card className="border-dashed p-3.5 text-sm text-slate-600">
          You haven't submitted anything this session, so these are the seeded demo entries. Prototype note: a real
          version would show only your own submissions. <Link to="/corrections/new" className="font-medium text-brand-700 hover:underline">Suggest a correction</Link> to add one.
        </Card>
      )}

      {list.length === 0 && (
        <EmptyState
          icon={<ClipboardList size={28} />}
          title="Nothing submitted yet"
          description="Corrections you send show up here with their status."
        />
      )}

      <div className="space-y-3">
        {list.map((correction) => (
          <Card key={correction.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{correction.placeName}</p>
                <p className="text-xs text-slate-500">
                  {correction.field} · submitted {correction.submittedAt}
                </p>
              </div>
              <CorrectionStatusBadge status={correction.status} />
            </div>

            <p className="mt-2.5 text-sm text-slate-700">{correction.proposedChange}</p>
            {correction.submitterNote && (
              <p className="mt-1 whitespace-pre-line text-xs italic text-slate-500">"{correction.submitterNote}"</p>
            )}

            <p className="mt-2 text-xs text-slate-500">{STATUS_HINT[correction.status]}</p>

            {correction.moderationNotes && (
              <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                Moderator note: {correction.moderationNotes}
              </p>
            )}

            {busyId === correction.id ? (
              <p className="mt-3 text-xs text-slate-500">Saving…</p>
            ) : (
              <SubmitterActions
                correction={correction}
                onSubmit={(action, note) => handleSubmitterAction(correction.id, action, note)}
              />
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
