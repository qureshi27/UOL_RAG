import { ProtectedRoute } from "@/components/auth/protected-route"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { QueryHistory } from "@/components/user/query-history"

export default function UserHistoryPage() {
  return (
    <ProtectedRoute requiredRole="user">
      <DashboardLayout title="Query History">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your Query History</h2>
            <p className="text-gray-600 dark:text-gray-400">Review your previous questions and answers</p>
          </div>

          <QueryHistory />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
