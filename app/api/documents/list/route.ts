import { NextResponse } from "next/server"
import { VectorStore } from "@/lib/vector-store"

export async function GET() {
  try {
    const documentIds = VectorStore.getAllDocuments()
    const documents = documentIds.map((id) => {
      const chunks = VectorStore.getDocumentChunks(id)
      const firstChunk = chunks[0]

      return {
        id,
        filename: firstChunk?.metadata.source || "Unknown",
        chunks: chunks.length,
        uploadedAt: firstChunk?.metadata.timestamp || new Date().toISOString(),
      }
    })

    return NextResponse.json({
      documents,
      stats: VectorStore.getStats(),
    })
  } catch (error) {
    console.error("Document list error:", error)
    return NextResponse.json({ error: "Failed to retrieve documents" }, { status: 500 })
  }
}
