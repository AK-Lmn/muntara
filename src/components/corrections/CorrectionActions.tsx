import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { TextArea } from '@/components/ui/TextArea'
import { availableDecisions, type ModerationDecision, type ModerationInput } from '@/lib/mockApi'
import type { Correction, RejectReason } from '@/types'

const DECISION_LABEL: Record<ModerationDecision, string> = {
  start_review: 'Start review',
  accept: 'Accept',
  reject: 'Reject',
  request_info: 'Request info',
  reopen: 'Re-open',
}

const DECISION_VARIANT: Record<ModerationDecision, 'primary' | 'secondary' | 'ghost' | 'danger'> = {
  start_review: 'ghost',
  accept: 'primary',
  reject: 'danger',
  request_info: 'secondary',
  reopen: 'ghost',
}

/** Actions that need the moderator to write something, and what to ask for. */
function noteLabel(decision: ModerationDecision, correction: Correction): string {
  switch (decision) {
    case 'reject':
      return 'Reason for rejection (required — the submitter sees this)'
    case 'request_info':
      return 'What do you need to know? (required)'
    case 'reopen':
      return 'Why re-open this? (required)'
    default:
      return correction.status === 'needs_more_info'
        ? 'Note (required — say what changed your mind)'
        : 'Note (optional)'
  }
}

interface CorrectionActionsProps {
  correction: Correction
  /** Runs the action; resolves to an error message, or undefined on success. */
  onSubmit: (decision: ModerationDecision, input: ModerationInput) => Promise<string | undefined>
}

/**
 * The moderator's controls for one queue item. Which buttons exist comes
 * from the same transition rules the API enforces (availableDecisions), so
 * the UI can't offer an action that will be rejected.
 */
export function CorrectionActions({ correction, onSubmit }: CorrectionActionsProps) {
  const [decision, setDecision] = useState<ModerationDecision | null>(null)
  const [note, setNote] = useState('')
  const [reason, setReason] = useState<RejectReason | ''>('')
  const [confirmed, setConfirmed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const decisions = availableDecisions(correction.status)
  if (decisions.length === 0) return null

  function reset() {
    setDecision(null)
    setNote('')
    setReason('')
    setConfirmed(false)
    setError(null)
  }

  async function run(action: ModerationDecision, input: ModerationInput) {
    setSubmitting(true)
    setError(null)
    const message = await onSubmit(action, input)
    setSubmitting(false)
    if (message) setError(message)
    else reset()
  }

  function handleButton(action: ModerationDecision) {
    if (action === 'start_review') {
      void run(action, {})
      return
    }
    setDecision(action)
    setError(null)
  }

  function handleConfirm() {
    if (!decision) return
    void run(decision, {
      note,
      rejectReason: reason || undefined,
      confirmedInPerson: confirmed,
    })
  }

  if (decision === null) {
    return (
      <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
        {decisions.map((action) => (
          <Button
            key={action}
            size="sm"
            variant={DECISION_VARIANT[action]}
            disabled={submitting}
            onClick={() => handleButton(action)}
          >
            {DECISION_LABEL[action]}
          </Button>
        ))}
      </div>
    )
  }

  return (
    <div className="mt-3 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-sm font-semibold text-slate-800">{DECISION_LABEL[decision]}</p>

      {decision === 'accept' && (
        <p className="rounded-lg bg-white px-3 py-2 text-xs text-slate-600">
          {correction.newValue ? (
            <>
              Will update <span className="font-medium">{correction.field}</span> to:{' '}
              <span className="font-medium text-slate-900">{correction.newValue}</span>
            </>
          ) : (
            <>
              No exact replacement text was given, so the place's wording won't change — only its verification status.
            </>
          )}
        </p>
      )}

      {decision === 'reject' && (
        <Select
          label="Reason (required)"
          value={reason}
          onChange={(e) => setReason(e.target.value as RejectReason | '')}
        >
          <option value="">Choose a reason…</option>
          <option value="spam">Spam / not a real correction</option>
          <option value="conflict">Conflicts with other reports (flags the place as disputed)</option>
        </Select>
      )}

      <TextArea
        label={noteLabel(decision, correction)}
        rows={3}
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      {decision === 'accept' && (
        <label className="flex gap-2.5 text-sm text-slate-700">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 shrink-0 accent-brand-600"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
          />
          <span>
            I confirmed this in person or against an authoritative source
            <span className="block text-xs text-slate-500">
              Leave unchecked if not — the place stays community-reported (or needs a recheck) rather than claiming to be
              verified.
            </span>
          </span>
        </label>
      )}

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <div className="flex gap-2">
        <Button size="sm" disabled={submitting} onClick={handleConfirm}>
          {submitting ? 'Saving…' : `Confirm ${DECISION_LABEL[decision].toLowerCase()}`}
        </Button>
        <Button size="sm" variant="ghost" disabled={submitting} onClick={reset}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
