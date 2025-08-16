"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Activity, Server, Database, Zap, RefreshCw } from "lucide-react"

interface SystemStatus {
  status: string
  vectorStore: {
    totalChunks: number
    totalDocuments: number
    storageSize: string
  }
  capabilities: {
    documentProcessing: boolean
    semanticSearch: boolean
    questionAnswering: boolean
  }
  supportedFileTypes: string[]
  timestamp: string
}

export function SystemMonitor() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchSystemStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/system/status")
      const data = await response.json()

      if (response.ok) {
        setSystemStatus(data)
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error("Failed to fetch system status:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSystemStatus()
    const interval = setInterval(fetchSystemStatus, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "operational":
        return "bg-green-500"
      case "degraded":
        return "bg-yellow-500"
      case "down":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getCapabilityStatus = (enabled: boolean) => {
    return enabled ? "text-green-600" : "text-red-600"
  }

  if (loading && !systemStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Loading system status...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Monitor
              </CardTitle>
              <CardDescription>Real-time system health and performance metrics</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchSystemStatus} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(systemStatus?.status || "unknown")} mr-2`} />
                <span className="font-medium">System Status</span>
              </div>
              <Badge variant={systemStatus?.status === "operational" ? "default" : "destructive"}>
                {systemStatus?.status || "Unknown"}
              </Badge>
            </div>

            <div className="text-center">
              <Server className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{systemStatus?.vectorStore.totalDocuments || 0}</div>
              <div className="text-sm text-gray-500">Documents</div>
            </div>

            <div className="text-center">
              <Database className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{systemStatus?.vectorStore.totalChunks || 0}</div>
              <div className="text-sm text-gray-500">Vector Chunks</div>
            </div>

            <div className="text-center">
              <Zap className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold">{systemStatus?.vectorStore.storageSize || "0 B"}</div>
              <div className="text-sm text-gray-500">Storage Used</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Capabilities</CardTitle>
            <CardDescription>Current system features and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Document Processing</span>
                <Badge
                  variant={systemStatus?.capabilities.documentProcessing ? "default" : "destructive"}
                  className={getCapabilityStatus(systemStatus?.capabilities.documentProcessing || false)}
                >
                  {systemStatus?.capabilities.documentProcessing ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Semantic Search</span>
                <Badge
                  variant={systemStatus?.capabilities.semanticSearch ? "default" : "destructive"}
                  className={getCapabilityStatus(systemStatus?.capabilities.semanticSearch || false)}
                >
                  {systemStatus?.capabilities.semanticSearch ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Question Answering</span>
                <Badge
                  variant={systemStatus?.capabilities.questionAnswering ? "default" : "destructive"}
                  className={getCapabilityStatus(systemStatus?.capabilities.questionAnswering || false)}
                >
                  {systemStatus?.capabilities.questionAnswering ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Supported File Types</CardTitle>
            <CardDescription>File formats accepted by the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {systemStatus?.supportedFileTypes.map((type) => (
                <Badge key={type} variant="outline">
                  {type}
                </Badge>
              ))}
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Last updated: {lastUpdated?.toLocaleTimeString() || "Never"}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
