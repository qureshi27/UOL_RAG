"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { History, MessageSquare, Clock, Trash2, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface QueryHistoryItem {
  id: string
  question: string
  answer: string
  timestamp: Date
  confidence?: number
  sources?: number
}

export function QueryHistory() {
  const [history, setHistory] = useState<QueryHistoryItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredHistory, setFilteredHistory] = useState<QueryHistoryItem[]>([])

  // Mock data - in a real app, this would come from a backend
  useEffect(() => {
    const mockHistory: QueryHistoryItem[] = [
      {
        id: "1",
        question: "What are the main topics covered in the documents?",
        answer:
          "The documents cover several key topics including artificial intelligence, machine learning algorithms, data processing techniques, and their applications in various industries.",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        confidence: 0.85,
        sources: 3,
      },
      {
        id: "2",
        question: "How does machine learning work?",
        answer:
          "Machine learning is a subset of artificial intelligence that enables computers to learn and improve from experience without being explicitly programmed. It involves algorithms that can identify patterns in data and make predictions or decisions.",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        confidence: 0.92,
        sources: 5,
      },
      {
        id: "3",
        question: "What are the benefits of AI in healthcare?",
        answer:
          "AI in healthcare offers numerous benefits including improved diagnostic accuracy, personalized treatment plans, drug discovery acceleration, and enhanced patient monitoring capabilities.",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        confidence: 0.78,
        sources: 2,
      },
    ]

    setHistory(mockHistory)
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredHistory(history)
    } else {
      const filtered = history.filter(
        (item) =>
          item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredHistory(filtered)
    }
  }, [history, searchTerm])

  const handleDelete = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id))
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      return `${diffInMinutes} minutes ago`
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays} days ago`
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    if (confidence >= 0.6) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Query History
        </CardTitle>
        <CardDescription>Review your previous questions and answers</CardDescription>
        <div className="pt-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search your history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full p-4">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400 opacity-50" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm ? "No matching queries found" : "No query history yet"}
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                {searchTerm ? "Try a different search term" : "Start asking questions to build your history"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHistory.map((item, index) => (
                <div key={item.id}>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatTimeAgo(item.timestamp)}
                          </span>
                          {item.confidence !== undefined && (
                            <Badge className={`text-xs ${getConfidenceColor(item.confidence)}`}>
                              {Math.round(item.confidence * 100)}% confident
                            </Badge>
                          )}
                          {item.sources && (
                            <Badge variant="outline" className="text-xs">
                              {item.sources} sources
                            </Badge>
                          )}
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg mb-3">
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Q: {item.question}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            A: {item.answer.length > 200 ? `${item.answer.substring(0, 200)}...` : item.answer}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        className="ml-2 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {index < filteredHistory.length - 1 && <Separator className="my-4" />}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
