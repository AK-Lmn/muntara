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
        'tap-target inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-2 text-sm font-medium transition-colors',
        active
          ? 'border-brand-600 bg-brand-600 text-white'
          : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50',
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  )
}
