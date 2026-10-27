import { useId } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { CircleAlert, LoaderCircle } from 'lucide-react'
import { cn } from '@/lib/cn'

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode
  label?: string
  hint?: string
  error?: string
  loading?: boolean
}

export function TextInput({ icon, label, hint, error, loading, id, className, disabled, ...rest }: TextInputProps) {
  const generatedId = useId()
  const inputId = id ?? `text-input-${generatedId}`
  const messageId = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-2 block text-sm font-semibold text-ink">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={messageId}
          aria-busy={loading || undefined}
          disabled={disabled || loading}
          className={cn(
            'tap-target w-full rounded-md border border-line-strong bg-paper px-4 py-2.5 text-base text-ink transition-colors',
            'placeholder:text-muted hover:border-brand-700 focus-visible:ring-2 focus-visible:ring-brand-500',
            'active:border-brand-700 disabled:cursor-not-allowed disabled:bg-surface-soft disabled:text-muted',
            error && 'border-danger-600 focus-visible:ring-danger-600',
            icon && 'pl-11',
            loading && 'pr-11',
            className,
          )}
          {...rest}
        />
        {loading && <LoaderCircle size={18} aria-hidden="true" className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-brand-700" />}
      </div>
      {error && <p id={`${inputId}-error`} role="alert" className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-danger-700"><CircleAlert size={15} aria-hidden="true" />{error}</p>}
      {hint && !error && <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  )
}
