"use client"

import { useState, useCallback, useRef, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
  Upload,
  FileText,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { FloatingCard } from "@/components/floating-card"
import { cn } from "@/lib/utils"

function UploadPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const teacherId = searchParams.get("id")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isDragOver, setIsDragOver] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState("")
  const [isUploading, setIsUploading] = useState(false)

  const validateFile = useCallback((f: File): boolean => {
    if (!f.name.endsWith(".csv")) {
      setError("Please upload a CSV file")
      return false
    }
    if (f.size > 5 * 1024 * 1024) {
      setError("File size must be under 5MB")
      return false
    }
    setError("")
    return true
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile && validateFile(droppedFile)) {
        setFile(droppedFile)
      }
    },
    [validateFile]
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0]
      if (selectedFile && validateFile(selectedFile)) {
        setFile(selectedFile)
      }
    },
    [validateFile]
  )

  const handleSubmit = useCallback(async () => {
    if (!file || !teacherId) return
    setIsUploading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("teacherId", teacherId)

      const response = await fetch("/api/predict", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Prediction failed")
      }

      // Redirect to risk overview
      router.push(`/teacher/risk-overview?id=${teacherId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setIsUploading(false)
    }
  }, [file, teacherId, router])

  if (!teacherId) {
    router.push("/")
    return null
  }

  return (
    <PageShell
      title="Upload Student Data"
      subtitle="CSV file analysis"
      backHref={`/teacher/dashboard?id=${teacherId}`}
      backLabel="Back to Dashboard"
    >
      <div className="mx-auto max-w-2xl">
        <FloatingCard className="p-0 overflow-hidden" delay={100}>
          <div className="h-1 bg-primary" />
          <div className="p-6">
            <h2 className="text-xl font-semibold text-foreground">
              Upload Student Data
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload a CSV file with student academic data for ML risk analysis
            </p>

            {/* Drop zone */}
            <div
              className={cn(
                "mt-6 flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-10 transition-all duration-200",
                isDragOver
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground/40",
                file && "border-chart-1 bg-chart-1/5"
              )}
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragOver(true)
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
            >
              {file ? (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-chart-1/10">
                    <FileText className="h-7 w-7 text-chart-1" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setFile(null)
                      if (fileInputRef.current) fileInputRef.current.value = ""
                    }}
                    className="text-xs text-muted-foreground underline hover:text-foreground"
                  >
                    Choose a different file
                  </button>
                </>
              ) : (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary">
                    <Upload className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-foreground">
                      Drag and drop your CSV file here
                    </p>
                    <p className="text-xs text-muted-foreground">or</p>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg bg-secondary px-5 py-2.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-accent"
                  >
                    Browse Files
                  </button>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                aria-label="Select CSV file"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Expected format */}
            <div className="mt-5 rounded-lg bg-secondary p-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Subject-wise CSV format (recommended):
              </p>
              <code className="block rounded-md bg-background p-3 text-xs text-foreground font-mono leading-relaxed overflow-x-auto">
                {'RollNumber,Name,Math_Attendance,Math_Marks,Math_Assignment,Science_Attendance,...'}
                <br />
                {'S001,Alice Johnson,92,85,78,88,80,82'}
              </code>
              <div className="mt-3 flex flex-col gap-2">
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5 text-chart-1" />
                  <span>{'Add as many subjects as needed: <Subject>_Attendance, <Subject>_Marks, <Subject>_Assignment'}</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5 text-chart-1" />
                  <span>Also supports flat format: Name, Attendance, Marks, AssignmentScore</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5 text-chart-1" />
                  <span>RollNumber column is optional. Auto-generated if not provided</span>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() =>
                  router.push(`/teacher/dashboard?id=${teacherId}`)
                }
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!file || isUploading}
                className={cn(
                  "flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-all",
                  "hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                )}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Submit & Analyze
                  </>
                )}
              </button>
            </div>
          </div>
        </FloatingCard>
      </div>
    </PageShell>
  )
}

export default function UploadPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <UploadPageContent />
    </Suspense>
  )
}
