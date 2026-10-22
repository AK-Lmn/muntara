import { CheckCircle2, Clock, Eye, HelpCircle, MinusCircle, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import type { CorrectionStatus } from '@/types'

const CONFIG: Record<
  CorrectionStatus,
  { label: string; tone: 'review' | 'community' | 'verified' | 'disputed' | 'stale' | 'neutral'; icon: React.ReactNode }
> = {
  pending: { label: 'Pending', tone: 'review', icon: <Clock size={14} /> },
  in_review: { label: 'In review', tone: 'community', icon: <Eye size={14} /> },
  accepted: { label: 'Accepted', tone: 'verified', icon: <CheckCircle2 size={14} /> },
  rejected: { label: 'Rejected', tone: 'disputed', icon: <XCircle size={14} /> },
  needs_more_info: { label: 'Needs more info', tone: 'stale', icon: <HelpCircle size={14} /> },
  withdrawn: { label: 'Withdrawn', tone: 'neutral', icon: <MinusCircle size={14} /> },
}

export function CorrectionStatusBadge({ status }: { status: CorrectionStatus }) {
  const config = CONFIG[status]
  return (
    <Badge tone={config.tone} icon={config.icon}>
      {config.label}
    </Badge>
  )
}
