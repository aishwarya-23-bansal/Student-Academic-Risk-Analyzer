"use client"

import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
  MessageSquare,
  Loader2,
  AlertCircle,
  Send,
  CheckCircle2,
  Heart,
} from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { FloatingCard } from "@/components/floating-card"
import { cn } from "@/lib/utils"

const reasons = [
  {
    value: "health_issue",
    label: "Health Issue",
    description: "Physical or mental health challenges affecting academics",
  },
  {
    value: "family_issue",
    label: "Family Issue",
    description: "Family problems or responsibilities impacting study time",
  },
  {
    value: "concept_not_understood",
    label: "Concept Not Understood",
    description: "Difficulty understanding the subject material or concepts",
  },
  {
    value: "time_management",
    label: "Time Management",
    description: "Struggling to balance academic workload and schedule",
  },
  {
    value: "financial_difficulty",
    label: "Financial Difficulty",
    description: "Financial constraints affecting access to resources",
  },
  {
    value: "other",
    label: "Other",
    description: "A different reason not listed above",
  },
]

function StudentResponseContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const rollNumber = searchParams.get("roll")

  const [selectedReason, setSelectedReason] = useState("")
  const [explanation, setExplanation] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  if (!rollNumber) {
    router.push("/")
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedReason) {
      setError("Please select a reason")
      return
    }
    setIsSubmitting(true)
    setError("")

    try {
      const res = await fetch("/api/student/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rollNumber,
          reason: selectedReason,
          explanation: explanation.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit response")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Success / confirmation page
  if (success) {
    return (
      <PageShell title="Response Submitted" backHref={`/student/dashboard?roll=${rollNumber}`}>
        <div className="mx-auto max-w-lg">
          <FloatingCard className="p-8 text-center" delay={0}>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-risk-safe/10 mb-6">
              <CheckCircle2 className="h-10 w-10 text-risk-safe" />
            </div>
            <h2 className="text-2xl font-bold text-foreground text-balance">
              Thank You for Your Response
            </h2>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto text-pretty">
              Your teacher will review your feedback. Remember, seeking help is a sign of strength, and your academic team is here to support you.
            </p>

            <div className="mt-6 rounded-lg bg-primary/5 border border-primary/20 p-4">
              <div className="flex items-center justify-center gap-2 text-primary">
                <Heart className="h-4 w-4" />
                <span className="text-sm font-medium">
                  You are not alone in this journey
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() =>
                  router.push(`/student/dashboard?roll=${rollNumber}`)
                }
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => router.push("/")}
                className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-accent"
              >
                Go Home
              </button>
            </div>
          </FloatingCard>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell
      title="Submit Response"
      subtitle={`Student: ${rollNumber}`}
      backHref={`/student/dashboard?roll=${rollNumber}`}
      backLabel="Back to Dashboard"
    >
      <div className="mx-auto max-w-2xl">
        <FloatingCard className="p-0 overflow-hidden" delay={100}>
          <div className="h-1 bg-chart-1" />
          <form onSubmit={handleSubmit} className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-1/10">
                <MessageSquare className="h-5 w-5 text-chart-1" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Share Your Feedback
                </h2>
                <p className="text-xs text-muted-foreground">
                  Help your teacher understand your academic challenges
                </p>
              </div>
            </div>

            {/* Reason selection */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-foreground mb-3">
                Select a reason for academic challenges
              </label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {reasons.map((reason) => (
                  <button
                    key={reason.value}
                    type="button"
                    onClick={() => {
                      setSelectedReason(reason.value)
                      setError("")
                    }}
                    className={cn(
                      "rounded-lg border p-3 text-left transition-all",
                      selectedReason === reason.value
                        ? "border-chart-1 bg-chart-1/5"
                        : "border-border bg-secondary hover:border-muted-foreground/40"
                    )}
                  >
                    <span
                      className={cn(
                        "text-sm font-medium",
                        selectedReason === reason.value
                          ? "text-chart-1"
                          : "text-foreground"
                      )}
                    >
                      {reason.label}
                    </span>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {reason.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Explanation */}
            <div className="mb-5">
              <label
                htmlFor="explanation"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Additional explanation (optional)
              </label>
              <textarea
                id="explanation"
                rows={4}
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Share any additional details that might help your teacher understand your situation..."
                className="w-full rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground leading-relaxed transition-colors focus:outline-none focus:ring-2 focus:ring-chart-1/50 focus:border-chart-1 resize-none"
              />
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
                  router.push(`/student/dashboard?roll=${rollNumber}`)
                }
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "flex items-center gap-2 rounded-lg bg-chart-1 px-6 py-2.5 text-sm font-medium text-background transition-all",
                  "hover:bg-chart-1/90 disabled:cursor-not-allowed disabled:opacity-50"
                )}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Response
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

export default function StudentResponsePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <StudentResponseContent />
    </Suspense>
  )
}
