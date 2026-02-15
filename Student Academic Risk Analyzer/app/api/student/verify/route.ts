import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { rollNumber } = await request.json()

    if (!rollNumber || typeof rollNumber !== "string") {
      return NextResponse.json(
        { error: "Roll Number is required" },
        { status: 400 }
      )
    }

    const db = getDb()
    const lookupRoll = rollNumber.trim().toUpperCase()
    const student = db.getStudent(lookupRoll)

    if (!student) {
      return NextResponse.json(
        { error: "No student found with this Roll Number. Try S001 through S020." },
        { status: 404 }
      )
    }

    // Get teacher remarks for this student
    const remarks = db.getRemarksByStudent(lookupRoll)

    // Check if student has already responded
    const existingResponse = db.getLatestResponse(lookupRoll)

    return NextResponse.json({
      student: {
        rollNumber: student.roll_number,
        name: student.name,
        attendance: student.attendance,
        marks: student.marks,
        assignmentScore: student.assignment_score,
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
      existingResponse: existingResponse
        ? {
            id: existingResponse.id,
            reason: existingResponse.reason,
            explanation: existingResponse.explanation,
            createdAt: existingResponse.created_at,
          }
        : null,
    })
  } catch {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}
