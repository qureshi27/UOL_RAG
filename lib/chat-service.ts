import { apiRequest, API_ENDPOINTS } from "./api-config"

export interface QueryRequest {
  question: string
  use_iterative_retrieval?: boolean
}

export interface QueryResponse {
  question: string
  answer: string
  context: string
  sources: string[]
  expanded_queries: string[]
}

export interface ChatMessage {
  role: "user" | "assistant"
  text: string
  timestamp?: string
  sources?: string[]
  confidence?: number
}

export class ChatService {
  static async sendQuery(question: string, useIterativeRetrieval = false): Promise<QueryResponse> {
    const request: QueryRequest = {
      question,
      use_iterative_retrieval: useIterativeRetrieval,
    }

    return await apiRequest<QueryResponse>(API_ENDPOINTS.query, {
      method: "POST",
      body: JSON.stringify(request),
    })
  }

  static async storeChatMessage(message: ChatMessage): Promise<{ message: string }> {
    return await apiRequest<{ message: string }>(API_ENDPOINTS.chatHistory, {
      method: "POST",
      body: JSON.stringify({
        role: message.role,
        text: message.text,
      }),
    })
  }

  static async getChatHistory(): Promise<ChatMessage[]> {
    return await apiRequest<ChatMessage[]>(API_ENDPOINTS.chatHistory)
  }

  static calculateConfidence(sources: string[]): number {
    // Simple confidence calculation based on number of sources
    if (sources.length === 0) return 0.3
    if (sources.length === 1) return 0.6
    if (sources.length === 2) return 0.8
    return 0.95
  }
}
