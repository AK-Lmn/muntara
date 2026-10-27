import { NavLink } from 'react-router-dom'
import { Map, ClipboardEdit, Compass } from 'lucide-react'
import { cn } from '@/lib/cn'

const ITEMS = [
  { to: '/', label: 'Directory', icon: Map, end: true },
  { to: '/corrections/new', label: 'Suggest an edit', icon: ClipboardEdit, end: false },
] as const

/** Visible on sm+ viewports; the mobile layout uses BottomNav instead. */
export function TopBar() {
  return (
    <header className="sticky top-0 z-40 hidden border-b border-line bg-canvas/95 backdrop-blur-sm sm:block">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-3 lg:px-8">
        <NavLink to="/" className="group flex items-center gap-3 rounded-md">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-900 text-white">
            <Compass size={20} aria-hidden="true" />
          </span>
          <span>
            <span className="block text-base font-bold leading-tight text-ink group-hover:text-brand-800">Muntara</span>
            <span className="block text-xs text-muted">Muntinlupa service directory</span>
          </span>
        </NavLink>
        <nav aria-label="Primary navigation" className="flex items-center gap-2">
          {ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'tap-target flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors hover:bg-surface-soft active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-brand-500',
                  isActive ? 'bg-brand-50 text-brand-900' : 'text-copy',
                )
              }
            >
              <Icon size={17} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
