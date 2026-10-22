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
      {icon && <div className="text-slate-400">{icon}</div>}
      <p className="font-semibold text-slate-700">{title}</p>
      {description && <p className="max-w-xs text-sm text-slate-500">{description}</p>}
      {action}
    </div>
  )
}
