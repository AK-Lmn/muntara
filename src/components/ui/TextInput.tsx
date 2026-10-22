import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode
  label?: string
}

let idCounter = 0

export function TextInput({ icon, label, id, className, ...rest }: TextInputProps) {
  const inputId = id ?? `text-input-${++idCounter}`
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={cn(
            'tap-target w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900',
            'placeholder:text-slate-400',
            'focus:border-brand-400',
            icon && 'pl-10',
            className,
          )}
          {...rest}
        />
      </div>
    </div>
  )
}
