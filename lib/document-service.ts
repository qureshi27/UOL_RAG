import { apiRequest, API_ENDPOINTS } from "./api-config"

export interface DocumentStats {
  total_chunks_in_db: number
  is_indexed: boolean
  collection_stats: {
    total_chunks: number
    collection_name: string
    embedding_model: string
  }
}

export interface ProcessDocumentsResponse {
  message: string
  total_chunks_in_db: number
}

export class DocumentService {
  static async uploadDocuments(files: File[]): Promise<ProcessDocumentsResponse> {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append("files", file)
    })

    const response = await fetch(`http://localhost:8000${API_ENDPOINTS.processDocuments}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || "Upload failed")
    }

    return await response.json()
  }

  static async getSystemStatus(): Promise<DocumentStats> {
    return await apiRequest<DocumentStats>(API_ENDPOINTS.status)
  }

  static async deleteDocument(filename: string): Promise<{ message: string }> {
    return await apiRequest<{ message: string }>(API_ENDPOINTS.deleteDocument, {
      method: "POST",
      body: JSON.stringify(filename),
    })
  }

  static async resetIndex(): Promise<{ message: string }> {
    return await apiRequest<{ message: string }>(API_ENDPOINTS.resetIndex, {
      method: "POST",
    })
  }

  static async checkHealth(): Promise<{ status: string; timestamp: string }> {
    return await apiRequest<{ status: string; timestamp: string }>(API_ENDPOINTS.health)
  }
}
