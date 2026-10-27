import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Info, ShieldAlert } from 'lucide-react'
import { Combobox } from '@/components/ui/Combobox'
import { TextArea } from '@/components/ui/TextArea'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { CATEGORY_META } from '@/components/places/categoryMeta'
import { submitCorrection } from '@/lib/mockApi'
import { fetchPlaces } from '@/lib/placeApi'
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
  const [placesLoading, setPlacesLoading] = useState(true)
  const [placesError, setPlacesError] = useState(false)
  const [loadAttempt, setLoadAttempt] = useState(0)
  const [placeId, setPlaceId] = useState(preselectedPlaceId ?? '')
  const [field, setField] = useState<CorrectionFieldTarget>('access')
  const [proposedChange, setProposedChange] = useState('')
  const [newValue, setNewValue] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const needsNewValue = field !== 'other'

  useEffect(() => {
    let active = true
    fetchPlaces().then((loaded) => {
      if (!active) return
      setPlaces(loaded)
      const selectedExists = loaded.some((place) => place.id === preselectedPlaceId)
      setPlaceId(selectedExists ? preselectedPlaceId ?? '' : loaded[0]?.id ?? '')
    }).catch(() => {
      if (active) setPlacesError(true)
    }).finally(() => {
      if (active) setPlacesLoading(false)
    })
    return () => { active = false }
  }, [preselectedPlaceId, loadAttempt])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const place = places.find((p) => p.id === placeId)
    if (!place || !proposedChange.trim()) return
    if (needsNewValue && !newValue.trim()) return

    setSubmitting(true)
    setSubmitError(null)
    try {
      await submitCorrection({
        placeId: place.id,
        placeName: place.name,
        field,
        proposedChange: proposedChange.trim(),
        newValue: needsNewValue ? newValue.trim() : null,
        submitterNote: note.trim() || null,
        submittedBy: 'You (mock session)',
      })
      setSubmitted(true)
    } catch {
      setSubmitError('This correction could not be added. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto flex min-h-96 max-w-xl flex-col items-start justify-center gap-5">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-800">
          <CheckCircle2 size={24} aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-display font-bold leading-tight tracking-tight text-ink">Added to this session</h1>
          <p className="mt-3 max-w-[48ch] text-base leading-relaxed text-copy">
            This preview does not send or save corrections beyond this browser session. You can still see this report in the session tracker.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button variant="secondary" onClick={() => navigate('/corrections')}>
            View session tracker
          </Button>
          <Button onClick={() => navigate('/')}>Back to directory</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-8">
      <Link to="/" className="group inline-flex min-h-11 items-center gap-2 rounded-md pr-3 text-sm font-semibold text-copy hover:text-brand-800">
        <ArrowLeft size={17} aria-hidden="true" className="transition-transform group-hover:-translate-x-0.5" />Back to directory
      </Link>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
        <div>
          <p className="text-sm font-semibold text-brand-800">Help keep a listing useful</p>
          <h1 className="mt-3 max-w-[18ch] text-display font-bold leading-tight tracking-tight text-ink sm:text-display-lg">Suggest a correction</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-copy">
            Tell us what needs changing. No account is needed for this preview.
          </p>
        </div>
        <Card className="flex items-start gap-3 p-4">
          <ShieldAlert size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-brand-800" />
          <p className="text-sm leading-relaxed text-copy">
            Preview only. Reports stay in this browser session and are not sent to an office or saved after reload.
          </p>
        </Card>
      </section>

      <div className="grid gap-9 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <section className="min-w-0" aria-labelledby="correction-form-heading">
          <h2 id="correction-form-heading" className="sr-only">Correction details</h2>
          {placesLoading ? (
            <p role="status" className="rounded-lg border border-line bg-surface p-5 text-sm text-muted">Loading directory listings...</p>
          ) : placesError ? (
            <div role="alert" className="rounded-lg border border-line bg-surface p-5">
              <p className="font-semibold text-ink">Listings unavailable</p>
              <p className="mt-1 text-sm text-copy">Reload the directory and try again.</p>
              <Button variant="secondary" size="sm" className="mt-4" onClick={() => {
                setPlacesLoading(true)
                setPlacesError(false)
                setLoadAttempt((attempt) => attempt + 1)
              }}>Try again</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-line bg-surface p-5 sm:p-7">
              <Combobox label="Which place needs an update?" value={placeId}
                onChange={(event) => setPlaceId(event.target.value)} required>
                {places.map((place) => <option key={place.id} value={place.id}>{place.name}, {place.barangay}</option>)}
              </Combobox>

              <Combobox label="What needs fixing?" value={field}
                onChange={(event) => { setField(event.target.value as CorrectionFieldTarget); setNewValue('') }}>
                {FIELD_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </Combobox>

              <TextArea label="What is wrong?" placeholder="Describe the detail that needs an update."
                rows={4} value={proposedChange} onChange={(event) => setProposedChange(event.target.value)} required />

              {field === 'category' ? (
                <Combobox label="What category should it use?" value={newValue}
                  onChange={(event) => setNewValue(event.target.value)} required>
                  <option value="">Choose a category</option>
                  {(Object.keys(CATEGORY_META) as PlaceCategory[]).map((category) => (
                    <option key={category} value={category}>{CATEGORY_META[category].label}</option>
                  ))}
                </Combobox>
              ) : field !== 'other' ? (
                <TextArea label="What should the listing say instead?" placeholder="Enter the exact replacement text."
                  rows={3} value={newValue} onChange={(event) => setNewValue(event.target.value)}
                  hint="A moderator can use this exact wording when the correction flow is connected." required />
              ) : null}

              <TextArea label="Anything else to help check this? (optional)"
                placeholder="For example, when you last visited or where you found the information."
                rows={3} value={note} onChange={(event) => setNote(event.target.value)} />

              {submitError && <p role="alert" className="text-sm font-semibold text-danger-700">{submitError}</p>}
              <Button type="submit" fullWidth loading={submitting}
                disabled={!placeId || !proposedChange.trim() || (needsNewValue && !newValue.trim())}>
                {submitting ? 'Adding report...' : 'Add report to this session'}
              </Button>
            </form>
          )}
        </section>

        <aside className="space-y-6">
          <section className="space-y-3" aria-labelledby="before-heading">
            <div className="flex items-center gap-2 text-brand-800">
              <Info size={18} aria-hidden="true" />
              <h2 id="before-heading" className="font-semibold text-ink">Before you report</h2>
            </div>
            <ul className="space-y-3 text-sm leading-relaxed text-copy">
              <li>Share a specific detail, such as an address, service, or opening time.</li>
              <li>Do not include personal or medical information.</li>
              <li>Use the <Link to="/corrections" className="font-semibold text-brand-800 underline underline-offset-4 hover:text-brand-950">session tracker</Link> to view reports added before you reload.</li>
            </ul>
          </section>
          <p className="border-t border-line pt-4 text-xs leading-relaxed text-muted">
            In the full pilot, corrections will be reviewed before any public listing changes.
          </p>
        </aside>
      </div>
    </div>
  )
}
