import { AppStoreProvider, useAppStore } from './hooks/useAppStore'
import DashboardLayout from './layouts/DashboardLayout'
import OverviewPage from './pages/OverviewPage'
import LiveEnvironmentPage from './pages/LiveEnvironmentPage'
import ZoneDetailsPage from './pages/ZoneDetailsPage'
import AiPredictionsPage from './pages/AiPredictionsPage'
import WhatIfSimulationPage from './pages/WhatIfSimulationPage'
import UiceOptimizerPage from './pages/UiceOptimizerPage'
import ActionCenterPage from './pages/ActionCenterPage'
import ManualOverridePage from './pages/ManualOverridePage'
import FeedbackLearningPage from './pages/FeedbackLearningPage'
import AnalyticsPage from './pages/AnalyticsPage'

const PAGES = {
  overview: OverviewPage,
  'live-environment': LiveEnvironmentPage,
  'zone-details': ZoneDetailsPage,
  'ai-predictions': AiPredictionsPage,
  'what-if': WhatIfSimulationPage,
  'uice-optimizer': UiceOptimizerPage,
  'action-center': ActionCenterPage,
  'manual-override': ManualOverridePage,
  'feedback-learning': FeedbackLearningPage,
  analytics: AnalyticsPage,
}

function Router() {
  const { activePage } = useAppStore()
  const Page = PAGES[activePage] || OverviewPage
  return (
    <DashboardLayout>
      <div key={activePage} className="rise-in">
        <Page />
      </div>
    </DashboardLayout>
  )
}

export default function App() {
  return (
    <AppStoreProvider>
      <Router />
    </AppStoreProvider>
  )
}
