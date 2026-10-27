import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-action-primary text-white hover:bg-action-primary-hover active:bg-action-primary-active',
  secondary: 'border border-line bg-paper text-ink hover:bg-surface-soft active:bg-line',
  ghost: 'bg-transparent text-copy hover:bg-surface-soft active:bg-line',
  danger: 'bg-danger-600 text-white hover:bg-danger-700 active:bg-danger-700',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'text-sm px-3 py-1.5 rounded-lg gap-1.5',
  md: 'text-sm px-4 py-2.5 rounded-xl gap-2',
  lg: 'text-base px-5 py-3 rounded-xl gap-2',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode
  fullWidth?: boolean
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  fullWidth,
  loading = false,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={cn(
        'tap-target inline-flex items-center justify-center font-semibold transition-colors',
        'focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
        'active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55 disabled:active:scale-100',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  )
}
