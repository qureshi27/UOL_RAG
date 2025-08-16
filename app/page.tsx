import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, Shield } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">RAG Document Intelligence</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Powerful document processing and intelligent querying system powered by AI
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <CardTitle className="text-2xl">Admin Portal</CardTitle>
              <CardDescription>Manage documents, monitor system performance, and configure settings</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="text-sm text-gray-600 dark:text-gray-400 mb-6 space-y-2">
                <li>• Upload and manage documents</li>
                <li>• System analytics and monitoring</li>
                <li>• User management</li>
                <li>• Advanced configuration</li>
              </ul>
              <Link href="/admin/login">
                <Button className="w-full">Access Admin Portal</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Users className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <CardTitle className="text-2xl">User Portal</CardTitle>
              <CardDescription>Query documents and get intelligent answers from your knowledge base</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="text-sm text-gray-600 dark:text-gray-400 mb-6 space-y-2">
                <li>• Ask questions about documents</li>
                <li>• View query history</li>
                <li>• Access knowledge base</li>
                <li>• Personalized experience</li>
              </ul>
              <Link href="/user/login">
                <Button variant="outline" className="w-full bg-transparent">
                  Access User Portal
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-16">
          <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
            <BookOpen className="w-5 h-5" />
            <span>Powered by advanced RAG technology</span>
          </div>
        </div>
      </div>
    </div>
  )
}
