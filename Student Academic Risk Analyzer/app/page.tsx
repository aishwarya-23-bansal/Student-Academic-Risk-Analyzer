"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  GraduationCap,
  ArrowRight,
  Loader2,
  AlertCircle,
  Users,
  BookOpen,
  ChevronDown,
} from "lucide-react"
import { FloatingCard } from "@/components/floating-card"
import { cn } from "@/lib/utils"

type Role = "teacher" | "student"

const roleConfig = {
  teacher: {
    icon: Users,
    label: "Teacher",
    idLabel: "Teacher ID",
    placeholder: "e.g. T001",
    hint: "Demo IDs: T001, T002, T003",
    accent: "primary" as const,
    button: "Enter Teacher Dashboard",
  },
  student: {
    icon: BookOpen,
    label: "Student",
    idLabel: "Roll Number",
    placeholder: "e.g. S001",
    hint: "Demo: S001 through S020",
    accent: "chart-1" as const,
    button: "View My Performance",
  },
}

export default function HomePage() {
  const router = useRouter()
  const [role, setRole] = useState<Role>("teacher")
  const [idValue, setIdValue] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const config = roleConfig[role]
  const RoleIcon = config.icon

  function switchRole(newRole: Role) {
    setRole(newRole)
    setIdValue("")
    setError("")
    setDropdownOpen(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!idValue.trim()) {
      setError(`Please enter your ${config.idLabel}`)
      return
    }
    setLoading(true)
    setError("")

    try {
      if (role === "teacher") {
        const res = await fetch("/api/teacher/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ teacherId: idValue.trim() }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error)
          return
        }
        router.push(`/teacher/dashboard?id=${data.teacherId}`)
      } else {
        const res = await fetch("/api/student/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rollNumber: idValue.trim() }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error)
          return
        }
        router.push(`/student/dashboard?roll=${data.student.rollNumber}`)
      }
    } catch {
      setError("Connection error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const isTeacher = role === "teacher"

  return (
    <main className="relative min-h-screen bg-background flex flex-col items-center justify-center px-4 py-16 overflow-hidden">
      {/* Background glows */}
      <div
        className={cn(
          "absolute -top-40 -right-40 h-96 w-96 rounded-full blur-3xl pointer-events-none transition-colors duration-700",
          isTeacher ? "bg-primary/5" : "bg-chart-1/5"
        )}
      />
      <div
        className={cn(
          "absolute -bottom-40 -left-40 h-96 w-96 rounded-full blur-3xl pointer-events-none transition-colors duration-700",
          isTeacher ? "bg-chart-1/5" : "bg-primary/5"
        )}
      />

      {/* Title block */}
      <div className="relative z-10 text-center mb-10 animate-fade-in-up">
        <div
          className={cn(
            "mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card shadow-lg transition-shadow duration-500",
            isTeacher ? "shadow-primary/10" : "shadow-chart-1/10"
          )}
        >
          <GraduationCap
            className={cn(
              "h-7 w-7 transition-colors duration-500",
              isTeacher ? "text-primary" : "text-chart-1"
            )}
          />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
          Student Academic Risk Analyzer
        </h1>
        <p className="mt-3 max-w-lg mx-auto text-muted-foreground text-pretty leading-relaxed">
          ML-powered analytics for identifying at-risk students.
          Sign in below to access the platform.
        </p>
      </div>

      {/* Unified login card */}
      <FloatingCard
        className="group relative z-10 w-full max-w-md p-0 overflow-hidden"
        glowColor={isTeacher ? "hsl(var(--primary))" : "hsl(var(--chart-1))"}
        delay={100}
      >
        {/* Accent bar */}
        <div
          className={cn(
            "h-1.5 transition-colors duration-500",
            isTeacher ? "bg-primary" : "bg-chart-1"
          )}
        />

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {/* Role selector */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              I am a
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                suppressHydrationWarning
                className={cn(
                  "flex w-full items-center justify-between rounded-lg border bg-secondary px-4 py-2.5 text-sm text-foreground",
                  "transition-colors focus:outline-none focus:ring-2",
                  isTeacher
                    ? "focus:ring-primary/50 focus:border-primary"
                    : "focus:ring-chart-1/50 focus:border-chart-1",
                  dropdownOpen ? "border-border ring-1 ring-border" : "border-border"
                )}
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-md",
                      isTeacher ? "bg-primary/10" : "bg-chart-1/10"
                    )}
                  >
                    <RoleIcon
                      className={cn(
                        "h-4 w-4",
                        isTeacher ? "text-primary" : "text-chart-1"
                      )}
                    />
                  </span>
                  {config.label}
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform duration-200",
                    dropdownOpen && "rotate-180"
                  )}
                />
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-border bg-card shadow-xl shadow-black/20">
                  {(["teacher", "student"] as Role[]).map((r) => {
                    const rc = roleConfig[r]
                    const Icon = rc.icon
                    const active = r === role
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => switchRole(r)}
                        suppressHydrationWarning
                        className={cn(
                          "flex w-full items-center gap-2.5 px-4 py-3 text-sm transition-colors",
                          active
                            ? "bg-secondary text-foreground"
                            : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-7 w-7 items-center justify-center rounded-md",
                            r === "teacher" ? "bg-primary/10" : "bg-chart-1/10"
                          )}
                        >
                          <Icon
                            className={cn(
                              "h-4 w-4",
                              r === "teacher" ? "text-primary" : "text-chart-1"
                            )}
                          />
                        </span>
                        <span className="flex flex-col items-start">
                          <span className="font-medium">{rc.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {r === "teacher"
                              ? "Upload data, analyze risks, add remarks"
                              : "View performance, read remarks, respond"}
                          </span>
                        </span>
                        {active && (
                          <span
                            className={cn(
                              "ml-auto h-2 w-2 rounded-full",
                              r === "teacher" ? "bg-primary" : "bg-chart-1"
                            )}
                          />
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ID input */}
          <div>
            <label
              htmlFor="id-input"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              {config.idLabel}
            </label>
            <input
              id="id-input"
              type="text"
              placeholder={config.placeholder}
              value={idValue}
              onChange={(e) => {
                setIdValue(e.target.value)
                setError("")
              }}
              suppressHydrationWarning
              className={cn(
                "w-full rounded-lg border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground",
                "transition-colors focus:outline-none focus:ring-2",
                isTeacher
                  ? "focus:ring-primary/50 focus:border-primary"
                  : "focus:ring-chart-1/50 focus:border-chart-1",
                error ? "border-destructive" : "border-border"
              )}
            />
            {error && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-destructive">
                <AlertCircle className="h-3 w-3 shrink-0" />
                {error}
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            suppressHydrationWarning
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
              "disabled:cursor-not-allowed disabled:opacity-50",
              isTeacher
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-chart-1 text-background hover:bg-chart-1/90"
            )}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                {config.button}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          <p className="text-center text-xs text-muted-foreground">
            {config.hint}
          </p>
        </form>
      </FloatingCard>

      {/* Footer */}
      <p className="relative z-10 mt-10 text-center text-xs text-muted-foreground max-w-md text-pretty">
        ML-inspired risk prediction classifying student academic risk based on
        attendance, marks, and assignment scores.
      </p>
    </main>
  )
}
