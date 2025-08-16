// In-memory vector store - in production, this would be Pinecone, Chroma, etc.

import type { DocumentChunk } from "./document-processor"
import { EmbeddingService } from "./embedding-service"

export interface SearchResult {
  chunk: DocumentChunk
  score: number
}

export interface VectorStoreStats {
  totalChunks: number
  totalDocuments: number
  storageSize: string
}

export class VectorStore {
  private static chunks: Map<string, DocumentChunk> = new Map()
  private static documentChunks: Map<string, string[]> = new Map() // docId -> chunkIds

  static async addDocument(documentId: string, chunks: DocumentChunk[]): Promise<void> {
    const chunkIds: string[] = []

    // Generate embeddings for all chunks
    const texts = chunks.map((chunk) => chunk.content)
    const embeddings = await EmbeddingService.generateBatchEmbeddings(texts)

    // Store chunks with embeddings
    for (let i = 0; i < chunks.length; i++) {
      const chunk = { ...chunks[i], embedding: embeddings[i].embedding }
      this.chunks.set(chunk.id, chunk)
      chunkIds.push(chunk.id)
    }

    // Track chunks by document
    this.documentChunks.set(documentId, chunkIds)
  }

  static async removeDocument(documentId: string): Promise<void> {
    const chunkIds = this.documentChunks.get(documentId)
    if (chunkIds) {
      // Remove all chunks for this document
      chunkIds.forEach((chunkId) => this.chunks.delete(chunkId))
      this.documentChunks.delete(documentId)
    }
  }

  static async search(query: string, limit = 5, threshold = 0.7): Promise<SearchResult[]> {
    if (this.chunks.size === 0) {
      return []
    }

    // Generate embedding for query
    const queryEmbedding = await EmbeddingService.generateEmbedding(query)

    // Calculate similarities
    const results: SearchResult[] = []

    for (const chunk of this.chunks.values()) {
      if (!chunk.embedding) continue

      const similarity = EmbeddingService.cosineSimilarity(queryEmbedding.embedding, chunk.embedding)

      if (similarity >= threshold) {
        results.push({
          chunk,
          score: similarity,
        })
      }
    }

    // Sort by similarity score (descending) and limit results
    return results.sort((a, b) => b.score - a.score).slice(0, limit)
  }

  static async similaritySearch(chunkId: string, limit = 3): Promise<SearchResult[]> {
    const targetChunk = this.chunks.get(chunkId)
    if (!targetChunk?.embedding) {
      return []
    }

    const results: SearchResult[] = []

    for (const chunk of this.chunks.values()) {
      if (chunk.id === chunkId || !chunk.embedding) continue

      const similarity = EmbeddingService.cosineSimilarity(targetChunk.embedding, chunk.embedding)
      results.push({ chunk, score: similarity })
    }

    return results.sort((a, b) => b.score - a.score).slice(0, limit)
  }

  static getStats(): VectorStoreStats {
    const totalChunks = this.chunks.size
    const totalDocuments = this.documentChunks.size

    // Estimate storage size
    let totalSize = 0
    for (const chunk of this.chunks.values()) {
      totalSize += chunk.content.length
      if (chunk.embedding) {
        totalSize += chunk.embedding.length * 8 // 8 bytes per float
      }
    }

    const storageSize = this.formatBytes(totalSize)

    return {
      totalChunks,
      totalDocuments,
      storageSize,
    }
  }

  static getAllDocuments(): string[] {
    return Array.from(this.documentChunks.keys())
  }

  static getDocumentChunks(documentId: string): DocumentChunk[] {
    const chunkIds = this.documentChunks.get(documentId) || []
    return chunkIds.map((id) => this.chunks.get(id)).filter(Boolean) as DocumentChunk[]
  }

  private static formatBytes(bytes: number): string {
    if (bytes === 0) return "0 Bytes"

    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Development/testing utilities
  static clear(): void {
    this.chunks.clear()
    this.documentChunks.clear()
  }

  static export(): { chunks: DocumentChunk[]; documentChunks: Record<string, string[]> } {
    return {
      chunks: Array.from(this.chunks.values()),
      documentChunks: Object.fromEntries(this.documentChunks),
    }
  }
}
