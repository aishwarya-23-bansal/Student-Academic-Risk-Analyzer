"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
  Users,
  AlertTriangle,
  CheckCircle2,
  Eye,
  MessageSquarePlus,
  Loader2,
  TrendingDown,
  Mail,
  MailCheck,
} from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { FloatingCard } from "@/components/floating-card"
import { cn } from "@/lib/utils"

interface EnrichedStudent {
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
  hasRemark: boolean
  hasResponse: boolean
}

interface OverviewData {
  students: EnrichedStudent[]
  summary: {
    total: number
    safe: number
    needsAttention: number
    highRisk: number
    averageAttendance: number
    averageMarks: number
    averageAssignment: number
  }
}

const riskConfig: Record<
  number,
  {
    color: string
    bgClass: string
    borderClass: string
    badgeClass: string
    label: string
    icon: React.ComponentType<{ className?: string }>
  }
> = {
  0: {
    color: "hsl(var(--risk-safe))",
    bgClass: "bg-risk-safe/10",
    borderClass: "border-risk-safe/30",
    badgeClass: "bg-risk-safe/15 text-risk-safe",
    label: "Safe",
    icon: CheckCircle2,
  },
  1: {
    color: "hsl(var(--risk-attention))",
    bgClass: "bg-risk-attention/10",
    borderClass: "border-risk-attention/30",
    badgeClass: "bg-risk-attention/15 text-risk-attention",
    label: "Needs Attention",
    icon: Eye,
  },
  2: {
    color: "hsl(var(--risk-high))",
    bgClass: "bg-risk-high/10",
    borderClass: "border-risk-high/30",
    badgeClass: "bg-risk-high/15 text-risk-high",
    label: "High Risk",
    icon: AlertTriangle,
  },
}

function RiskOverviewContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const teacherId = searchParams.get("id")
  const [data, setData] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState<"all" | 0 | 1 | 2>("all")

  useEffect(() => {
    if (!teacherId) {
      router.push("/")
      return
    }

    async function fetchStudents() {
      try {
        const res = await fetch(
          `/api/teacher/students?teacherId=${teacherId}`
        )
        const json = await res.json()
        if (!res.ok) throw new Error(json.error)
        setData(json)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load")
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [teacherId, router])

  if (!teacherId) return null

  if (loading) {
    return (
      <PageShell title="Risk Overview" backHref={`/teacher/dashboard?id=${teacherId}`}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageShell>
    )
  }

  if (error || !data) {
    return (
      <PageShell title="Risk Overview" backHref={`/teacher/dashboard?id=${teacherId}`}>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive" />
          <p className="text-lg text-foreground">{error || "No data available"}</p>
          <button
            onClick={() => router.push(`/teacher/upload?id=${teacherId}`)}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Upload Data First
          </button>
        </div>
      </PageShell>
    )
  }

  const filteredStudents =
    filter === "all"
      ? data.students
      : data.students.filter((s) => s.riskLevel === filter)

  return (
    <PageShell
      title="Risk Overview"
      subtitle={`${data.summary.total} students analyzed`}
      backHref={`/teacher/dashboard?id=${teacherId}`}
      backLabel="Back to Dashboard"
    >
      <div className="flex flex-col gap-6">
        {/* Summary bar */}
        <div className="flex h-6 w-full overflow-hidden rounded-lg">
          {data.summary.safe > 0 && (
            <div
              className="flex items-center justify-center bg-risk-safe transition-all"
              style={{
                width: `${(data.summary.safe / data.summary.total) * 100}%`,
              }}
            >
              <span className="text-[10px] font-bold text-background">
                {data.summary.safe} Safe
              </span>
            </div>
          )}
          {data.summary.needsAttention > 0 && (
            <div
              className="flex items-center justify-center bg-risk-attention transition-all"
              style={{
                width: `${(data.summary.needsAttention / data.summary.total) * 100}%`,
              }}
            >
              <span className="text-[10px] font-bold text-background">
                {data.summary.needsAttention} Attention
              </span>
            </div>
          )}
          {data.summary.highRisk > 0 && (
            <div
              className="flex items-center justify-center bg-risk-high transition-all"
              style={{
                width: `${(data.summary.highRisk / data.summary.total) * 100}%`,
              }}
            >
              <span className="text-[10px] font-bold text-background">
                {data.summary.highRisk} High Risk
              </span>
            </div>
          )}
        </div>

        {/* Filter pills */}
        <div className="flex gap-1.5 rounded-lg bg-secondary p-1 w-fit">
          {(
            [
              { key: "all" as const, label: "All", count: data.summary.total },
              { key: 0 as const, label: "Safe", count: data.summary.safe },
              {
                key: 1 as const,
                label: "Attention",
                count: data.summary.needsAttention,
              },
              {
                key: 2 as const,
                label: "High Risk",
                count: data.summary.highRisk,
              },
            ]
          ).map((f) => (
            <button
              key={String(f.key)}
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                filter === f.key
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}{" "}
              <span className="font-mono opacity-60">{f.count}</span>
            </button>
          ))}
        </div>

        {/* Student cards */}
        <div className="flex flex-col gap-3">
          {filteredStudents.length === 0 && (
            <div className="flex items-center justify-center rounded-lg border border-dashed border-border py-16 text-sm text-muted-foreground">
              {data.summary.total === 0
                ? "No student data uploaded yet"
                : "No students match this filter"}
            </div>
          )}

          {filteredStudents.map((student, i) => {
            const config = riskConfig[student.riskLevel] ?? riskConfig[0]
            const RiskIcon = config.icon

            return (
              <FloatingCard
                key={student.rollNumber}
                className="p-0 overflow-hidden cursor-pointer"
                glowColor={config.color}
                delay={i * 50}
              >
                <div
                  className="h-0.5"
                  style={{ backgroundColor: config.color, opacity: 0.6 }}
                />
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    onClick={() =>
                      router.push(
                        `/teacher/student?id=${teacherId}&roll=${student.rollNumber}`
                      )
                    }
                    className="flex items-center gap-4 text-left flex-1 min-w-0"
                  >
                    {/* Avatar */}
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                        config.bgClass
                      )}
                    >
                      <RiskIcon
                        className="h-5 w-5"
                        style={{ color: config.color }}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-foreground hover:text-primary transition-colors">
                          {student.name}
                        </span>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-medium",
                            config.badgeClass
                          )}
                        >
                          {config.label}
                        </span>
                        {student.learningDecline && (
                          <TrendingDown className="h-3.5 w-3.5 text-risk-high" />
                        )}
                      </div>
                      <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="font-mono">{student.rollNumber}</span>
                        <span>Att: {student.attendance}%</span>
                        <span>Marks: {student.marks}</span>
                        <span>Assign: {student.assignmentScore}</span>
                      </div>
                    </div>
                  </button>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Response status badge */}
                    {student.hasRemark && (
                      <span
                        className={cn(
                          "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
                          student.hasResponse
                            ? "bg-risk-safe/15 text-risk-safe"
                            : "bg-risk-attention/15 text-risk-attention"
                        )}
                      >
                        {student.hasResponse ? (
                          <>
                            <MailCheck className="h-3 w-3" />
                            Responded
                          </>
                        ) : (
                          <>
                            <Mail className="h-3 w-3" />
                            Awaiting
                          </>
                        )}
                      </span>
                    )}

                    {/* View details button */}
                    <button
                      onClick={() =>
                        router.push(
                          `/teacher/student?id=${teacherId}&roll=${student.rollNumber}`
                        )
                      }
                      className={cn(
                        "flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all",
                        "bg-secondary text-secondary-foreground hover:bg-accent"
                      )}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Details
                    </button>

                    {/* Add remark button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(
                          `/teacher/remark?id=${teacherId}&roll=${student.rollNumber}`
                        )
                      }}
                      className={cn(
                        "flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all",
                        "bg-primary/10 text-primary hover:bg-primary/20"
                      )}
                    >
                      <MessageSquarePlus className="h-3.5 w-3.5" />
                      {student.hasRemark ? "Edit Remark" : "Add Remark"}
                    </button>
                  </div>
                </div>
              </FloatingCard>
            )
          })}
        </div>
      </div>
    </PageShell>
  )
}

export default function RiskOverviewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <RiskOverviewContent />
    </Suspense>
  )
}
