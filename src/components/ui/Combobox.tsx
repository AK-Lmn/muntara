import { Children, isValidElement, useEffect, useId, useRef, useState } from 'react'
import type { ButtonHTMLAttributes, KeyboardEvent, ReactNode } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'

interface OptionProps {
  value?: string | number
  children?: ReactNode
}

type SelectChangeEvent = { target: { value: string } }

interface ComboboxProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'onChange' | 'children'> {
  label?: string
  value: string
  children: ReactNode
  onChange?: (event: SelectChangeEvent) => void
  hint?: string
  error?: string
  required?: boolean
}

export function Combobox({ label, id, value, onChange, hint, error, required, disabled, className, children, ...rest }: ComboboxProps) {
  const generatedId = useId()
  const selectId = id ?? `select-${generatedId}`
  const labelId = `${selectId}-label`
  const listboxId = `${selectId}-listbox`
  const rootRef = useRef<HTMLDivElement>(null)
  const typeahead = useRef('')
  const typeaheadTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const options = Children.toArray(children).flatMap((child) => {
    if (!isValidElement<OptionProps>(child)) return []
    const optionLabel = child.props.children
    const labelText = typeof optionLabel === 'string' || typeof optionLabel === 'number' ? String(optionLabel) : ''
    return [{ value: String(child.props.value ?? ''), label: optionLabel, labelText }]
  })
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value))
  const selectedOption = options.find((option) => option.value === value)

  useEffect(() => {
    if (!open) return
    function closeOutside(event: PointerEvent) {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', closeOutside)
    return () => document.removeEventListener('pointerdown', closeOutside)
  }, [open])

  useEffect(() => () => {
    if (typeaheadTimer.current) clearTimeout(typeaheadTimer.current)
  }, [])

  function choose(index: number) {
    const option = options[index]
    if (!option) return
    onChange?.({ target: { value: option.value } })
    setActiveIndex(index)
    setOpen(false)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled || options.length === 0) return
    const lastIndex = options.length - 1
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!open) {
        setActiveIndex(selectedIndex)
        setOpen(true)
      } else {
        setActiveIndex((index) => event.key === 'ArrowDown' ? Math.min(lastIndex, index + 1) : Math.max(0, index - 1))
      }
      return
    }
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      setOpen(true)
      setActiveIndex(event.key === 'Home' ? 0 : lastIndex)
      return
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (open) choose(activeIndex)
      else {
        setActiveIndex(selectedIndex)
        setOpen(true)
      }
      return
    }
    if (event.key === 'Escape' && open) {
      event.preventDefault()
      setOpen(false)
      return
    }
    if (event.key === 'Tab') {
      setOpen(false)
      return
    }
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      typeahead.current += event.key.toLocaleLowerCase()
      if (typeaheadTimer.current) clearTimeout(typeaheadTimer.current)
      typeaheadTimer.current = setTimeout(() => { typeahead.current = '' }, 600)
      const matchIndex = options.findIndex((option) => option.labelText.toLocaleLowerCase().startsWith(typeahead.current))
      if (matchIndex >= 0) {
        setActiveIndex(matchIndex)
        setOpen(true)
      }
    }
  }

  return (
    <div className="relative w-full" ref={rootRef}>
      {label && (
        <label id={labelId} htmlFor={selectId} className="mb-2 block text-sm font-semibold text-ink">
          {label}
        </label>
      )}
      <button
        type="button"
        id={selectId}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={open ? `${selectId}-option-${activeIndex}` : undefined}
        aria-labelledby={label ? `${labelId} ${selectId}-value` : undefined}
        aria-required={required || undefined}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined}
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setActiveIndex(selectedIndex)
            setOpen((wasOpen) => !wasOpen)
          }
        }}
        onKeyDown={handleKeyDown}
        className={cn(
          'tap-target flex w-full items-center justify-between gap-3 rounded-md border border-line-strong bg-paper px-4 py-2.5 text-left text-sm text-ink transition-colors',
          'hover:border-brand-700 active:bg-surface-soft focus-visible:ring-2 focus-visible:ring-brand-500',
          'disabled:cursor-not-allowed disabled:bg-surface-soft disabled:text-muted',
          error && 'border-danger-600 focus-visible:ring-danger-600',
          className,
        )}
        {...rest}
      >
        <span id={`${selectId}-value`} className={cn('min-w-0 truncate', !selectedOption && 'text-muted')}>
          {selectedOption?.label ?? 'Choose an option'}
        </span>
        <ChevronDown size={18} aria-hidden="true" className={cn('shrink-0 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div id={listboxId} role="listbox" aria-labelledby={label ? labelId : undefined}
          className="absolute inset-x-0 top-full z-50 mt-2 max-h-72 overflow-y-auto rounded-md border border-line-strong bg-paper p-1 shadow-lg">
          {options.map((option, index) => {
            const selected = option.value === value
            const active = index === activeIndex
            return (
              <div key={`${option.value}-${index}`} id={`${selectId}-option-${index}`} role="option"
                aria-selected={selected} onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)} onClick={() => choose(index)}
                className={cn('flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded px-3 py-2 text-sm text-ink',
                  active && 'bg-surface-soft', selected && 'font-semibold text-brand-900')}>
                <span>{option.label}</span>
                {selected && <Check size={16} aria-hidden="true" className="shrink-0 text-brand-700" />}
              </div>
            )
          })}
        </div>
      )}

      {error && <p id={`${selectId}-error`} role="alert" className="mt-1.5 text-sm text-danger-700">{error}</p>}
      {hint && !error && <p id={`${selectId}-hint`} className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  )
}
