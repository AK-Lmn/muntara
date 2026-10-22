import { AlertTriangle, CheckCircle2, Clock, Users, History } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import type { VerificationState } from '@/types'

const CONFIG: Record<
  VerificationState,
  { label: string; tone: 'verified' | 'community' | 'review' | 'stale' | 'disputed'; icon: React.ReactNode }
> = {
  verified: { label: 'Verified', tone: 'verified', icon: <CheckCircle2 size={14} /> },
  community_reported: { label: 'Community-reported', tone: 'community', icon: <Users size={14} /> },
  awaiting_review: { label: 'Awaiting review', tone: 'review', icon: <Clock size={14} /> },
  needs_recheck: { label: 'Needs recheck', tone: 'stale', icon: <History size={14} /> },
  disputed: { label: 'Disputed', tone: 'disputed', icon: <AlertTriangle size={14} /> },
}

interface VerificationBadgeProps {
  state: VerificationState
  className?: string
}

/**
 * The single source of truth for how a verification state is labeled and
 * colored across the app. Never render verification status any other way —
 * route this through here so the semantics stay consistent everywhere.
 */
export function VerificationBadge({ state, className }: VerificationBadgeProps) {
  const config = CONFIG[state]
  return (
    <Badge tone={config.tone} icon={config.icon} className={className}>
      {config.label}
    </Badge>
  )
}
