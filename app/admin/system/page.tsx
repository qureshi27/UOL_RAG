import { ProtectedRoute } from "@/components/auth/protected-route"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { SystemMonitor } from "@/components/admin/system-monitor"

export default function AdminSystemPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardLayout title="System Monitor">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">System Monitor</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor system health, performance metrics, and capabilities
            </p>
          </div>

          <SystemMonitor />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
