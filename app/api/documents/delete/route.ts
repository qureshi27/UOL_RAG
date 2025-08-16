import { type NextRequest, NextResponse } from "next/server"
import { VectorStore } from "@/lib/vector-store"

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get("id")

    if (!documentId) {
      return NextResponse.json({ error: "Document ID required" }, { status: 400 })
    }

    await VectorStore.removeDocument(documentId)

    return NextResponse.json({
      success: true,
      message: "Document deleted successfully",
    })
  } catch (error) {
    console.error("Document deletion error:", error)
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 })
  }
}
