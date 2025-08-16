"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { MessageSquare, Send, Bot, User, BookOpen, Sparkles } from "lucide-react"
import { ChatService } from "@/lib/chat-service"

interface ChatMessage {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  sources?: string[]
  confidence?: number
}

interface UserChatProps {
  onNewMessage?: (message: ChatMessage) => void
}

export function UserChat({ onNewMessage }: UserChatProps) {
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

    // Call onNewMessage callback for history tracking
    onNewMessage?.(userMessage)

    try {
      const data = await ChatService.sendQuery(userMessage.content)

      const assistantMessage: ChatMessage = {
        id: `assistant_${Date.now()}`,
        type: "assistant",
        content: data.answer,
        timestamp: new Date(),
        sources: data.sources,
        confidence: ChatService.calculateConfidence(data.sources),
      }

      setMessages((prev) => [...prev, assistantMessage])
      onNewMessage?.(assistantMessage)

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
        content: "I'm sorry, I encountered an error while processing your question. Please try again.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const suggestedQuestions = [
    "What topics are covered in the documents?",
    "Can you summarize the main points?",
    "What are the key findings?",
    "How does this relate to...?",
  ]

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-500" />
          Ask Questions
        </CardTitle>
        <CardDescription>Get intelligent answers from your knowledge base</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <div className="mb-6">
                <Bot className="h-16 w-16 mx-auto mb-4 text-blue-500 opacity-50" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Welcome to your AI Assistant</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Ask me anything about the documents in your knowledge base
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Try asking:</p>
                <div className="grid grid-cols-1 gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-left justify-start h-auto p-3 text-wrap bg-transparent"
                      onClick={() => setInput(question)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] ${message.type === "user" ? "order-2" : "order-1"}`}>
                    <div
                      className={`rounded-2xl p-4 ${
                        message.type === "user"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {message.type === "user" ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4 text-blue-500" />
                        )}
                        <span className="text-xs opacity-75">{message.timestamp.toLocaleTimeString()}</span>
                        {message.type === "assistant" && message.confidence !== undefined && (
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              message.confidence >= 0.8
                                ? "border-green-500 text-green-600"
                                : message.confidence >= 0.6
                                  ? "border-yellow-500 text-yellow-600"
                                  : "border-red-500 text-red-600"
                            }`}
                          >
                            {Math.round(message.confidence * 100)}% confident
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    </div>

                    {message.type === "assistant" && message.sources && message.sources.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <BookOpen className="h-3 w-3" />
                          <span>Sources ({message.sources.length})</span>
                        </div>
                        <div className="space-y-2">
                          {message.sources.slice(0, 3).map((source, index) => (
                            <div
                              key={index}
                              className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border-l-2 border-blue-200 dark:border-blue-800"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{source}</span>
                                <Badge variant="outline" className="text-xs">
                                  Source {index + 1}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-4 max-w-[85%]">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-blue-500" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        />
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <Separator />

        <form onSubmit={handleSubmit} className="p-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your documents..."
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
