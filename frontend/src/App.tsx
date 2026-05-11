import { Route, Routes } from 'react-router-dom'

import { DirectoryApp } from '@/directory/DirectoryApp'
import { AdopterenPage } from '@/marketing/AdopterenPage'
import { ExploreRedirect } from '@/marketing/ExploreRedirect'
import { HoeHetWerktPage } from '@/marketing/HoeHetWerktPage'
import { VrijwilligerPage } from '@/marketing/VrijwilligerPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export default function App() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Routes>
        <Route path="/" element={<DirectoryApp />} />
        <Route path="/adopteren" element={<AdopterenPage />} />
        <Route path="/vrijwilliger" element={<VrijwilligerPage />} />
        <Route path="/hoe-het-werkt" element={<HoeHetWerktPage />} />
        <Route path="/explore" element={<ExploreRedirect />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  )
}
