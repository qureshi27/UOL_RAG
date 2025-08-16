import { type NextRequest, NextResponse } from "next/server"
import { DocumentProcessor } from "@/lib/document-processor"
import { VectorStore } from "@/lib/vector-store"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    if (!DocumentProcessor.isFileTypeSupported(file.type)) {
      return NextResponse.json({ error: `Unsupported file type: ${file.type}` }, { status: 400 })
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size exceeds 10MB limit" }, { status: 400 })
    }

    // Process the document
    const processedDoc = await DocumentProcessor.processFile(file)

    // Add to vector store
    await VectorStore.addDocument(processedDoc.id, processedDoc.chunks)

    return NextResponse.json({
      success: true,
      document: {
        id: processedDoc.id,
        filename: processedDoc.filename,
        chunks: processedDoc.chunks.length,
        metadata: processedDoc.metadata,
      },
    })
  } catch (error) {
    console.error("Document upload error:", error)
    return NextResponse.json({ error: "Failed to process document" }, { status: 500 })
  }
}
