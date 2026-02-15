import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { rollNumber, reason, explanation } = await request.json()

    if (!rollNumber || !reason) {
      return NextResponse.json(
        { error: "Roll number and reason are required" },
        { status: 400 }
      )
    }

    const db = getDb()

    const student = db.getStudent(rollNumber)
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    db.addResponse(rollNumber, reason, explanation || "")

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
