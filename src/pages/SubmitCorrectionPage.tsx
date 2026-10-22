import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, ShieldAlert } from 'lucide-react'
import { Select } from '@/components/ui/Select'
import { TextArea } from '@/components/ui/TextArea'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { CATEGORY_META } from '@/components/places/categoryMeta'
import { fetchPlaces, sessionSubmissionCount, submitCorrection } from '@/lib/mockApi'
import type { CorrectionFieldTarget, Place, PlaceCategory } from '@/types'

const FIELD_OPTIONS: { value: CorrectionFieldTarget; label: string }[] = [
  { value: 'name', label: 'Place name' },
  { value: 'address', label: 'Address' },
  { value: 'access', label: 'Entrance / access info' },
  { value: 'landmarks', label: 'Nearby landmarks' },
  { value: 'category', label: 'Category' },
  { value: 'hours', label: 'Hours' },
  { value: 'other', label: 'Something else' },
]

export function SubmitCorrectionPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const preselectedPlaceId = searchParams.get('placeId')

  const [places, setPlaces] = useState<Place[]>([])
  const [placeId, setPlaceId] = useState(preselectedPlaceId ?? '')
  const [field, setField] = useState<CorrectionFieldTarget>('access')
  const [proposedChange, setProposedChange] = useState('')
  const [newValue, setNewValue] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const needsNewValue = field !== 'other'

  useEffect(() => {
    fetchPlaces().then((loaded) => {
      setPlaces(loaded)
      if (!preselectedPlaceId && loaded[0]) setPlaceId(loaded[0].id)
    })
  }, [preselectedPlaceId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const place = places.find((p) => p.id === placeId)
    if (!place || !proposedChange.trim()) return
    if (needsNewValue && !newValue.trim()) return

    setSubmitting(true)
    await submitCorrection({
      placeId: place.id,
      placeName: place.name,
      field,
      proposedChange: proposedChange.trim(),
      newValue: needsNewValue ? newValue.trim() : null,
      submitterNote: note.trim() || null,
      submittedBy: 'You (mock session)',
    })
    setSubmitting(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <CheckCircle2 size={40} className="text-brand-600" />
        <div>
          <h1 className="text-lg font-bold text-slate-900">Correction submitted</h1>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            This is a prototype — your submission was added to the in-memory moderation queue for this session only.
            It won't persist after a page reload, and nothing was sent anywhere.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate('/corrections')}>
            Track your corrections
          </Button>
          <Button onClick={() => navigate('/')}>Back to Explore</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg space-y-5 pb-6">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700">
        <ArrowLeft size={16} />
        Back
      </Link>

      <div>
        <h1 className="text-xl font-bold text-slate-900">Suggest a correction</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Help keep place information accurate. Submissions are reviewed by moderators before they affect the public
          listing — you can follow each one's status on the{' '}
          <Link to="/corrections" className="font-medium text-brand-700 hover:underline">
            corrections tracker
          </Link>
          .
        </p>
      </div>

      <Card className="flex gap-2.5 border-amber-200 bg-amber-50 p-3.5 text-sm text-amber-800">
        <ShieldAlert size={18} className="mt-0.5 shrink-0" />
        <p>
          Prototype note: this form doesn't send data anywhere real. Spam/abuse protections (rate limiting, trust
          scoring, account history) are represented here only as a placeholder "trust signal" visible to moderators —
          see the README for the planned approach.
        </p>
      </Card>

      {sessionSubmissionCount() >= 4 && (
        <Card className="flex gap-2.5 border-amber-200 bg-amber-50 p-3.5 text-sm text-amber-800">
          <ShieldAlert size={18} className="mt-0.5 shrink-0" />
          <p>
            You've submitted several corrections from this session. Moderators see a per-submitter count, and in a real
            deployment this is where a rate limit or a longer look at your history would kick in.
          </p>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Select label="Which place?" value={placeId} onChange={(e) => setPlaceId(e.target.value)} required>
          {places.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>

        <Select
          label="What needs fixing?"
          value={field}
          onChange={(e) => setField(e.target.value as CorrectionFieldTarget)}
        >
          {FIELD_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>

        <TextArea
          label="What should it say instead?"
          placeholder="Describe the correction as specifically as you can…"
          rows={4}
          value={proposedChange}
          onChange={(e) => setProposedChange(e.target.value)}
          required
        />

        {field === 'category' ? (
          <Select
            label="Which category should it be?"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            required
          >
            <option value="">Choose a category…</option>
            {(Object.keys(CATEGORY_META) as PlaceCategory[]).map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_META[cat].label}
              </option>
            ))}
          </Select>
        ) : field !== 'other' ? (
          <TextArea
            label="Exactly what should it say?"
            placeholder="The final wording a moderator could copy straight in…"
            rows={2}
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            hint="Give the exact replacement text — a moderator can accept it as-is. Without it they can only mark your note as reviewed."
            required
          />
        ) : null}

        <TextArea
          label="Anything else moderators should know? (optional)"
          placeholder="E.g. when you last visited, how you know this"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          hint="Context like this helps moderators verify faster — it won't be shown publicly in this prototype."
        />

        <Button
          type="submit"
          fullWidth
          disabled={submitting || !proposedChange.trim() || (needsNewValue && !newValue.trim())}
        >
          {submitting ? 'Submitting…' : 'Submit correction'}
        </Button>
      </form>
    </div>
  )
}
