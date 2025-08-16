import { type NextRequest, NextResponse } from "next/server"
import { RAGEngine } from "@/lib/rag-engine"

export async function POST(request: NextRequest) {
  try {
    const { question, maxSources, similarityThreshold } = await request.json()

    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "Question is required" }, { status: 400 })
    }

    if (question.trim().length === 0) {
      return NextResponse.json({ error: "Question cannot be empty" }, { status: 400 })
    }

    const response = await RAGEngine.query({
      question: question.trim(),
      maxSources,
      similarityThreshold,
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error("Chat query error:", error)
    return NextResponse.json({ error: "Failed to process query" }, { status: 500 })
  }
}
