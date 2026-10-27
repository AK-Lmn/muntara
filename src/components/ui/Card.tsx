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
        'rounded-lg border border-line bg-paper',
        interactive && 'transition-colors hover:bg-surface active:bg-surface-soft focus-within:ring-2 focus-within:ring-brand-400',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
