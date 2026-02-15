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
  MessageSquarePlus,
  Loader2,
  TrendingDown,
  MailCheck,
  Mail,
  User,
} from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { FloatingCard } from "@/components/floating-card"
import { cn } from "@/lib/utils"

interface SubjectData {
  name: string
  attendance: number
  marks: number
  assignmentScore: number
}

interface StudentDetail {
  rollNumber: string
  name: string
  subjects: SubjectData[]
  overallAttendance: number
  overallMarks: number
  overallAssignment: number
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

interface ResponseData {
  id: number
  reason: string
  explanation: string
  createdAt: string
}

interface PageData {
  student: StudentDetail
  remarks: RemarkData[]
  response: ResponseData | null
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

function getBarColor(value: number, type: "attendance" | "marks" | "assignment"): string {
  if (type === "attendance") {
    if (value >= 75) return "hsl(var(--risk-safe))"
    if (value >= 60) return "hsl(var(--risk-attention))"
    return "hsl(var(--risk-high))"
  }
  if (type === "marks") {
    if (value >= 60) return "hsl(var(--risk-safe))"
    if (value >= 40) return "hsl(var(--risk-attention))"
    return "hsl(var(--risk-high))"
  }
  // assignment
  if (value >= 70) return "hsl(var(--risk-safe))"
  if (value >= 50) return "hsl(var(--risk-attention))"
  return "hsl(var(--risk-high))"
}

function StudentDetailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const teacherId = searchParams.get("id")
  const rollNumber = searchParams.get("roll")
  const [data, setData] = useState<PageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!teacherId || !rollNumber) {
      router.push("/")
      return
    }

    async function fetchStudent() {
      try {
        const res = await fetch(
          `/api/teacher/student?teacherId=${teacherId}&roll=${rollNumber}`
        )
        const json = await res.json()
        if (!res.ok) throw new Error(json.error)
        setData(json)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load student data")
      } finally {
        setLoading(false)
      }
    }

    fetchStudent()
  }, [teacherId, rollNumber, router])

  if (!teacherId || !rollNumber) return null

  if (loading) {
    return (
      <PageShell
        title="Student Details"
        backHref={`/teacher/risk-overview?id=${teacherId}`}
      >
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageShell>
    )
  }

  if (error || !data) {
    return (
      <PageShell
        title="Student Details"
        backHref={`/teacher/risk-overview?id=${teacherId}`}
      >
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive" />
          <p className="text-lg text-foreground">{error || "No data found"}</p>
          <button
            onClick={() => router.push(`/teacher/risk-overview?id=${teacherId}`)}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Back to Overview
          </button>
        </div>
      </PageShell>
    )
  }

  const { student, remarks, response } = data
  const config = riskConfig[student.riskLevel] ?? riskConfig[0]
  const RiskIcon = config.icon
  const hasSubjects = student.subjects && student.subjects.length > 0

  return (
    <PageShell
      title="Student Details"
      subtitle={`${student.name} (${student.rollNumber})`}
      backHref={`/teacher/risk-overview?id=${teacherId}`}
      backLabel="Back to Overview"
      actions={
        <button
          onClick={() =>
            router.push(
              `/teacher/remark?id=${teacherId}&roll=${student.rollNumber}`
            )
          }
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
        >
          <MessageSquarePlus className="h-4 w-4" />
          Add Remark
        </button>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Student profile header */}
        <FloatingCard
          className="p-0 overflow-hidden"
          glowColor={config.color}
          delay={0}
        >
          <div
            className="h-1.5"
            style={{ backgroundColor: config.color }}
          />
          <div className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-xl",
                    config.bgClass
                  )}
                >
                  <User
                    className="h-7 w-7"
                    style={{ color: config.color }}
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground text-balance">
                    {student.name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
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
              {student.dominantRiskFactor !== "None" && (
                <div className="text-sm text-muted-foreground">
                  Dominant risk:{" "}
                  <span className="font-medium text-foreground">
                    {student.dominantRiskFactor}
                  </span>
                </div>
              )}
            </div>
          </div>
        </FloatingCard>

        {/* Overall Performance */}
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Overall Performance
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FloatingCard className="p-5" delay={100}>
              <div className="flex items-center gap-3 text-muted-foreground mb-3">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Attendance</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-foreground font-mono">
                  {student.overallAttendance}
                </span>
                <span className="mb-1 text-sm text-muted-foreground">%</span>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${student.overallAttendance}%`,
                    backgroundColor: getBarColor(
                      student.overallAttendance,
                      "attendance"
                    ),
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
                  {student.overallMarks}
                </span>
                <span className="mb-1 text-sm text-muted-foreground">/100</span>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${student.overallMarks}%`,
                    backgroundColor: getBarColor(
                      student.overallMarks,
                      "marks"
                    ),
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
                  {student.overallAssignment}
                </span>
                <span className="mb-1 text-sm text-muted-foreground">/100</span>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${student.overallAssignment}%`,
                    backgroundColor: getBarColor(
                      student.overallAssignment,
                      "assignment"
                    ),
                  }}
                />
              </div>
            </FloatingCard>
          </div>
        </section>

        {/* Subject-wise Breakdown */}
        {hasSubjects && student.subjects.length > 1 && (
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Subject-wise Breakdown
            </h3>
            <div className="flex flex-col gap-3">
              {student.subjects.map((subject, i) => (
                <FloatingCard
                  key={subject.name}
                  className="p-0 overflow-hidden"
                  delay={350 + i * 80}
                >
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <h4 className="text-base font-semibold text-foreground">
                        {subject.name}
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      {/* Attendance */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-muted-foreground">
                            Attendance
                          </span>
                          <span className="text-sm font-bold font-mono text-foreground">
                            {subject.attendance}%
                          </span>
                        </div>
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${subject.attendance}%`,
                              backgroundColor: getBarColor(
                                subject.attendance,
                                "attendance"
                              ),
                            }}
                          />
                        </div>
                      </div>

                      {/* Marks */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-muted-foreground">
                            Marks
                          </span>
                          <span className="text-sm font-bold font-mono text-foreground">
                            {subject.marks}/100
                          </span>
                        </div>
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${subject.marks}%`,
                              backgroundColor: getBarColor(
                                subject.marks,
                                "marks"
                              ),
                            }}
                          />
                        </div>
                      </div>

                      {/* Assignment */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-muted-foreground">
                            Assignment
                          </span>
                          <span className="text-sm font-bold font-mono text-foreground">
                            {subject.assignmentScore}/100
                          </span>
                        </div>
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${subject.assignmentScore}%`,
                              backgroundColor: getBarColor(
                                subject.assignmentScore,
                                "assignment"
                              ),
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </FloatingCard>
              ))}
            </div>
          </section>
        )}

        {/* Subject comparison table */}
        {hasSubjects && student.subjects.length > 1 && (
          <FloatingCard className="p-0 overflow-hidden" delay={600}>
            <div className="p-5 pb-0">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Subject Comparison
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-5 py-3 text-left font-medium text-muted-foreground">
                      Subject
                    </th>
                    <th className="px-5 py-3 text-right font-medium text-muted-foreground">
                      Attendance
                    </th>
                    <th className="px-5 py-3 text-right font-medium text-muted-foreground">
                      Marks
                    </th>
                    <th className="px-5 py-3 text-right font-medium text-muted-foreground">
                      Assignment
                    </th>
                    <th className="px-5 py-3 text-right font-medium text-muted-foreground">
                      Average
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {student.subjects.map((subject) => {
                    const avg = Math.round(
                      (subject.attendance + subject.marks + subject.assignmentScore) / 3
                    )
                    return (
                      <tr
                        key={subject.name}
                        className="border-b border-border/50 last:border-b-0"
                      >
                        <td className="px-5 py-3 font-medium text-foreground">
                          {subject.name}
                        </td>
                        <td className="px-5 py-3 text-right font-mono">
                          <span
                            style={{
                              color: getBarColor(subject.attendance, "attendance"),
                            }}
                          >
                            {subject.attendance}%
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right font-mono">
                          <span
                            style={{
                              color: getBarColor(subject.marks, "marks"),
                            }}
                          >
                            {subject.marks}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right font-mono">
                          <span
                            style={{
                              color: getBarColor(
                                subject.assignmentScore,
                                "assignment"
                              ),
                            }}
                          >
                            {subject.assignmentScore}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right font-mono font-bold text-foreground">
                          {avg}
                        </td>
                      </tr>
                    )
                  })}
                  {/* Overall row */}
                  <tr className="bg-secondary/50">
                    <td className="px-5 py-3 font-semibold text-foreground">
                      Overall
                    </td>
                    <td className="px-5 py-3 text-right font-mono font-bold text-foreground">
                      {student.overallAttendance}%
                    </td>
                    <td className="px-5 py-3 text-right font-mono font-bold text-foreground">
                      {student.overallMarks}
                    </td>
                    <td className="px-5 py-3 text-right font-mono font-bold text-foreground">
                      {student.overallAssignment}
                    </td>
                    <td className="px-5 py-3 text-right font-mono font-bold text-foreground">
                      {Math.round(
                        (student.overallAttendance +
                          student.overallMarks +
                          student.overallAssignment) /
                          3
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </FloatingCard>
        )}

        {/* Risk Analysis */}
        {student.riskReasons.length > 0 && (
          <FloatingCard className="p-6" delay={650}>
            <div className="flex items-center gap-2 mb-3">
              <RiskIcon
                className="h-4 w-4"
                style={{ color: config.color }}
              />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Risk Analysis
              </h3>
            </div>
            <ul className="flex flex-col gap-2">
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
          </FloatingCard>
        )}

        {/* Performance Trend */}
        {student.trendScores.length > 0 && (
          <FloatingCard className="p-6" delay={700}>
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
        <FloatingCard className="p-6" delay={750}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Teacher Remarks
              </h3>
            </div>
            <button
              onClick={() =>
                router.push(
                  `/teacher/remark?id=${teacherId}&roll=${student.rollNumber}`
                )
              }
              className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
            >
              <MessageSquarePlus className="h-3.5 w-3.5" />
              Add Remark
            </button>
          </div>

          {remarks.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No remarks added yet for this student.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {remarks.map((r) => (
                <div key={r.id} className="rounded-lg bg-secondary p-4">
                  <p className="text-sm text-foreground leading-relaxed">
                    {r.remark}
                  </p>
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

        {/* Student Response */}
        <FloatingCard className="p-6" delay={800}>
          <div className="flex items-center gap-2 mb-3">
            {response ? (
              <MailCheck className="h-4 w-4 text-risk-safe" />
            ) : (
              <Mail className="h-4 w-4 text-risk-attention" />
            )}
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Student Response
            </h3>
          </div>

          {response ? (
            <div className="rounded-lg bg-risk-safe/5 border border-risk-safe/20 p-4">
              <p className="text-xs font-medium text-risk-safe">
                Reason: {response.reason.replace(/_/g, " ")}
              </p>
              {response.explanation && (
                <p className="mt-2 text-sm text-foreground/80 leading-relaxed">
                  {response.explanation}
                </p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                Submitted on{" "}
                {new Date(response.createdAt).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border py-6 text-center">
              <p className="text-sm text-muted-foreground">
                {remarks.length > 0
                  ? "Awaiting student response to the remark."
                  : "No remarks sent yet. Add a remark first for the student to respond to."}
              </p>
            </div>
          )}
        </FloatingCard>
      </div>
    </PageShell>
  )
}

export default function TeacherStudentDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <StudentDetailContent />
    </Suspense>
  )
}
