"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  Clock,
  BookOpen,
  FileCheck,
  MessageSquare,
  ArrowRight,
  Loader2,
  TrendingDown,
} from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { FloatingCard } from "@/components/floating-card"
import { cn } from "@/lib/utils"

interface StudentData {
  rollNumber: string
  name: string
  attendance: number
  marks: number
  assignmentScore: number
  riskLevel: number
  riskLabel: string
  dominantRiskFactor: string
  riskReasons: string[]
  learningDecline: boolean
  trendScores: number[]
}

interface RemarkData {
  id: number
  remark: string
  recommendation: string
  teacherName: string
  createdAt: string
}

interface ExistingResponse {
  id: number
  reason: string
  explanation: string
  createdAt: string
}

interface StudentPageData {
  student: StudentData
  remarks: RemarkData[]
  existingResponse: ExistingResponse | null
}

const riskConfig: Record<
  number,
  {
    color: string
    bgClass: string
    badgeClass: string
    label: string
    icon: React.ComponentType<{ className?: string }>
  }
> = {
  0: {
    color: "hsl(var(--risk-safe))",
    bgClass: "bg-risk-safe/10",
    badgeClass: "bg-risk-safe/15 text-risk-safe",
    label: "Safe",
    icon: CheckCircle2,
  },
  1: {
    color: "hsl(var(--risk-attention))",
    bgClass: "bg-risk-attention/10",
    badgeClass: "bg-risk-attention/15 text-risk-attention",
    label: "Needs Attention",
    icon: Eye,
  },
  2: {
    color: "hsl(var(--risk-high))",
    bgClass: "bg-risk-high/10",
    badgeClass: "bg-risk-high/15 text-risk-high",
    label: "High Risk",
    icon: AlertTriangle,
  },
}

function StudentDashboardContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const rollNumber = searchParams.get("roll")
  const [pageData, setPageData] = useState<StudentPageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!rollNumber) {
      router.push("/")
      return
    }

    async function fetchData() {
      try {
        const res = await fetch("/api/student/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rollNumber }),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error)
        setPageData(json)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [rollNumber, router])

  if (!rollNumber) return null

  if (loading) {
    return (
      <PageShell title="Student Dashboard" backHref="/" backLabel="Home">
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageShell>
    )
  }

  if (error || !pageData) {
    return (
      <PageShell title="Student Dashboard" backHref="/" backLabel="Home">
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive" />
          <p className="text-lg text-foreground">{error || "No data found"}</p>
          <button
            onClick={() => router.push("/")}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Go Home
          </button>
        </div>
      </PageShell>
    )
  }

  const { student, remarks, existingResponse } = pageData
  const config = riskConfig[student.riskLevel] ?? riskConfig[0]
  const RiskIcon = config.icon

  return (
    <PageShell
      title="Student Dashboard"
      subtitle={`${student.name} (${student.rollNumber})`}
      backHref="/"
      backLabel="Home"
    >
      <div className="flex flex-col gap-6">
        {/* Student profile header */}
        <FloatingCard className="p-0 overflow-hidden" glowColor={config.color} delay={0}>
          <div className="h-1.5" style={{ backgroundColor: config.color }} />
          <div className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-xl",
                    config.bgClass
                  )}
                >
                  <RiskIcon
                    className="h-7 w-7"
                    style={{ color: config.color }}
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {student.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-muted-foreground font-mono">
                      {student.rollNumber}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-medium",
                        config.badgeClass
                      )}
                    >
                      {config.label}
                    </span>
                    {student.learningDecline && (
                      <span className="flex items-center gap-1 text-xs text-risk-high">
                        <TrendingDown className="h-3 w-3" />
                        Declining
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FloatingCard>

        {/* Performance metrics */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FloatingCard className="p-5" delay={100}>
            <div className="flex items-center gap-3 text-muted-foreground mb-3">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Attendance</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-foreground font-mono">
                {student.attendance}
              </span>
              <span className="mb-1 text-sm text-muted-foreground">%</span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${student.attendance}%`,
                  backgroundColor:
                    student.attendance >= 75
                      ? "hsl(var(--risk-safe))"
                      : student.attendance >= 60
                        ? "hsl(var(--risk-attention))"
                        : "hsl(var(--risk-high))",
                }}
              />
            </div>
          </FloatingCard>

          <FloatingCard className="p-5" delay={200}>
            <div className="flex items-center gap-3 text-muted-foreground mb-3">
              <BookOpen className="h-4 w-4" />
              <span className="text-sm font-medium">Marks</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-foreground font-mono">
                {student.marks}
              </span>
              <span className="mb-1 text-sm text-muted-foreground">/100</span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${student.marks}%`,
                  backgroundColor:
                    student.marks >= 60
                      ? "hsl(var(--risk-safe))"
                      : student.marks >= 40
                        ? "hsl(var(--risk-attention))"
                        : "hsl(var(--risk-high))",
                }}
              />
            </div>
          </FloatingCard>

          <FloatingCard className="p-5" delay={300}>
            <div className="flex items-center gap-3 text-muted-foreground mb-3">
              <FileCheck className="h-4 w-4" />
              <span className="text-sm font-medium">Assignments</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-foreground font-mono">
                {student.assignmentScore}
              </span>
              <span className="mb-1 text-sm text-muted-foreground">/100</span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${student.assignmentScore}%`,
                  backgroundColor:
                    student.assignmentScore >= 70
                      ? "hsl(var(--risk-safe))"
                      : student.assignmentScore >= 50
                        ? "hsl(var(--risk-attention))"
                        : "hsl(var(--risk-high))",
                }}
              />
            </div>
          </FloatingCard>
        </section>

        {/* Risk Analysis */}
        {student.riskReasons.length > 0 && (
          <FloatingCard className="p-6" delay={350}>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Risk Analysis
            </h3>
            <ul className="mt-3 flex flex-col gap-2">
              {student.riskReasons.map((reason, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-foreground/80"
                >
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: config.color }}
                  />
                  {reason}
                </li>
              ))}
            </ul>
            {student.dominantRiskFactor !== "None" && (
              <p className="mt-3 text-xs text-muted-foreground">
                Dominant factor:{" "}
                <span className="font-medium text-foreground">
                  {student.dominantRiskFactor}
                </span>
              </p>
            )}
          </FloatingCard>
        )}

        {/* Performance Trend */}
        {student.trendScores.length > 0 && (
          <FloatingCard className="p-6" delay={400}>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Performance Trend
            </h3>
            <div className="flex items-end gap-2 h-20">
              {student.trendScores.map((score, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-sm transition-all"
                    style={{
                      height: `${(score / 100) * 64}px`,
                      backgroundColor: config.color,
                      opacity: 0.3 + (i / student.trendScores.length) * 0.7,
                    }}
                  />
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {score}
                  </span>
                </div>
              ))}
            </div>
          </FloatingCard>
        )}

        {/* Teacher Remarks */}
        <FloatingCard className="p-6" delay={450}>
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Teacher Remarks
            </h3>
          </div>

          {remarks.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No teacher remarks yet. Your teacher will provide feedback here.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {remarks.map((r) => (
                <div
                  key={r.id}
                  className="rounded-lg bg-secondary p-4"
                >
                  <p className="text-sm text-foreground leading-relaxed">{r.remark}</p>
                  {r.recommendation && (
                    <p className="mt-2 text-xs text-primary font-medium">
                      Recommendation: {r.recommendation.replace(/_/g, " ")}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">
                    By {r.teacherName} on{" "}
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </FloatingCard>

        {/* Existing Response or Respond button */}
        {existingResponse ? (
          <FloatingCard className="p-6" delay={500}>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-4 w-4 text-risk-safe" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Your Response
              </h3>
            </div>
            <div className="rounded-lg bg-risk-safe/5 border border-risk-safe/20 p-4">
              <p className="text-xs font-medium text-risk-safe">
                Reason: {existingResponse.reason.replace(/_/g, " ")}
              </p>
              {existingResponse.explanation && (
                <p className="mt-2 text-sm text-foreground/80 leading-relaxed">
                  {existingResponse.explanation}
                </p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                Submitted on{" "}
                {new Date(existingResponse.createdAt).toLocaleDateString()}
              </p>
            </div>
          </FloatingCard>
        ) : (
          <FloatingCard
            className="group cursor-pointer p-0 overflow-hidden"
            glowColor="hsl(var(--primary))"
            delay={500}
          >
            <button
              onClick={() =>
                router.push(`/student/respond?roll=${rollNumber}`)
              }
              className="flex w-full items-center justify-between p-6 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    Submit Your Response
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Share the reason for any academic challenges
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-primary transition-transform group-hover:translate-x-1" />
            </button>
          </FloatingCard>
        )}
      </div>
    </PageShell>
  )
}

export default function StudentDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <StudentDashboardContent />
    </Suspense>
  )
}
