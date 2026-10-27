import { cn } from '@/lib/cn'

interface TrustSignalMeterProps {
  score: number
}

/**
 * Visualizes the prototype's placeholder spam/abuse heuristic (0-100,
 * higher = more suspicious). This is NOT a real trust/reputation system -
 * it's a stand-in so the moderation queue UI has something to sort and
 * filter by. Replace with a real signal pipeline in a later phase (see
 * README "Correction submissions & moderation" section).
 */
export function TrustSignalMeter({ score }: TrustSignalMeterProps) {
  const level = score < 20 ? 'low' : score < 50 ? 'medium' : 'high'
  const barColor = { low: 'bg-brand-500', medium: 'bg-accent-500', high: 'bg-danger-600' }[level]
  const label = { low: 'Low risk signal', medium: 'Medium risk signal', high: 'High risk signal' }[level]

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-line">
        <div className={cn('h-full rounded-full', barColor)} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs text-muted">{label} (mock)</span>
    </div>
  )
}
