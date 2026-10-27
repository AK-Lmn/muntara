import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      {icon && <div className="text-brand-700">{icon}</div>}
      <p className="font-semibold text-ink">{title}</p>
      {description && <p className="max-w-xs text-sm text-copy">{description}</p>}
      {action}
    </div>
  )
}
