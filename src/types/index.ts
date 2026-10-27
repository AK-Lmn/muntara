/**
 * Core data model for Muntinlupa Explorer.
 *
 * NOTE ON DATA TRUST: Nothing in this app should ever claim to be verified
 * real-world information unless it was actually checked by a human against
 * the physical location. The types below exist specifically to make that
 * distinction impossible to skip: every place and every route carries an
 * explicit VerificationStatus, and UI components are expected to render it
 * rather than hide it.
 */

/** Broad category used for filtering and map markers. */
export type PlaceCategory =
  | 'government'
  | 'health'
  | 'education'
  | 'transport'
  | 'food'
  | 'park_recreation'
  | 'worship'
  | 'shopping'
  | 'emergency_services'
  | 'lodging'
  | 'other'

/**
 * How confident we are in a piece of information, and why.
 * This is intentionally more granular than a boolean "verified" flag.
 */
export type VerificationState =
  /** Checked in person (or via an authoritative source) within the freshness window. */
  | 'verified'
  /** Submitted or edited by a community member; not yet independently checked. */
  | 'community_reported'
  /** A correction or new entry is sitting in the moderation queue. */
  | 'awaiting_review'
  /** Was verified previously, but enough time has passed that it may be stale. */
  | 'needs_recheck'
  /** Explicitly flagged as possibly wrong (e.g. a correction was accepted and old copy lingers, or reports conflict). */
  | 'disputed'

export interface VerificationMeta {
  state: VerificationState
  /** ISO date string of the last time this was actually checked against reality. Null if never. */
  lastCheckedAt: string | null
  /** Free-text description of how it was checked, e.g. "Visited in person", "Cross-checked with barangay listing". Placeholder in this prototype. */
  method: string | null
  /** Display name / role of whoever last checked it: kept generic in mock data (e.g. "Community volunteer"). */
  checkedBy: string | null
  /** Number of independent community reports that agree with current info. */
  corroborations: number
}

export interface GeoPoint {
  lat: number
  lng: number
}

export interface AccessInfo {
  /** Human-readable entrance description, e.g. "Main gate faces Civic Drive, beside the flagpole." */
  entranceNotes: string
  /** Whether the entrance is step-free / ramp accessible. 'unknown' is a valid and expected value in mock data. */
  wheelchairAccess: 'yes' | 'no' | 'partial' | 'unknown'
  /** Parking availability notes. */
  parkingNotes: string | null
  /** Opening hours, when someone has reported them. Null means "not reported". */
  hoursNote: string | null
  /** Any other practical access notes (gate hours, guard checkpoints, etc.) */
  additionalNotes: string | null
}

export interface Landmark {
  name: string
  /** Rough relation for orientation, e.g. "Across the street", "2 blocks north". Deliberately qualitative, not a precise distance claim. */
  relativePosition: string
}

export type PilotBarangay = 'Tunasan' | 'Poblacion' | 'Putatan'

export interface PlaceSource {
  id: string
  fieldKey: string
  sourceName: string
  sourceUrl: string | null
  sourceType: 'official' | 'field_visit' | 'openstreetmap'
  checkedAt: string
}

export interface Place {
  id: string
  name: string
  category: PlaceCategory
  barangay: string
  address: string | null
  /** Null when reliable coordinates have not been confirmed. */
  location: GeoPoint | null
  description: string
  services: string[]
  publicPhone: string | null
  publicEmail: string | null
  sources: PlaceSource[]
  access: AccessInfo
  nearbyLandmarks: Landmark[]
  tags: string[]
  /** Local names / alternate spellings commonly used by residents, kept alongside the formal name. */
  alternateNames: string[]
  verification: VerificationMeta
  /** Placeholder for future photo support: prototype uses labeled placeholder blocks, not real images. */
  photoPlaceholderCount: number
}

export type CorrectionFieldTarget =
  | 'name'
  | 'address'
  | 'access'
  | 'landmarks'
  | 'category'
  | 'hours'
  | 'other'

export type CorrectionStatus =
  | 'pending'
  | 'in_review'
  | 'accepted'
  | 'rejected'
  | 'needs_more_info'
  /** Withdrawn by the submitter before a moderator resolved it. */
  | 'withdrawn'

/** Why a moderator rejected a correction. 'conflict' also flags the place as disputed. */
export type RejectReason = 'spam' | 'conflict'

export interface Correction {
  id: string
  placeId: string
  placeName: string
  field: CorrectionFieldTarget
  /** What the submitter says should change. */
  proposedChange: string
  /**
   * The exact replacement text for the targeted field, when the submitter gave
   * one. Null for older/seed entries and for 'other'. Accepting a correction
   * only rewrites the place when this is present.
   */
  newValue: string | null
  /** Optional note/justification from the submitter. */
  submitterNote: string | null
  /** Pseudonymous submitter label only: no real accounts in this prototype. */
  submittedBy: string
  submittedAt: string
  status: CorrectionStatus
  /** Set when a moderator rejects with a reason. Null otherwise. */
  rejectReason: RejectReason | null
  /** Simple heuristic score used as a spam/abuse signal placeholder (0-100, higher = more suspicious). */
  trustSignalScore: number
  moderationNotes: string | null
  /** Who/what resolved it, when applicable. */
  resolvedBy: string | null
  resolvedAt: string | null
}

export type RouteVerificationState =
  /** Drawn from map data only: nobody has walked it to confirm it's correct, safe, or currently passable. */
  | 'mapped_only'
  /** Walked in person and confirmed, within the freshness window. */
  | 'field_verified'
  /** Was field verified before, but old enough it should be rechecked. */
  | 'field_verified_stale'

export interface RouteSegmentNote {
  description: string
  /** e.g. "uneven pavement", "no sidewalk, shares road with traffic", "well-lit at night" */
  caution: string | null
}

export interface WalkingRoute {
  id: string
  name: string
  startPlaceId: string
  endPlaceId: string
  /** Placeholder polyline: prototype only, not a routed path from a real mapping engine. */
  pathPlaceholder: GeoPoint[]
  distanceMeters: number
  estimatedMinutes: number
  verification: RouteVerificationState
  lastFieldCheckAt: string | null
  /** Plain-language uncertainty statement always shown next to the route: never omitted. */
  uncertaintyNote: string
  segmentNotes: RouteSegmentNote[]
  wheelchairFriendly: 'yes' | 'no' | 'partial' | 'unknown'
}

export type UserRole = 'visitor' | 'resident' | 'moderator'

/** Minimal mock session: this prototype has no real auth. */
export interface MockSession {
  displayName: string
  role: UserRole
}
