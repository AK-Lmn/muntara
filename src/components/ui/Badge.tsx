import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type BadgeTone = 'brand' | 'neutral' | 'verified' | 'community' | 'review' | 'stale' | 'disputed'

const toneClasses: Record<BadgeTone, string> = {
  brand: 'bg-brand-50 text-brand-700 border-brand-200',
  neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  verified: 'bg-[var(--color-verified-bg)] text-[var(--color-verified-fg)] border-[var(--color-verified-border)]',
  community: 'bg-[var(--color-community-bg)] text-[var(--color-community-fg)] border-[var(--color-community-border)]',
  review: 'bg-[var(--color-review-bg)] text-[var(--color-review-fg)] border-[var(--color-review-border)]',
  stale: 'bg-[var(--color-stale-bg)] text-[var(--color-stale-fg)] border-[var(--color-stale-border)]',
  disputed: 'bg-[var(--color-disputed-bg)] text-[var(--color-disputed-fg)] border-[var(--color-disputed-border)]',
}

interface BadgeProps {
  tone?: BadgeTone
  icon?: ReactNode
  children: ReactNode
  className?: string
}

/**
 * Status badge. Always pairs an icon with text — verification state must
 * never be communicated by color alone (color-blind users, grayscale
 * screens, printed reference sheets).
 */
export function Badge({ tone = 'neutral', icon, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium leading-none',
        toneClasses[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  )
}
