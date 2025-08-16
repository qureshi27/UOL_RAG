"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DocumentService } from "@/lib/document-service"

interface UploadResult {
  success: boolean
  filename: string
  chunks?: number
  error?: string
}

export function DocumentUpload({ onUploadComplete }: { onUploadComplete?: () => void }) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [results, setResults] = useState<UploadResult[]>([])
  const { toast } = useToast()

  const supportedTypes = [".txt", ".pdf", ".docx", ".doc"]
  const maxFileSize = 10 * 1024 * 1024 // 10MB

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFiles(files)
  }, [])

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return

    setUploading(true)
    setUploadProgress(0)
    setResults([])

    try {
      setUploadProgress(50)
      const response = await DocumentService.uploadDocuments(files)

      const uploadResults: UploadResult[] = files.map((file) => ({
        success: true,
        filename: file.name,
        chunks: Math.floor(response.total_chunks_in_db / files.length), // Estimate chunks per file
      }))

      setResults(uploadResults)
      setUploadProgress(100)

      toast({
        title: "Upload Complete",
        description: response.message,
      })
      onUploadComplete?.()
    } catch (error) {
      const uploadResults: UploadResult[] = files.map((file) => ({
        success: false,
        filename: file.name,
        error: error instanceof Error ? error.message : "Upload failed",
      }))

      setResults(uploadResults)

      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Upload failed",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Documents
        </CardTitle>
        <CardDescription>
          Upload documents to your knowledge base. Supported formats: {supportedTypes.join(", ")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
              : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {isDragging ? "Drop files here" : "Drag and drop files here"}
          </p>
          <p className="text-gray-500 dark:text-gray-400 mb-4">or</p>
          <input
            type="file"
            multiple
            accept=".txt,.pdf,.docx,.doc"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
            disabled={uploading}
          />
          <label htmlFor="file-upload">
            <Button asChild disabled={uploading}>
              <span className="cursor-pointer">Choose Files</span>
            </Button>
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            Maximum file size: 10MB. Supported formats: {supportedTypes.join(", ")}
          </p>
        </div>

        {uploading && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Uploading...</span>
              <span className="text-sm text-gray-500">{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-6 space-y-2">
            <h4 className="font-medium">Upload Results:</h4>
            {results.map((result, index) => (
              <Alert key={index} variant={result.success ? "default" : "destructive"}>
                {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertDescription>
                  <strong>{result.filename}</strong>:{" "}
                  {result.success ? `Successfully processed into ${result.chunks} chunks` : result.error}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
