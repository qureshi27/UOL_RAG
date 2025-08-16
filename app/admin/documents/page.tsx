"use client"

import { useState } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DocumentUpload } from "@/components/admin/document-upload"
import { DocumentList } from "@/components/admin/document-list"

export default function AdminDocumentsPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleUploadComplete = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardLayout title="Document Management">
        <div className="px-4 py-6 sm:px-0 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Document Management</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Upload, organize, and manage your knowledge base documents
            </p>
          </div>

          <DocumentUpload onUploadComplete={handleUploadComplete} />
          <DocumentList refreshTrigger={refreshTrigger} />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
