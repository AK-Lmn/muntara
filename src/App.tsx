import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ExplorePage } from '@/pages/ExplorePage'
import { PlaceDetailPage } from '@/pages/PlaceDetailPage'
import { RoutesPage } from '@/pages/RoutesPage'
import { RouteDetailPage } from '@/pages/RouteDetailPage'
import { SubmitCorrectionPage } from '@/pages/SubmitCorrectionPage'
import { MyCorrectionsPage } from '@/pages/MyCorrectionsPage'
import { ModerationPage } from '@/pages/ModerationPage'
import type { MockSession } from '@/types'

// No real auth in this prototype — a single hard-coded mock session stands
// in for "the current user" so role-gated UI (e.g. Moderation) can be
// prototyped. Replace with real auth state in a later phase.
const mockSession: MockSession = {
  displayName: 'Juan Dela Cruz',
  role: 'moderator',
}

function App() {
  return (
    <BrowserRouter>
      <AppShell session={mockSession}>
        <Routes>
          <Route path="/" element={<ExplorePage />} />
          <Route path="/places/:placeId" element={<PlaceDetailPage />} />
          <Route path="/routes" element={<RoutesPage />} />
          <Route path="/routes/:routeId" element={<RouteDetailPage />} />
          <Route path="/corrections/new" element={<SubmitCorrectionPage />} />
          <Route path="/corrections" element={<MyCorrectionsPage />} />
          <Route path="/moderation" element={<ModerationPage session={mockSession} />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  )
}

export default App
