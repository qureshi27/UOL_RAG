import { ProtectedRoute } from "@/components/auth/protected-route"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { KnowledgeBrowser } from "@/components/user/knowledge-browser"

export default function UserKnowledgePage() {
  return (
    <ProtectedRoute requiredRole="user">
      <DashboardLayout title="Knowledge Base">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Knowledge Base</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Browse available documents and explore the knowledge base
            </p>
          </div>

          <KnowledgeBrowser />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
