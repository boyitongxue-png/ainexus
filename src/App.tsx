import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import DashboardLayout from './components/DashboardLayout'
import PortalLayout from './components/PortalLayout'
import RouteGuard from './components/RouteGuard'

// Website pages
import Home from './pages/Home'
import Pricing from './pages/Pricing'
import Docs from './pages/Docs'
import Login from './pages/Login'
import Register from './pages/Register'

// Console pages
import ConsoleOverview from './pages/console/Overview'
import ConsolePlatformKeys from './pages/console/PlatformKeys'
import ConsoleModels from './pages/console/Models'
import ConsoleRouting from './pages/console/Routing'
import ConsoleLogs from './pages/console/Logs'
import ConsoleTasks from './pages/console/Tasks'
import ConsoleCredits from './pages/console/Credits'
import ConsoleRecharge from './pages/console/Recharge'
import ConsoleTeam from './pages/console/Team'
import ConsoleWebhooks from './pages/console/Webhooks'
import ConsoleSecurity from './pages/console/Security'

// Admin pages
import AdminOverview from './pages/admin/Overview'
import AdminCustomers from './pages/admin/Customers'
import AdminRechargeReview from './pages/admin/RechargeReview'
import AdminCreditLedger from './pages/admin/CreditLedger'
import AdminModelConfig from './pages/admin/ModelConfig'
import AdminPricingRules from './pages/admin/PricingRules'
import AdminRequestMonitor from './pages/admin/RequestMonitor'
import AdminTaskMonitor from './pages/admin/TaskMonitor'
import AdminLogsPage from './pages/admin/AdminLogs'
import AdminSystemSettings from './pages/admin/SystemSettings'
import AdminCmsSettings from './pages/admin/CmsSettings'

import AdminLogin from './pages/AdminLogin'

// Portal pages (Developer Portal)
import PortalLogin from './pages/portal/PortalLogin'
import PortalOverview from './pages/portal/PortalOverview'
import PortalLogs from './pages/portal/PortalLogs'
import PortalStats from './pages/portal/PortalStats'
import PortalModels from './pages/portal/PortalModels'

// Portal route guard
function PortalRouteGuard({ children }: { children: React.ReactNode }) {
  const hasKey = !!localStorage.getItem('ainexus_portal_key');
  if (!hasKey) {
    return <Navigate to="/portal/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      {/* Redirect root to home */}
      <Route path="/" element={<Navigate to="/home" replace />} />

      {/* Website routes with Navbar + Footer */}
      <Route element={<Layout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/login" element={<RouteGuard><Login /></RouteGuard>} />
        <Route path="/register" element={<RouteGuard><Register /></RouteGuard>} />
        <Route path="/admin-login" element={<RouteGuard><AdminLogin /></RouteGuard>} />
        <Route path="/portal/login" element={<PortalLogin />} />
      </Route>

      {/* Console routes with Dashboard sidebar - require auth */}
      <Route element={<RouteGuard requireAuth><DashboardLayout type="console" /></RouteGuard>}>
        <Route path="/console/overview" element={<ConsoleOverview />} />
        <Route path="/console/platform-keys" element={<ConsolePlatformKeys />} />
        <Route path="/console/models" element={<ConsoleModels />} />
        <Route path="/console/routing" element={<ConsoleRouting />} />
        <Route path="/console/logs" element={<ConsoleLogs />} />
        <Route path="/console/tasks" element={<ConsoleTasks />} />
        <Route path="/console/credits" element={<ConsoleCredits />} />
        <Route path="/console/recharge" element={<ConsoleRecharge />} />
        <Route path="/console/team" element={<ConsoleTeam />} />
        <Route path="/console/webhooks" element={<ConsoleWebhooks />} />
        <Route path="/console/security" element={<ConsoleSecurity />} />
      </Route>

      {/* Admin routes with Dashboard sidebar - require admin */}
      <Route element={<RouteGuard requireAuth requireAdmin><DashboardLayout type="admin" /></RouteGuard>}>
        <Route path="/admin/overview" element={<AdminOverview />} />
        <Route path="/admin/customers" element={<AdminCustomers />} />
        <Route path="/admin/recharge-review" element={<AdminRechargeReview />} />
        <Route path="/admin/credit-ledger" element={<AdminCreditLedger />} />
        <Route path="/admin/model-config" element={<AdminModelConfig />} />
        <Route path="/admin/pricing-rules" element={<AdminPricingRules />} />
        <Route path="/admin/request-monitor" element={<AdminRequestMonitor />} />
        <Route path="/admin/task-monitor" element={<AdminTaskMonitor />} />
        <Route path="/admin/admin-logs" element={<AdminLogsPage />} />
        <Route path="/admin/system-settings" element={<AdminSystemSettings />} />
        <Route path="/admin/cms" element={<AdminCmsSettings />} />
      </Route>

      {/* Developer Portal routes - require portal key */}
      <Route element={<PortalRouteGuard><PortalLayout /></PortalRouteGuard>}>
        <Route path="/portal/overview" element={<PortalOverview />} />
        <Route path="/portal/logs" element={<PortalLogs />} />
        <Route path="/portal/stats" element={<PortalStats />} />
        <Route path="/portal/models" element={<PortalModels />} />
      </Route>

      {/* Fallback: redirect unknown routes to home */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}
