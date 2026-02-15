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

    const totalStudents = db.countStudentsByTeacher(teacherId)
    const highRiskStudents = db.countHighRiskByTeacher(teacherId)
    const pendingResponses = db.countPendingResponses(teacherId)

    return NextResponse.json({
      totalStudents,
      highRiskStudents,
      pendingResponses,
      teacherName: teacher.name,
    })
  } catch {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}
