"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { UserChat } from "@/components/user/user-chat"

export default function UserChatPage() {
  return (
    <ProtectedRoute requiredRole="user">
      <DashboardLayout title="Chat">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Chat with AI</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Ask questions and get intelligent answers from your knowledge base
            </p>
          </div>

          <UserChat />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
