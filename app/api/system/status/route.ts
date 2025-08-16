import { NextResponse } from "next/server"
import { RAGEngine } from "@/lib/rag-engine"

export async function GET() {
  try {
    const status = await RAGEngine.getSystemStatus()

    return NextResponse.json({
      ...status,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("System status error:", error)
    return NextResponse.json({ error: "Failed to get system status" }, { status: 500 })
  }
}
