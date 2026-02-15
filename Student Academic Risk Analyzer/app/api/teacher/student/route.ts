import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const teacherId = request.nextUrl.searchParams.get("teacherId")
    const rollNumber = request.nextUrl.searchParams.get("roll")

    if (!teacherId || !rollNumber) {
      return NextResponse.json(
        { error: "Teacher ID and roll number are required" },
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

    const student = db.getStudent(rollNumber)

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      )
    }

    if (student.teacher_id !== teacherId) {
      return NextResponse.json(
        { error: "Student does not belong to this teacher" },
        { status: 403 }
      )
    }

    const remarks = db.getRemarksByStudent(rollNumber, teacherId)
    const latestResponse = db.getLatestResponse(rollNumber)

    return NextResponse.json({
      student: {
        rollNumber: student.roll_number,
        name: student.name,
        subjects: student.subjects ?? [],
        overallAttendance: student.overall_attendance,
        overallMarks: student.overall_marks,
        overallAssignment: student.overall_assignment,
        riskLevel: student.risk_level,
        riskLabel: student.risk_label,
        dominantRiskFactor: student.dominant_risk_factor,
        riskReasons: JSON.parse(student.risk_reasons),
        learningDecline: !!student.learning_decline,
        trendScores: JSON.parse(student.trend_scores),
      },
      remarks: remarks.map((r) => ({
        id: r.id,
        remark: r.remark,
        recommendation: r.recommendation,
        teacherName: r.teacher_name,
        createdAt: r.created_at,
      })),
      response: latestResponse
        ? {
            id: latestResponse.id,
            reason: latestResponse.reason,
            explanation: latestResponse.explanation,
            createdAt: latestResponse.created_at,
          }
        : null,
    })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
