"use client"

import type { ReactNode } from "react"
import { GraduationCap, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface PageShellProps {
  children: ReactNode
  title: string
  subtitle?: string
  backHref?: string
  backLabel?: string
  actions?: ReactNode
}

export function PageShell({
  children,
  title,
  subtitle,
  backHref,
  backLabel = "Back",
  actions,
}: PageShellProps) {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            {backHref && (
              <button
                onClick={() => router.push(backHref)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-secondary text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label={backLabel}
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-foreground">
                {title}
              </h1>
              {subtitle && (
                <p className="hidden text-xs text-muted-foreground sm:block">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</div>

      {/* Background decorative elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div
          className={cn(
            "absolute -top-40 -right-40 h-80 w-80 rounded-full opacity-[0.03]",
            "bg-primary blur-3xl"
          )}
        />
        <div
          className={cn(
            "absolute -bottom-40 -left-40 h-80 w-80 rounded-full opacity-[0.03]",
            "bg-chart-1 blur-3xl"
          )}
        />
      </div>
    </main>
  )
}
