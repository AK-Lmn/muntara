import { useEffect, useState } from 'react'
import { ArrowUpRight, ClipboardList } from 'lucide-react'
import { Link } from 'react-router-dom'
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

/** The prototype labels submissions this way; they exist only for this browser session. */
const SUBMITTER_LABEL = 'You (mock session)'

const STATUS_HINT: Partial<Record<Correction['status'], string>> = {
  pending: 'Waiting in the moderation queue.',
  in_review: 'A moderator is looking at this.',
  needs_more_info: 'A moderator needs more from you. Reply below.',
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
    <div className="mt-3 border-t border-line pt-3">
      {replying ? (
        <div className="space-y-2">
          <TextArea
            label="What did you find out?"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          {error && <p className="text-sm font-medium text-danger-700">{error}</p>}
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
          {error && <p className="w-full text-sm font-medium text-danger-700">{error}</p>}
        </div>
      )}
    </div>
  )
}

/**
 * Status tracker for submissions created in this browser session.
 * Seeded demo reports are not shown as user submissions.
 */
export function MyCorrectionsPage() {
  const [corrections, setCorrections] = useState<Correction[]>([])
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    fetchCorrections().then(setCorrections)
  }, [])

  const mine = corrections.filter((c) => c.submittedBy === SUBMITTER_LABEL)
  const list = mine

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
    <div className="mx-auto max-w-4xl space-y-8 pb-8">
      <header className="grid gap-5 border-b border-line pb-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-brand-800"><ClipboardList size={17} aria-hidden="true" />Correction tracker</p>
          <h1 className="mt-3 text-display font-bold leading-tight tracking-tight text-ink sm:text-display-lg">Your reports</h1>
          <p className="mt-3 max-w-[52ch] text-base leading-relaxed text-copy">
            Reports added here stay in this browser session. Reloading clears them.
          </p>
        </div>
        <Link to="/corrections/new" className="tap-target inline-flex items-center justify-center gap-2 rounded-md bg-action-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-action-primary-hover active:bg-action-primary-active focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas">
          Suggest an edit<ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </header>

      {list.length === 0 && (
        <EmptyState
          icon={<ClipboardList size={28} />}
          title="Nothing reported this session"
          description="Add a correction to see it here until you reload this preview."
          action={<Link to="/corrections/new" className="tap-target inline-flex items-center rounded-md bg-action-primary px-4 py-2 text-sm font-semibold text-white hover:bg-action-primary-hover">Suggest an edit</Link>}
        />
      )}

      <div className="space-y-3">
        {list.map((correction) => (
          <Card key={correction.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-ink">{correction.placeName}</p>
                <p className="text-xs text-muted">
                  {correction.field} · submitted {correction.submittedAt}
                </p>
              </div>
              <CorrectionStatusBadge status={correction.status} />
            </div>

            <p className="mt-2.5 text-sm text-copy">{correction.proposedChange}</p>
            {correction.submitterNote && (
              <p className="mt-1 whitespace-pre-line text-xs italic text-muted">"{correction.submitterNote}"</p>
            )}

            <p className="mt-2 text-xs text-muted">{STATUS_HINT[correction.status]}</p>

            {correction.moderationNotes && (
              <p className="mt-2 rounded-lg bg-canvas px-3 py-2 text-xs text-copy">
                Moderator note: {correction.moderationNotes}
              </p>
            )}

            {busyId === correction.id ? (
              <p className="mt-3 text-xs text-muted">Saving…</p>
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
