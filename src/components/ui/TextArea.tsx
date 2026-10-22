import type { TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  hint?: string
}

let idCounter = 0

export function TextArea({ label, hint, id, className, ...rest }: TextAreaProps) {
  const areaId = id ?? `textarea-${++idCounter}`
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={areaId} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <textarea
        id={areaId}
        className={cn(
          'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900',
          'placeholder:text-slate-400',
          'focus:border-brand-400',
          className,
        )}
        {...rest}
      />
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  )
}
