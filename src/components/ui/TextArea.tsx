import { useId } from 'react'
import type { TextareaHTMLAttributes } from 'react'
import { CircleAlert } from 'lucide-react'
import { cn } from '@/lib/cn'

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  hint?: string
  error?: string
}

export function TextArea({ label, hint, error, id, className, disabled, ...rest }: TextAreaProps) {
  const generatedId = useId()
  const areaId = id ?? `textarea-${generatedId}`
  const messageId = error ? `${areaId}-error` : hint ? `${areaId}-hint` : undefined
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={areaId} className="mb-2 block text-sm font-semibold text-ink">
          {label}
        </label>
      )}
      <textarea
        id={areaId}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={messageId}
        disabled={disabled}
        className={cn(
          'w-full rounded-md border border-line-strong bg-paper px-4 py-3 text-base text-ink transition-colors',
          'placeholder:text-muted hover:border-brand-700 focus-visible:ring-2 focus-visible:ring-brand-500',
          'active:border-brand-700 disabled:cursor-not-allowed disabled:bg-surface-soft disabled:text-muted',
          error && 'border-danger-600 focus-visible:ring-danger-600',
          className,
        )}
        {...rest}
      />
      {error && <p id={`${areaId}-error`} role="alert" className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-danger-700"><CircleAlert size={15} aria-hidden="true" />{error}</p>}
      {hint && !error && <p id={`${areaId}-hint`} className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  )
}
