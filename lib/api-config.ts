export const API_BASE_URL = "http://localhost:8000"

export const API_ENDPOINTS = {
  // Authentication
  signup: "/signup",
  login: "/login",

  // Document management
  processDocuments: "/process-documents/",
  deleteDocument: "/admin/delete-document",

  // RAG queries
  query: "/query/",

  // System
  status: "/status/",
  resetIndex: "/reset-index/",
  health: "/health",

  // Chat history
  chatHistory: "/chat-history/",
} as const

export const createApiUrl = (endpoint: string) => `${API_BASE_URL}${endpoint}`

// API request helper with error handling
export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = createApiUrl(endpoint)

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
  }

  // Add auth token if available
  const token = localStorage.getItem("auth_token")
  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  }

  try {
    const response = await fetch(url, config)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Unknown error" }))
      throw new Error(errorData.detail || `HTTP ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error)
    throw error
  }
}
