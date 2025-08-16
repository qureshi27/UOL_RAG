// RAG (Retrieval-Augmented Generation) engine

import { VectorStore, type SearchResult } from "./vector-store"

export interface RAGResponse {
  answer: string
  sources: SearchResult[]
  confidence: number
  processingTime: number
}

export interface RAGQuery {
  question: string
  maxSources?: number
  similarityThreshold?: number
}

export class RAGEngine {
  private static readonly DEFAULT_MAX_SOURCES = 5
  private static readonly DEFAULT_SIMILARITY_THRESHOLD = 0.7

  static async query(params: RAGQuery): Promise<RAGResponse> {
    const startTime = Date.now()

    const {
      question,
      maxSources = this.DEFAULT_MAX_SOURCES,
      similarityThreshold = this.DEFAULT_SIMILARITY_THRESHOLD,
    } = params

    // Step 1: Retrieve relevant chunks
    const sources = await VectorStore.search(question, maxSources, similarityThreshold)

    if (sources.length === 0) {
      return {
        answer:
          "I couldn't find any relevant information in the knowledge base to answer your question. Please try rephrasing your question or check if the relevant documents have been uploaded.",
        sources: [],
        confidence: 0,
        processingTime: Date.now() - startTime,
      }
    }

    // Step 2: Generate answer using retrieved context
    const answer = await this.generateAnswer(question, sources)

    // Step 3: Calculate confidence based on source relevance
    const confidence = this.calculateConfidence(sources)

    return {
      answer,
      sources,
      confidence,
      processingTime: Date.now() - startTime,
    }
  }

  private static async generateAnswer(question: string, sources: SearchResult[]): Promise<string> {
    // In a real implementation, this would call an LLM API (OpenAI, Anthropic, etc.)
    // For now, we'll create a mock response based on the retrieved context

    const context = sources.map((source) => source.chunk.content).join("\n\n")

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Generate a mock answer that incorporates the context
    return this.generateMockAnswer(question, context, sources)
  }

  private static generateMockAnswer(question: string, context: string, sources: SearchResult[]): string {
    const questionLower = question.toLowerCase()
    const contextLower = context.toLowerCase()

    // Extract key terms from the question
    const questionWords = questionLower
      .split(/\s+/)
      .filter((word) => word.length > 3 && !["what", "how", "when", "where", "why", "which", "who"].includes(word))

    // Find relevant sentences from context
    const sentences = context.split(/[.!?]+/).filter((s) => s.trim().length > 20)
    const relevantSentences = sentences
      .filter((sentence) => questionWords.some((word) => sentence.toLowerCase().includes(word)))
      .slice(0, 3)

    if (relevantSentences.length === 0) {
      return `Based on the available documents, I found information related to your question about "${question}". However, I cannot provide a specific answer. The relevant context suggests: ${context.substring(0, 200)}...`
    }

    // Create a structured answer
    let answer = `Based on the information in the knowledge base:\n\n`

    if (questionLower.includes("what") || questionLower.includes("define")) {
      answer += `${relevantSentences[0]}. `
    } else if (questionLower.includes("how")) {
      answer += `Here's how this works: ${relevantSentences.join(". ")}. `
    } else if (questionLower.includes("why")) {
      answer += `The reason is: ${relevantSentences.join(". ")}. `
    } else {
      answer += `${relevantSentences.join(". ")}. `
    }

    // Add source attribution
    const uniqueSources = [...new Set(sources.map((s) => s.chunk.metadata.source))]
    if (uniqueSources.length > 0) {
      answer += `\n\nThis information comes from: ${uniqueSources.join(", ")}.`
    }

    return answer
  }

  private static calculateConfidence(sources: SearchResult[]): number {
    if (sources.length === 0) return 0

    // Calculate confidence based on:
    // 1. Average similarity score
    // 2. Number of sources
    // 3. Score distribution

    const avgScore = sources.reduce((sum, source) => sum + source.score, 0) / sources.length
    const scoreVariance =
      sources.reduce((sum, source) => sum + Math.pow(source.score - avgScore, 2), 0) / sources.length

    // Higher confidence for:
    // - Higher average scores
    // - More sources (up to a point)
    // - Lower variance (more consistent scores)

    let confidence = avgScore * 0.7 // Base confidence from similarity
    confidence += Math.min(sources.length / 5, 0.2) // Bonus for multiple sources
    confidence -= Math.min(scoreVariance, 0.1) // Penalty for high variance

    return Math.max(0, Math.min(1, confidence))
  }

  static async getSystemStatus() {
    const stats = VectorStore.getStats()

    return {
      status: "operational",
      vectorStore: stats,
      capabilities: {
        documentProcessing: true,
        semanticSearch: true,
        questionAnswering: true,
      },
      supportedFileTypes: [".txt", ".pdf", ".docx"],
    }
  }
}
