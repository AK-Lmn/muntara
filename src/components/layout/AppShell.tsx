import type { ReactNode } from 'react'
import { TopBar } from './TopBar'
import { BottomNav } from './BottomNav'

interface AppShellProps {
  children: ReactNode
}

/**
 * Top-level page frame. Mobile-first: content gets bottom padding to clear
 * the fixed BottomNav on small screens, and the TopBar takes over on sm+.
 */
export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-dvh bg-canvas text-ink">
      <TopBar />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-brand-900 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <main id="main-content" className="mx-auto max-w-7xl px-4 pb-28 pt-7 sm:px-6 sm:pb-12 lg:px-8 lg:pt-10">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
