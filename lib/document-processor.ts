// Document processing utilities for RAG pipeline

export interface DocumentChunk {
  id: string
  content: string
  metadata: {
    source: string
    page?: number
    chunkIndex: number
    timestamp: string
  }
  embedding?: number[]
}

export interface ProcessedDocument {
  id: string
  filename: string
  content: string
  chunks: DocumentChunk[]
  metadata: {
    fileType: string
    fileSize: number
    uploadedAt: string
    processedAt: string
  }
}

export class DocumentProcessor {
  private static readonly CHUNK_SIZE = 1000
  private static readonly CHUNK_OVERLAP = 200

  static async processFile(file: File): Promise<ProcessedDocument> {
    const content = await this.extractTextFromFile(file)
    const chunks = this.chunkText(content, file.name)

    return {
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      filename: file.name,
      content,
      chunks,
      metadata: {
        fileType: file.type,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        processedAt: new Date().toISOString(),
      },
    }
  }

  private static async extractTextFromFile(file: File): Promise<string> {
    const fileType = file.type.toLowerCase()

    if (fileType.includes("text/plain")) {
      return await file.text()
    }

    if (fileType.includes("application/pdf")) {
      // In a real implementation, you'd use a PDF parsing library
      // For now, we'll simulate PDF text extraction
      return `[PDF Content from ${file.name}]\n\nThis is simulated PDF content. In a real implementation, this would be extracted using a PDF parsing library like pdf-parse or PDF.js.\n\nThe content would include all the text from the PDF document, maintaining structure and formatting where possible.`
    }

    if (fileType.includes("application/vnd.openxmlformats-officedocument.wordprocessingml.document")) {
      // In a real implementation, you'd use a DOCX parsing library
      return `[DOCX Content from ${file.name}]\n\nThis is simulated DOCX content. In a real implementation, this would be extracted using a library like mammoth.js or docx-parser.\n\nThe content would include all the text from the Word document.`
    }

    // Fallback to treating as text
    try {
      return await file.text()
    } catch (error) {
      throw new Error(`Unsupported file type: ${fileType}`)
    }
  }

  private static chunkText(text: string, source: string): DocumentChunk[] {
    const chunks: DocumentChunk[] = []
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)

    let currentChunk = ""
    let chunkIndex = 0

    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim()
      if (!trimmedSentence) continue

      const potentialChunk = currentChunk + (currentChunk ? ". " : "") + trimmedSentence

      if (potentialChunk.length > this.CHUNK_SIZE && currentChunk.length > 0) {
        // Create chunk from current content
        chunks.push({
          id: `chunk_${Date.now()}_${chunkIndex}`,
          content: currentChunk.trim(),
          metadata: {
            source,
            chunkIndex,
            timestamp: new Date().toISOString(),
          },
        })

        // Start new chunk with overlap
        const words = currentChunk.split(" ")
        const overlapWords = words.slice(-Math.floor(this.CHUNK_OVERLAP / 5)) // Approximate word overlap
        currentChunk = overlapWords.join(" ") + ". " + trimmedSentence
        chunkIndex++
      } else {
        currentChunk = potentialChunk
      }
    }

    // Add final chunk if there's remaining content
    if (currentChunk.trim()) {
      chunks.push({
        id: `chunk_${Date.now()}_${chunkIndex}`,
        content: currentChunk.trim(),
        metadata: {
          source,
          chunkIndex,
          timestamp: new Date().toISOString(),
        },
      })
    }

    return chunks
  }

  static getSupportedFileTypes(): string[] {
    return [
      "text/plain",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ]
  }

  static isFileTypeSupported(fileType: string): boolean {
    return this.getSupportedFileTypes().some((type) => fileType.includes(type))
  }
}
