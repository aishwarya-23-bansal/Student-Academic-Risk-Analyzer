"use client"

import { useRef, useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface FloatingCardProps {
  children: ReactNode
  className?: string
  glowColor?: string
  delay?: number
}

export function FloatingCard({
  children,
  className,
  glowColor = "hsl(var(--primary))",
  delay = 0,
}: FloatingCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState("")
  const [glowPosition, setGlowPosition] = useState({ x: 50, y: 50 })

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height

    const rotateX = (y - 0.5) * -12
    const rotateY = (x - 0.5) * 12

    setTransform(
      `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`
    )
    setGlowPosition({ x: x * 100, y: y * 100 })
  }

  function handleMouseLeave() {
    setTransform("perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0px)")
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative rounded-xl border border-border bg-card transition-transform duration-200 ease-out",
        "animate-fade-in-up",
        className
      )}
      style={{
        transform,
        transformStyle: "preserve-3d",
        animationDelay: `${delay}ms`,
        animationFillMode: "backwards",
      }}
    >
      {/* Glow overlay */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at ${glowPosition.x}% ${glowPosition.y}%, ${glowColor}10 0%, transparent 60%)`,
        }}
      />
      {children}
    </div>
  )
}
