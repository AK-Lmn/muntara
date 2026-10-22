import { CheckCircle2, History, Map } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import type { RouteVerificationState } from '@/types'

const CONFIG: Record<
  RouteVerificationState,
  { label: string; tone: 'verified' | 'community' | 'stale'; icon: React.ReactNode }
> = {
  mapped_only: { label: 'Mapped only — not field-checked', tone: 'community', icon: <Map size={14} /> },
  field_verified: { label: 'Field-verified', tone: 'verified', icon: <CheckCircle2 size={14} /> },
  field_verified_stale: { label: 'Field-verified (aging)', tone: 'stale', icon: <History size={14} /> },
}

interface RouteVerificationBadgeProps {
  state: RouteVerificationState
  className?: string
}

/**
 * Deliberately never says just "verified" for a route — "field_verified" is
 * the closest state, and even that is relabeled "aging" once stale. A route
 * must never read as confirmed unless someone has actually walked it
 * recently.
 */
export function RouteVerificationBadge({ state, className }: RouteVerificationBadgeProps) {
  const config = CONFIG[state]
  return (
    <Badge tone={config.tone} icon={config.icon} className={className}>
      {config.label}
    </Badge>
  )
}
