import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { teacherId } = await request.json()

    if (!teacherId || typeof teacherId !== "string") {
      return NextResponse.json(
        { error: "Teacher ID is required" },
        { status: 400 }
      )
    }

    const db = getDb()
    const teacher = db.getTeacher(teacherId.trim().toUpperCase())

    if (!teacher) {
      return NextResponse.json(
        { error: "Invalid Teacher ID. Valid IDs: T001, T002, T003" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      teacherId: teacher.teacher_id,
      name: teacher.name,
    })
  } catch {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}
