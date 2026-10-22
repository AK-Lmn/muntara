import { mockPlaces } from '@/data/mockPlaces'
import { mockRoutes } from '@/data/mockRoutes'
import { mockCorrections } from '@/data/mockCorrections'
import type {
  Correction,
  CorrectionFieldTarget,
  CorrectionStatus,
  Place,
  PlaceCategory,
  RejectReason,
  WalkingRoute,
} from '@/types'

/**
 * This module stands in for a future real API client. Every function here
 * is async and returns promises so that swapping the body for a `fetch()`
 * call later does not require changing any calling component.
 *
 * Phase boundary: in the boilerplate/prototype phase, everything reads from
 * in-memory mock arrays. Nothing here touches a network or a database.
 *
 * NOTE: the fetch* functions return copies of the arrays because the arrays
 * below are mutated by the submit/moderate functions — returning the live
 * array would leave component state aliased to the store (stale or silently
 * changing).
 */

const LATENCY_MS = 150

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS))
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export async function fetchPlaces(): Promise<Place[]> {
  return delay([...mockPlaces])
}

export async function fetchPlaceById(id: string): Promise<Place | undefined> {
  return delay(mockPlaces.find((p) => p.id === id))
}

export async function fetchRoutes(): Promise<WalkingRoute[]> {
  return delay(mockRoutes)
}

export async function fetchRoutesForPlace(placeId: string): Promise<WalkingRoute[]> {
  return delay(mockRoutes.filter((r) => r.startPlaceId === placeId || r.endPlaceId === placeId))
}

export async function fetchCorrections(): Promise<Correction[]> {
  return delay([...mockCorrections])
}

// ---------------------------------------------------------------------------
// Submitting
// ---------------------------------------------------------------------------

/**
 * Prototype stand-in for a rate limit: counts submissions from this browser
 * session only. Not a real abuse control — see the README's Phase 2 notes.
 */
let sessionSubmissions = 0

export function sessionSubmissionCount(): number {
  return sessionSubmissions
}

/**
 * Prototype-only "submit" — appends to the in-memory array for the current
 * session only (nothing persists on reload). A real implementation would
 * POST to a backend and run the submission through the moderation pipeline
 * described in the README's data-sourcing-plan section.
 */
export async function submitCorrection(
  input: Omit<
    Correction,
    | 'id'
    | 'status'
    | 'rejectReason'
    | 'trustSignalScore'
    | 'moderationNotes'
    | 'resolvedBy'
    | 'resolvedAt'
    | 'submittedAt'
  >,
): Promise<Correction> {
  sessionSubmissions += 1
  const newCorrection: Correction = {
    ...input,
    id: `corr-local-${Date.now()}`,
    submittedAt: today(),
    status: 'pending',
    rejectReason: null,
    trustSignalScore: 0,
    moderationNotes: null,
    resolvedBy: null,
    resolvedAt: null,
  }
  mockCorrections.unshift(newCorrection)
  return delay(newCorrection)
}

// ---------------------------------------------------------------------------
// Moderation flow
//
// The transition rules below are the single source of truth for what each
// role may do to a correction and what it becomes. The UI derives its
// available buttons from the same rules (see CorrectionActions), so the two
// can't drift.
// ---------------------------------------------------------------------------

export type ModerationDecision = 'start_review' | 'accept' | 'reject' | 'request_info' | 'reopen'
export type SubmitterAction = 'reply' | 'withdraw'

export interface ModerationInput {
  /** Moderator's note. Required for reject / request_info / reopen, and for accept out of needs_more_info. */
  note?: string
  /** Reject only. 'conflict' also flags the place as disputed. */
  rejectReason?: RejectReason
  /** Accept only. Attests the moderator checked it in person or against a source. */
  confirmedInPerson?: boolean
}

interface FlowRule {
  from: CorrectionStatus[]
  to: CorrectionStatus
}

const FLOW_RULES: Record<ModerationDecision | SubmitterAction, FlowRule> = {
  start_review: { from: ['pending'], to: 'in_review' },
  accept: { from: ['pending', 'in_review', 'needs_more_info'], to: 'accepted' },
  reject: { from: ['pending', 'in_review', 'needs_more_info'], to: 'rejected' },
  request_info: { from: ['pending', 'in_review'], to: 'needs_more_info' },
  reopen: { from: ['accepted', 'rejected'], to: 'in_review' },
  reply: { from: ['needs_more_info'], to: 'in_review' },
  withdraw: { from: ['pending'], to: 'withdrawn' },
}

/** Decisions the UI should offer for a given status, in display order. */
export function availableDecisions(status: CorrectionStatus): ModerationDecision[] {
  return (Object.keys(FLOW_RULES) as (ModerationDecision | SubmitterAction)[]).filter(
    (action): action is ModerationDecision =>
      action !== 'reply' && action !== 'withdraw' && FLOW_RULES[action].from.includes(status),
  )
}

/** Submitter-side actions available for a given status. */
export function availableSubmitterActions(status: CorrectionStatus): SubmitterAction[] {
  return (['reply', 'withdraw'] as SubmitterAction[]).filter((a) => FLOW_RULES[a].from.includes(status))
}

const PLACE_CATEGORY_VALUES: PlaceCategory[] = [
  'government',
  'health',
  'education',
  'transport',
  'food',
  'park_recreation',
  'worship',
  'shopping',
  'emergency_services',
  'lodging',
  'other',
]

function isPlaceCategory(value: string): value is PlaceCategory {
  return (PLACE_CATEGORY_VALUES as string[]).includes(value)
}

/** Writes the correction's newValue into the matching place field, where we know how. */
const FIELD_APPLIERS: Partial<Record<CorrectionFieldTarget, (place: Place, value: string) => Place>> = {
  name: (p, v) => ({ ...p, name: v }),
  address: (p, v) => ({ ...p, address: v }),
  access: (p, v) => ({ ...p, access: { ...p.access, entranceNotes: v } }),
  hours: (p, v) => ({ ...p, access: { ...p.access, hoursNote: v } }),
  // Unknown/free-text category values are ignored rather than written as-is.
  category: (p, v) => (isPlaceCategory(v) ? { ...p, category: v } : p),
  landmarks: (p, v) => ({
    ...p,
    nearbyLandmarks: [...p.nearbyLandmarks, { name: v, relativePosition: 'Reported by residents (community)' }],
  }),
  // 'other' is intentionally not auto-applied: it has no target field.
}

/**
 * Resolves a correction's outcome onto the place it points at. Kept in one
 * place so the trust semantics are auditable: an accepted correction only
 * makes a place 'verified' when the moderator actually attests they checked
 * it — never just because someone submitted it.
 */
function applyToPlace(correction: Correction, decision: ModerationDecision, input: ModerationInput, moderator: string) {
  const index = mockPlaces.findIndex((p) => p.id === correction.placeId)
  if (index === -1) return
  const place = mockPlaces[index]
  let updated = place

  if (decision === 'accept' && correction.newValue) {
    const applier = FIELD_APPLIERS[correction.field]
    if (applier) updated = applier(updated, correction.newValue)
  }

  const verification = updated.verification
  if (decision === 'reject' && input.rejectReason === 'conflict') {
    updated = { ...updated, verification: { ...verification, state: 'disputed' } }
  } else if (decision === 'accept' && input.confirmedInPerson) {
    updated = {
      ...updated,
      verification: {
        ...verification,
        state: 'verified',
        lastCheckedAt: today(),
        method: 'Confirmed during correction review (mock)',
        checkedBy: moderator,
      },
    }
  } else if (decision === 'accept' && verification.state === 'verified') {
    // The content changed, so the previous field check no longer covers it.
    updated = { ...updated, verification: { ...verification, state: 'needs_recheck' } }
  } else if (decision === 'accept') {
    updated = {
      ...updated,
      verification: { ...verification, state: 'community_reported', corroborations: verification.corroborations + 1 },
    }
  }

  if (updated !== place) mockPlaces.splice(index, 1, updated)
}

function replaceCorrection(index: number, updated: Correction) {
  mockCorrections.splice(index, 1, updated)
}

function findOrThrow(id: string): { index: number; correction: Correction } {
  const index = mockCorrections.findIndex((c) => c.id === id)
  if (index === -1) throw new Error(`Correction ${id} not found`)
  return { index, correction: mockCorrections[index] }
}

/**
 * Moderator decision on a queue item. Throws on an unknown id or an
 * illegal transition — the caller is expected to catch and show the message.
 */
export async function moderateCorrection(
  id: string,
  decision: ModerationDecision,
  input: ModerationInput = {},
  moderator = 'Moderator (mock)',
): Promise<Correction> {
  const { index, correction } = findOrThrow(id)
  const rule = FLOW_RULES[decision]
  if (!rule.from.includes(correction.status)) {
    throw new Error(`Cannot "${decision}" a correction that is ${correction.status.replace('_', ' ')}`)
  }

  const note = input.note?.trim() || null
  const noteRequired =
    decision === 'reject' ||
    decision === 'request_info' ||
    decision === 'reopen' ||
    (decision === 'accept' && correction.status === 'needs_more_info')
  if (noteRequired && !note) {
    throw new Error('A note is required for this action')
  }
  if (decision === 'reject' && !input.rejectReason) {
    throw new Error('Pick a reason for rejecting')
  }

  const resolved = decision === 'accept' || decision === 'reject'
  const updated: Correction = {
    ...correction,
    status: rule.to,
    moderationNotes: note ?? correction.moderationNotes,
    rejectReason: decision === 'reject' ? input.rejectReason ?? null : null,
    resolvedBy: resolved ? moderator : decision === 'reopen' ? null : correction.resolvedBy,
    resolvedAt: resolved ? today() : decision === 'reopen' ? null : correction.resolvedAt,
  }

  replaceCorrection(index, updated)
  applyToPlace(updated, decision, input, moderator)
  return delay(updated)
}

/** Submitter adds the info a moderator asked for; the item goes back to review. */
export async function replyToCorrection(id: string, note: string): Promise<Correction> {
  const { index, correction } = findOrThrow(id)
  if (!FLOW_RULES.reply.from.includes(correction.status)) {
    throw new Error(`Cannot reply to a correction that is ${correction.status.replace('_', ' ')}`)
  }
  const trimmed = note.trim()
  if (!trimmed) throw new Error('Write what you found out before sending')

  const reply = `[Reply ${today()}] ${trimmed}`
  const updated: Correction = {
    ...correction,
    status: 'in_review',
    submitterNote: correction.submitterNote ? `${correction.submitterNote}\n${reply}` : reply,
  }
  replaceCorrection(index, updated)
  return delay(updated)
}

/** Submitter withdraws their own pending correction. */
export async function withdrawCorrection(id: string): Promise<Correction> {
  const { index, correction } = findOrThrow(id)
  if (!FLOW_RULES.withdraw.from.includes(correction.status)) {
    throw new Error('Only a pending correction can be withdrawn')
  }
  const updated: Correction = { ...correction, status: 'withdrawn' }
  replaceCorrection(index, updated)
  return delay(updated)
}
