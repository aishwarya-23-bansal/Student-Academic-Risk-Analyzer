"use client"

import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
  MessageSquarePlus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Send,
} from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { FloatingCard } from "@/components/floating-card"
import { cn } from "@/lib/utils"

const recommendations = [
  { value: "extra_classes", label: "Extra Classes" },
  { value: "counseling", label: "Counseling" },
  { value: "practice_required", label: "Practice Required" },
  { value: "parent_meeting", label: "Parent Meeting" },
  { value: "peer_tutoring", label: "Peer Tutoring" },
  { value: "self_study_plan", label: "Self-Study Plan" },
]

function RemarkPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const teacherId = searchParams.get("id")
  const rollNumber = searchParams.get("roll")

  const [remark, setRemark] = useState("")
  const [recommendation, setRecommendation] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  if (!teacherId || !rollNumber) {
    router.push("/")
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!remark.trim()) {
      setError("Please enter a remark")
      return
    }
    setIsSubmitting(true)
    setError("")

    try {
      const res = await fetch("/api/remarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rollNumber,
          teacherId,
          remark: remark.trim(),
          recommendation,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save remark")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <PageShell
        title="Remark Saved"
        backHref={`/teacher/risk-overview?id=${teacherId}`}
        backLabel="Back to Overview"
      >
        <div className="mx-auto max-w-lg">
          <FloatingCard className="p-8 text-center" delay={0}>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-risk-safe/10 mb-4">
              <CheckCircle2 className="h-8 w-8 text-risk-safe" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Remark Saved Successfully
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your remark for student {rollNumber} has been saved. The student
              will see it when they log in.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() =>
                  router.push(`/teacher/risk-overview?id=${teacherId}`)
                }
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
              >
                Back to Overview
              </button>
            </div>
          </FloatingCard>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell
      title="Add Remark"
      subtitle={`For student: ${rollNumber}`}
      backHref={`/teacher/risk-overview?id=${teacherId}`}
      backLabel="Back to Overview"
    >
      <div className="mx-auto max-w-2xl">
        <FloatingCard className="p-0 overflow-hidden" delay={100}>
          <div className="h-1 bg-primary" />
          <form onSubmit={handleSubmit} className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <MessageSquarePlus className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Add Remark for {rollNumber}
                </h2>
                <p className="text-xs text-muted-foreground">
                  This remark will be visible to the student
                </p>
              </div>
            </div>

            {/* Remark text */}
            <div className="mb-4">
              <label
                htmlFor="remark"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Remark / Advice
              </label>
              <textarea
                id="remark"
                rows={4}
                value={remark}
                onChange={(e) => {
                  setRemark(e.target.value)
                  setError("")
                }}
                placeholder="Write your remark or advice for the student..."
                className={cn(
                  "w-full rounded-lg border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground leading-relaxed",
                  "transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none",
                  error ? "border-destructive" : "border-border"
                )}
              />
            </div>

            {/* Recommendation dropdown */}
            <div className="mb-4">
              <label
                htmlFor="recommendation"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Recommendation (optional)
              </label>
              <select
                id="recommendation"
                value={recommendation}
                onChange={(e) => setRecommendation(e.target.value)}
                className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary appearance-none"
              >
                <option value="">Select a recommendation...</option>
                {recommendations.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  router.push(`/teacher/risk-overview?id=${teacherId}`)
                }
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-all",
                  "hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                )}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Save Remark
                  </>
                )}
              </button>
            </div>
          </form>
        </FloatingCard>
      </div>
    </PageShell>
  )
}

export default function RemarkPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <RemarkPageContent />
    </Suspense>
  )
}
