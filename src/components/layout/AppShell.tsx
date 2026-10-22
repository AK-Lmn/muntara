import type { ReactNode } from 'react'
import { TopBar } from './TopBar'
import { BottomNav } from './BottomNav'
import type { MockSession } from '@/types'

interface AppShellProps {
  session: MockSession
  children: ReactNode
}

/**
 * Top-level page frame. Mobile-first: content gets bottom padding to clear
 * the fixed BottomNav on small screens, and the TopBar takes over on sm+.
 */
export function AppShell({ session, children }: AppShellProps) {
  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-950">
      <TopBar session={session} />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-brand-700 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <main id="main-content" className="mx-auto max-w-6xl px-4 pb-24 pt-4 sm:pb-10">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
