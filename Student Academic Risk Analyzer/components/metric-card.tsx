"use client"

import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: ReactNode
  accentColor?: string
  delay?: number
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  accentColor = "hsl(var(--primary))",
  delay = 0,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "group relative rounded-lg border border-border bg-card p-6",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5",
        "animate-fade-in-up"
      )}
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: "backwards",
      }}
    >
      {/* Subtle glow accent on top edge */}
      <div
        className="absolute inset-x-0 top-0 h-px rounded-t-lg"
        style={{ backgroundColor: accentColor, opacity: 0.5 }}
      />

      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-muted-foreground">
            {title}
          </span>
          <span className="text-3xl font-bold tracking-tight text-foreground font-mono">
            {value}
          </span>
          {subtitle && (
            <span className="text-xs text-muted-foreground">{subtitle}</span>
          )}
        </div>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}
