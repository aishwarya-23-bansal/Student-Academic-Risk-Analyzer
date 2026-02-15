import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const teacherId = request.nextUrl.searchParams.get("teacherId")

    if (!teacherId) {
      return NextResponse.json(
        { error: "Teacher ID is required" },
        { status: 400 }
      )
    }

    const db = getDb()
    const teacher = db.getTeacher(teacherId)

    if (!teacher) {
      return NextResponse.json(
        { error: "Invalid Teacher ID" },
        { status: 404 }
      )
    }

    const students = db.getStudentsByTeacher(teacherId)

    const enrichedStudents = students.map((s) => ({
      rollNumber: s.roll_number,
      name: s.name,
      attendance: s.overall_attendance,
      marks: s.overall_marks,
      assignmentScore: s.overall_assignment,
      subjects: s.subjects ?? [],
      riskLevel: s.risk_level,
      riskLabel: s.risk_label,
      dominantRiskFactor: s.dominant_risk_factor,
      riskReasons: JSON.parse(s.risk_reasons),
      learningDecline: !!s.learning_decline,
      trendScores: JSON.parse(s.trend_scores),
      hasRemark: db.hasRemarkForStudent(s.roll_number, teacherId),
      hasResponse: db.hasResponse(s.roll_number),
    }))

    const total = enrichedStudents.length
    const safe = enrichedStudents.filter((s) => s.riskLevel === 0).length
    const needsAttention = enrichedStudents.filter((s) => s.riskLevel === 1).length
    const highRisk = enrichedStudents.filter((s) => s.riskLevel === 2).length
    const avgAttendance =
      total > 0
        ? Math.round(
            (enrichedStudents.reduce((sum, s) => sum + s.attendance, 0) / total) * 10
          ) / 10
        : 0
    const avgMarks =
      total > 0
        ? Math.round(
            (enrichedStudents.reduce((sum, s) => sum + s.marks, 0) / total) * 10
          ) / 10
        : 0
    const avgAssignment =
      total > 0
        ? Math.round(
            (enrichedStudents.reduce((sum, s) => sum + s.assignmentScore, 0) / total) * 10
          ) / 10
        : 0

    return NextResponse.json({
      students: enrichedStudents,
      summary: {
        total,
        safe,
        needsAttention,
        highRisk,
        averageAttendance: avgAttendance,
        averageMarks: avgMarks,
        averageAssignment: avgAssignment,
      },
    })
  } catch {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}
