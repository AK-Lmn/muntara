import { NavLink } from 'react-router-dom'
import { Map, Route as RouteIcon, ClipboardEdit, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/cn'

const ITEMS = [
  { to: '/', label: 'Explore', icon: Map, end: true },
  { to: '/routes', label: 'Routes', icon: RouteIcon, end: false },
  { to: '/corrections/new', label: 'Suggest edit', icon: ClipboardEdit, end: false },
  { to: '/moderation', label: 'Moderation', icon: ShieldCheck, end: false },
] as const

/**
 * Mobile-first bottom tab bar. Hidden on wider viewports in favor of the
 * top nav (see AppShell) — kept as two separate components rather than one
 * that reflows, so each can be optimized for its breakpoint without
 * tangled conditional classes.
 */
export function BottomNav() {
  return (
    <nav
      aria-label="Primary"
      className="glass-panel fixed inset-x-0 bottom-0 z-40 flex justify-around px-2 pb-[env(safe-area-inset-bottom)] pt-1.5 sm:hidden"
    >
      {ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              'tap-target flex flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-1.5 text-[11px] font-medium',
              isActive ? 'text-brand-700' : 'text-slate-500',
            )
          }
        >
          <Icon size={20} />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
