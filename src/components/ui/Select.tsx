import type { ReactNode, SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  children: ReactNode
}

let idCounter = 0

export function Select({ label, id, className, children, ...rest }: SelectProps) {
  const selectId = id ?? `select-${++idCounter}`
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          'tap-target w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900',
          'focus:border-brand-400',
          className,
        )}
        {...rest}
      >
        {children}
      </select>
    </div>
  )
}
