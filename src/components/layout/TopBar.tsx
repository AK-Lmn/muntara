import { NavLink } from 'react-router-dom'
import { Map, Route as RouteIcon, ClipboardEdit, ShieldCheck, Compass } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { MockSession } from '@/types'

const ITEMS = [
  { to: '/', label: 'Explore', icon: Map, end: true },
  { to: '/routes', label: 'Routes', icon: RouteIcon, end: false },
  { to: '/corrections/new', label: 'Suggest an edit', icon: ClipboardEdit, end: false },
  { to: '/moderation', label: 'Moderation', icon: ShieldCheck, end: false },
] as const

interface TopBarProps {
  session: MockSession
}

/** Visible on sm+ viewports; the mobile layout uses BottomNav instead. */
export function TopBar({ session }: TopBarProps) {
  return (
    <header className="glass-panel sticky top-0 z-40 hidden sm:block">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-3">
        <NavLink to="/" className="flex items-center gap-2 font-bold text-brand-800">
          <Compass size={22} className="text-brand-600" />
          Muntinlupa Explorer
          <span className="rounded-full bg-accent-500/15 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-accent-600">
            PROTOTYPE
          </span>
        </NavLink>
        <nav aria-label="Primary" className="flex items-center gap-1">
          {ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100',
                )
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="rounded-full bg-slate-100 px-3 py-1.5 font-medium">
            {session.displayName} · {session.role}
          </span>
        </div>
      </div>
    </header>
  )
}
