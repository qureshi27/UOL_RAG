import { ProtectedRoute } from "@/components/auth/protected-route"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { AdminChat } from "@/components/admin/admin-chat"

export default function AdminChatPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardLayout title="Admin Chat">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Chat Interface</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Test your RAG system with queries and analyze the responses
            </p>
          </div>

          <AdminChat />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
