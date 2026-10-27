import { NavLink } from 'react-router-dom'
import { Map, ClipboardEdit } from 'lucide-react'
import { cn } from '@/lib/cn'

const ITEMS = [
  { to: '/', label: 'Directory', icon: Map, end: true },
  { to: '/corrections/new', label: 'Suggest edit', icon: ClipboardEdit, end: false },
] as const

/**
 * Mobile-first bottom tab bar. Hidden on wider viewports in favor of the
 * top nav (see AppShell): kept as two separate components rather than one
 * that reflows, so each can be optimized for its breakpoint without
 * tangled conditional classes.
 */
export function BottomNav() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-line bg-paper px-3 pb-[env(safe-area-inset-bottom)] pt-1.5 sm:hidden"
    >
      {ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              'tap-target flex flex-col items-center justify-center gap-0.5 rounded-md px-4 py-1.5 text-xs font-semibold transition-colors hover:bg-surface-soft active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-brand-500',
              isActive ? 'bg-brand-50 text-brand-900' : 'text-muted',
            )
          }
        >
          <Icon size={20} aria-hidden="true" />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
