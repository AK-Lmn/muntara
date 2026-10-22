import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  interactive?: boolean
}

export function Card({ children, interactive, className, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200 bg-white shadow-sm',
        'dark:border-white/10 dark:bg-slate-900',
        interactive && 'transition-shadow hover:shadow-md active:shadow-sm cursor-pointer',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
