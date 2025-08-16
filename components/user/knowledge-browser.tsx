"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { BookOpen, Search, FileText, Calendar, Hash } from "lucide-react"

interface Document {
  id: string
  filename: string
  chunks: number
  uploadedAt: string
  preview?: string
}

export function KnowledgeBrowser() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/documents/list")
      const data = await response.json()

      if (response.ok) {
        // Add preview text for each document
        const documentsWithPreview = data.documents.map((doc: Document) => ({
          ...doc,
          preview: `This document contains information about ${doc.filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")}. It has been processed into ${doc.chunks} searchable chunks for better retrieval.`,
        }))
        setDocuments(documentsWithPreview)
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredDocuments(documents)
    } else {
      const filtered = documents.filter((doc) => doc.filename.toLowerCase().includes(searchTerm.toLowerCase()))
      setFilteredDocuments(filtered)
    }
  }, [documents, searchTerm])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getFileTypeIcon = (filename: string) => {
    const extension = filename.split(".").pop()?.toLowerCase()
    switch (extension) {
      case "pdf":
        return "📄"
      case "docx":
      case "doc":
        return "📝"
      case "txt":
        return "📋"
      default:
        return "📄"
    }
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Knowledge Base
        </CardTitle>
        <CardDescription>Browse available documents and their content</CardDescription>
        <div className="pt-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full p-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Loading documents...</p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400 opacity-50" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm ? "No documents match your search" : "No documents available"}
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                {searchTerm
                  ? "Try a different search term"
                  : "Documents will appear here once uploaded by administrators"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDocuments.map((doc) => (
                <Card key={doc.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{getFileTypeIcon(doc.filename)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-gray-900 dark:text-white truncate">{doc.filename}</h3>
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Hash className="h-3 w-3" />
                            {doc.chunks}
                          </Badge>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{doc.preview}</p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <Calendar className="h-3 w-3" />
                            <span>Added {formatDate(doc.uploadedAt)}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              <FileText className="h-3 w-3 mr-1" />
                              {doc.chunks} chunks
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
