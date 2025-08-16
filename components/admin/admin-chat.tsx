"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { MessageSquare, Send, Bot, User, Clock, Target } from "lucide-react"
import { ChatService } from "@/lib/chat-service"

interface ChatMessage {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  sources?: string[]
  confidence?: number
  processingTime?: number
  expandedQueries?: string[]
}

export function AdminChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      type: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const startTime = Date.now()
      const data = await ChatService.sendQuery(userMessage.content)
      const processingTime = Date.now() - startTime

      const assistantMessage: ChatMessage = {
        id: `assistant_${Date.now()}`,
        type: "assistant",
        content: data.answer,
        timestamp: new Date(),
        sources: data.sources,
        confidence: ChatService.calculateConfidence(data.sources),
        processingTime,
        expandedQueries: data.expanded_queries,
      }

      setMessages((prev) => [...prev, assistantMessage])

      await ChatService.storeChatMessage({
        role: "user",
        text: userMessage.content,
      })
      await ChatService.storeChatMessage({
        role: "assistant",
        text: data.answer,
        sources: data.sources,
        confidence: ChatService.calculateConfidence(data.sources),
      })
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        type: "assistant",
        content: "Sorry, I encountered an error processing your question. Please try again.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const formatConfidence = (confidence: number) => {
    return `${Math.round(confidence * 100)}%`
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600"
    if (confidence >= 0.6) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Admin Chat Interface
        </CardTitle>
        <CardDescription>Test your RAG system with queries and view detailed responses</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          {messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Start a conversation to test your RAG system</p>
              <p className="text-sm">Ask questions about your uploaded documents</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] ${message.type === "user" ? "order-2" : "order-1"}`}>
                    <div
                      className={`rounded-lg p-3 ${
                        message.type === "user"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {message.type === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                        <span className="text-xs opacity-75">{message.timestamp.toLocaleTimeString()}</span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>

                    {message.type === "assistant" && (message.sources || message.confidence !== undefined) && (
                      <div className="mt-2 space-y-2">
                        {message.confidence !== undefined && (
                          <div className="flex items-center gap-2 text-xs">
                            <Target className="h-3 w-3" />
                            <span>Confidence:</span>
                            <Badge variant="outline" className={getConfidenceColor(message.confidence)}>
                              {formatConfidence(message.confidence)}
                            </Badge>
                            {message.processingTime && (
                              <>
                                <Clock className="h-3 w-3 ml-2" />
                                <span>{message.processingTime}ms</span>
                              </>
                            )}
                          </div>
                        )}

                        {message.sources && message.sources.length > 0 && (
                          <div className="text-xs">
                            <p className="font-medium mb-1">Sources ({message.sources.length}):</p>
                            <div className="space-y-1">
                              {message.sources.map((source, index) => (
                                <div key={index} className="bg-gray-50 dark:bg-gray-900 p-2 rounded text-xs">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium">{source}</span>
                                    <Badge variant="outline" className="text-xs">
                                      Source {index + 1}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {message.expandedQueries && message.expandedQueries.length > 0 && (
                          <div className="text-xs">
                            <p className="font-medium mb-1">Expanded Queries:</p>
                            <div className="space-y-1">
                              {message.expandedQueries.map((query, index) => (
                                <div key={index} className="bg-blue-50 dark:bg-blue-900 p-2 rounded text-xs">
                                  <span className="text-blue-700 dark:text-blue-300">{query}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <Separator />

        <form onSubmit={handleSubmit} className="p-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about your documents..."
              disabled={loading}
              className="flex-1"
            />
            <Button type="submit" disabled={loading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
