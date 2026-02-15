import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { rollNumber, teacherId, remark, recommendation } = await request.json()

    if (!rollNumber || !teacherId || !remark) {
      return NextResponse.json(
        { error: "Roll number, teacher ID, and remark are required" },
        { status: 400 }
      )
    }

    const db = getDb()

    const teacher = db.getTeacher(teacherId)
    if (!teacher) {
      return NextResponse.json({ error: "Invalid teacher ID" }, { status: 404 })
    }

    const student = db.getStudent(rollNumber)
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    db.addRemark(rollNumber, teacherId, remark, recommendation || "")

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const rollNumber = request.nextUrl.searchParams.get("rollNumber")
    const teacherId = request.nextUrl.searchParams.get("teacherId")

    if (!rollNumber) {
      return NextResponse.json(
        { error: "Roll number is required" },
        { status: 400 }
      )
    }

    const db = getDb()
    const remarks = db.getRemarksByStudent(rollNumber, teacherId ?? undefined)

    return NextResponse.json({ remarks })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
