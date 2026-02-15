import { NextRequest, NextResponse } from "next/server"
import { getDb, predictFromSubjects } from "@/lib/db"
import type { SubjectEntry } from "@/lib/db"

/**
 * Parse a CSV that can have either:
 *   - Flat columns: RollNumber, Name, Attendance, Marks, AssignmentScore
 *   - Subject-wise columns: RollNumber, Name, Math_Attendance, Math_Marks, Math_Assignment, Science_Attendance, ...
 *
 * Subject detection works by scanning headers for patterns like <Subject>_Attendance, <Subject>_Marks, <Subject>_Assignment.
 * Any number of subjects is supported.
 */
function parseCSV(text: string): {
  roll: string
  name: string
  subjects: SubjectEntry[]
}[] {
  const lines = text.trim().split("\n")
  if (lines.length < 2)
    throw new Error("CSV must have a header row and at least one data row")

  const header = lines[0].split(",").map((h) => h.trim())

  const nameIdx = header.findIndex((h) => h === "Name")
  const rollIdx = header.findIndex(
    (h) => h === "RollNumber" || h === "Roll Number"
  )

  if (nameIdx === -1) throw new Error("Missing required column: Name")

  // Detect subject columns: look for patterns like <Subject>_Attendance, <Subject>_Marks, <Subject>_Assignment
  const subjectMap = new Map<
    string,
    { attIdx: number; marksIdx: number; assignIdx: number }
  >()

  for (let i = 0; i < header.length; i++) {
    const h = header[i]
    const attMatch = h.match(/^(.+?)_Attendance$/i)
    if (attMatch) {
      const subjectName = attMatch[1]
      if (!subjectMap.has(subjectName)) {
        subjectMap.set(subjectName, { attIdx: -1, marksIdx: -1, assignIdx: -1 })
      }
      subjectMap.get(subjectName)!.attIdx = i
    }
    const marksMatch = h.match(/^(.+?)_Marks$/i)
    if (marksMatch) {
      const subjectName = marksMatch[1]
      if (!subjectMap.has(subjectName)) {
        subjectMap.set(subjectName, { attIdx: -1, marksIdx: -1, assignIdx: -1 })
      }
      subjectMap.get(subjectName)!.marksIdx = i
    }
    const assignMatch = h.match(/^(.+?)_Assignment$/i)
    if (assignMatch) {
      const subjectName = assignMatch[1]
      if (!subjectMap.has(subjectName)) {
        subjectMap.set(subjectName, { attIdx: -1, marksIdx: -1, assignIdx: -1 })
      }
      subjectMap.get(subjectName)!.assignIdx = i
    }
  }

  const isSubjectWise = subjectMap.size > 0

  // Fallback: flat columns
  let flatAttIdx = -1,
    flatMarksIdx = -1,
    flatAssignIdx = -1
  if (!isSubjectWise) {
    flatAttIdx = header.findIndex((h) => h === "Attendance")
    flatMarksIdx = header.findIndex((h) => h === "Marks")
    flatAssignIdx = header.findIndex(
      (h) => h === "AssignmentScore" || h === "Assignment Score"
    )
    if (flatAttIdx === -1)
      throw new Error("Missing required column: Attendance")
    if (flatMarksIdx === -1) throw new Error("Missing required column: Marks")
    if (flatAssignIdx === -1)
      throw new Error("Missing required column: AssignmentScore")
  }

  const students: { roll: string; name: string; subjects: SubjectEntry[] }[] =
    []

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim())
    if (!cols[nameIdx]) continue

    const rollNumber =
      rollIdx !== -1 && cols[rollIdx]
        ? cols[rollIdx].toUpperCase()
        : `S${String(i).padStart(3, "0")}`

    const subjects: SubjectEntry[] = []

    if (isSubjectWise) {
      for (const [subjectName, indices] of subjectMap) {
        subjects.push({
          name: subjectName,
          attendance:
            indices.attIdx !== -1 ? parseFloat(cols[indices.attIdx]) || 0 : 0,
          marks:
            indices.marksIdx !== -1
              ? parseFloat(cols[indices.marksIdx]) || 0
              : 0,
          assignmentScore:
            indices.assignIdx !== -1
              ? parseFloat(cols[indices.assignIdx]) || 0
              : 0,
        })
      }
    } else {
      subjects.push({
        name: "General",
        attendance: parseFloat(cols[flatAttIdx]) || 0,
        marks: parseFloat(cols[flatMarksIdx]) || 0,
        assignmentScore: parseFloat(cols[flatAssignIdx]) || 0,
      })
    }

    students.push({ roll: rollNumber, name: cols[nameIdx], subjects })
  }

  return students
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const teacherId = formData.get("teacherId") as string | null

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    if (!teacherId) {
      return NextResponse.json(
        { error: "Teacher ID is required" },
        { status: 400 }
      )
    }

    const text = await file.text()
    const students = parseCSV(text)

    if (students.length === 0) {
      return NextResponse.json(
        { error: "No valid student data found in CSV" },
        { status: 400 }
      )
    }

    const db = getDb()

    const teacher = db.getTeacher(teacherId)
    if (!teacher) {
      return NextResponse.json(
        { error: "Invalid Teacher ID" },
        { status: 400 }
      )
    }

    // Collect all subject names
    const subjectNames = new Set<string>()

    const results = students.map((student) => {
      const p = predictFromSubjects(student.subjects)

      for (const sub of student.subjects) {
        subjectNames.add(sub.name)
      }

      db.upsertStudent({
        roll_number: student.roll,
        name: student.name,
        subjects: student.subjects,
        overall_attendance: p.avgAtt,
        overall_marks: p.avgMarks,
        overall_assignment: p.avgAssign,
        risk_level: p.riskLevel,
        risk_label: p.riskLabel,
        dominant_risk_factor: p.dominant,
        risk_reasons: JSON.stringify(p.reasons),
        learning_decline: p.decline ? 1 : 0,
        trend_scores: JSON.stringify(p.trend),
        teacher_id: teacherId,
        created_at: new Date().toISOString(),
      })

      return {
        rollNumber: student.roll,
        name: student.name,
        subjects: student.subjects,
        attendance: p.avgAtt,
        marks: p.avgMarks,
        assignmentScore: p.avgAssign,
        riskLevel: p.riskLevel,
        riskLabel: p.riskLabel,
        dominantRiskFactor: p.dominant,
        riskReasons: p.reasons,
        learningDecline: p.decline,
        trendScores: p.trend,
      }
    })

    const safe = results.filter((r) => r.riskLevel === 0).length
    const needsAttention = results.filter((r) => r.riskLevel === 1).length
    const highRisk = results.filter((r) => r.riskLevel === 2).length
    const avgAttendance =
      results.reduce((s, r) => s + r.attendance, 0) / results.length
    const avgMarks =
      results.reduce((s, r) => s + r.marks, 0) / results.length
    const avgAssignment =
      results.reduce((s, r) => s + r.assignmentScore, 0) / results.length

    return NextResponse.json({
      students: results,
      summary: {
        total: results.length,
        safe,
        needsAttention,
        highRisk,
        averageAttendance: Math.round(avgAttendance * 10) / 10,
        averageMarks: Math.round(avgMarks * 10) / 10,
        averageAssignment: Math.round(avgAssignment * 10) / 10,
        subjects: Array.from(subjectNames),
      },
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
