import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
  icon?: ReactNode
  children: ReactNode
}

/** Toggle-style filter chip, used for category and verification filters. */
export function Chip({ active, icon, children, className, ...rest }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        'tap-target inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
        'focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
        'active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55 disabled:active:scale-100',
        active
          ? 'border-brand-900 bg-brand-900 text-white hover:bg-brand-800'
          : 'border-line bg-paper text-copy hover:border-brand-300 hover:bg-brand-50',
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  )
}
