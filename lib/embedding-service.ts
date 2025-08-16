// Mock embedding service - in production, this would connect to OpenAI, Cohere, etc.

export interface EmbeddingResponse {
  embedding: number[]
  tokens: number
}

export class EmbeddingService {
  private static readonly EMBEDDING_DIMENSION = 384 // Simulating sentence-transformers dimension

  static async generateEmbedding(text: string): Promise<EmbeddingResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Generate mock embedding based on text content
    const embedding = this.generateMockEmbedding(text)

    return {
      embedding,
      tokens: Math.ceil(text.length / 4), // Rough token estimation
    }
  }

  static async generateBatchEmbeddings(texts: string[]): Promise<EmbeddingResponse[]> {
    // Process in batches to simulate real API behavior
    const batchSize = 10
    const results: EmbeddingResponse[] = []

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize)
      const batchPromises = batch.map((text) => this.generateEmbedding(text))
      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)
    }

    return results
  }

  private static generateMockEmbedding(text: string): number[] {
    // Create a deterministic but varied embedding based on text content
    const embedding = new Array(this.EMBEDDING_DIMENSION).fill(0)

    // Use text characteristics to generate pseudo-realistic embeddings
    const textHash = this.simpleHash(text.toLowerCase())
    const words = text.toLowerCase().split(/\s+/)

    for (let i = 0; i < this.EMBEDDING_DIMENSION; i++) {
      // Combine text hash, word count, and position for variation
      const seed = textHash + words.length + i
      embedding[i] = (Math.sin(seed) + Math.cos(seed * 2) + Math.sin(seed * 3)) / 3
    }

    // Normalize the embedding vector
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
    return embedding.map((val) => val / magnitude)
  }

  private static simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash
  }

  static cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error("Vectors must have the same length")
    }

    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }
}
