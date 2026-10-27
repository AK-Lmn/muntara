import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ExplorePage } from '@/pages/ExplorePage'
import { PlaceDetailPage } from '@/pages/PlaceDetailPage'
import { SubmitCorrectionPage } from '@/pages/SubmitCorrectionPage'
import { MyCorrectionsPage } from '@/pages/MyCorrectionsPage'

function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<ExplorePage />} />
          <Route path="/places/:placeId" element={<PlaceDetailPage />} />
          <Route path="/corrections/new" element={<SubmitCorrectionPage />} />
          <Route path="/corrections" element={<MyCorrectionsPage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  )
}

export default App
