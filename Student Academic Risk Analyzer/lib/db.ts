// In-memory data store with subject-wise academic data
// Uses globalThis to survive HMR reloads in development

export interface TeacherRow {
  teacher_id: string
  name: string
  created_at: string
}

export interface SubjectEntry {
  name: string
  attendance: number
  marks: number
  assignmentScore: number
}

export interface StudentRow {
  roll_number: string
  name: string
  subjects: SubjectEntry[]
  overall_attendance: number
  overall_marks: number
  overall_assignment: number
  risk_level: number
  risk_label: string
  dominant_risk_factor: string
  risk_reasons: string
  learning_decline: number
  trend_scores: string
  teacher_id: string
  created_at: string
}

export interface RemarkRow {
  id: number
  roll_number: string
  teacher_id: string
  remark: string
  recommendation: string
  created_at: string
}

export interface ResponseRow {
  id: number
  roll_number: string
  reason: string
  explanation: string
  created_at: string
}

// ── Risk prediction helper ─────────────────────────────────────────
function predictFromSubjects(subjects: SubjectEntry[]) {
  // Average across all subjects
  const n = subjects.length || 1
  const avgAtt = subjects.reduce((s, sub) => s + sub.attendance, 0) / n
  const avgMarks = subjects.reduce((s, sub) => s + sub.marks, 0) / n
  const avgAssign = subjects.reduce((s, sub) => s + sub.assignmentScore, 0) / n

  const composite = avgAtt * 0.35 + avgMarks * 0.4 + avgAssign * 0.25
  const reasons: string[] = []
  const factors: { factor: string; severity: number }[] = []

  // Check per-subject issues
  for (const sub of subjects) {
    if (sub.attendance < 60) {
      reasons.push(`Low ${sub.name} attendance at ${sub.attendance}%`)
      factors.push({ factor: `${sub.name} Attendance`, severity: 60 - sub.attendance })
    } else if (sub.attendance < 75) {
      factors.push({ factor: `${sub.name} Attendance`, severity: 75 - sub.attendance })
    }
    if (sub.marks < 40) {
      reasons.push(`Critical ${sub.name} marks: ${sub.marks}/100`)
      factors.push({ factor: `${sub.name} Marks`, severity: 40 - sub.marks })
    } else if (sub.marks < 60) {
      factors.push({ factor: `${sub.name} Marks`, severity: 60 - sub.marks })
    }
    if (sub.assignmentScore < 50) {
      reasons.push(`Low ${sub.name} assignment: ${sub.assignmentScore}/100`)
      factors.push({ factor: `${sub.name} Assignments`, severity: 50 - sub.assignmentScore })
    }
  }

  // Overall checks
  if (avgAtt < 60) reasons.push(`Overall attendance low: ${Math.round(avgAtt)}%`)
  if (avgMarks < 40) reasons.push(`Overall marks critical: ${Math.round(avgMarks)}/100`)

  let riskLevel: number, riskLabel: string
  if (composite >= 65) { riskLevel = 0; riskLabel = "Safe"; if (reasons.length === 0) reasons.push("All metrics within acceptable range") }
  else if (composite >= 45) { riskLevel = 1; riskLabel = "Needs Attention" }
  else { riskLevel = 2; riskLabel = "High Risk" }

  const dominant = factors.length > 0 ? factors.sort((a, b) => b.severity - a.severity)[0].factor : "None"

  const base = (avgMarks + avgAssign) / 2
  const trend: number[] = []
  for (let i = 0; i < 6; i++) {
    let s: number
    if (riskLevel === 2) s = base + 15 - i * 5 + (Math.random() * 8 - 4)
    else if (riskLevel === 1) s = base + (Math.random() * 16 - 8) - i * 2
    else s = base + i * 1.5 + (Math.random() * 6 - 3)
    trend.push(Math.min(100, Math.max(0, Math.round(s))))
  }
  const decline = trend.length >= 3 && trend[trend.length - 1] < trend[0] - 5

  return { riskLevel, riskLabel, dominant, reasons, decline, trend, avgAtt: Math.round(avgAtt * 10) / 10, avgMarks: Math.round(avgMarks * 10) / 10, avgAssign: Math.round(avgAssign * 10) / 10 }
}

// ── Seed data (3 subjects: Math, Science, English) ─────────────────
const SEED_STUDENTS: { roll: string; name: string; subjects: SubjectEntry[] }[] = [
  { roll: "S001", name: "Alice Johnson", subjects: [{ name: "Math", attendance: 92, marks: 85, assignmentScore: 78 }, { name: "Science", attendance: 88, marks: 80, assignmentScore: 82 }, { name: "English", attendance: 95, marks: 90, assignmentScore: 85 }] },
  { roll: "S002", name: "Bob Smith", subjects: [{ name: "Math", attendance: 45, marks: 32, assignmentScore: 28 }, { name: "Science", attendance: 50, marks: 35, assignmentScore: 30 }, { name: "English", attendance: 40, marks: 28, assignmentScore: 25 }] },
  { roll: "S003", name: "Carol White", subjects: [{ name: "Math", attendance: 68, marks: 55, assignmentScore: 62 }, { name: "Science", attendance: 72, marks: 58, assignmentScore: 60 }, { name: "English", attendance: 65, marks: 50, assignmentScore: 55 }] },
  { roll: "S004", name: "David Brown", subjects: [{ name: "Math", attendance: 88, marks: 76, assignmentScore: 82 }, { name: "Science", attendance: 85, marks: 80, assignmentScore: 78 }, { name: "English", attendance: 90, marks: 72, assignmentScore: 80 }] },
  { roll: "S005", name: "Emily Davis", subjects: [{ name: "Math", attendance: 35, marks: 25, assignmentScore: 20 }, { name: "Science", attendance: 40, marks: 30, assignmentScore: 22 }, { name: "English", attendance: 30, marks: 20, assignmentScore: 18 }] },
  { roll: "S006", name: "Frank Miller", subjects: [{ name: "Math", attendance: 72, marks: 48, assignmentScore: 55 }, { name: "Science", attendance: 68, marks: 45, assignmentScore: 50 }, { name: "English", attendance: 75, marks: 52, assignmentScore: 58 }] },
  { roll: "S007", name: "Grace Wilson", subjects: [{ name: "Math", attendance: 95, marks: 91, assignmentScore: 88 }, { name: "Science", attendance: 92, marks: 88, assignmentScore: 90 }, { name: "English", attendance: 98, marks: 95, assignmentScore: 92 }] },
  { roll: "S008", name: "Henry Taylor", subjects: [{ name: "Math", attendance: 58, marks: 42, assignmentScore: 38 }, { name: "Science", attendance: 55, marks: 40, assignmentScore: 35 }, { name: "English", attendance: 60, marks: 45, assignmentScore: 42 }] },
  { roll: "S009", name: "Ivy Anderson", subjects: [{ name: "Math", attendance: 78, marks: 65, assignmentScore: 70 }, { name: "Science", attendance: 80, marks: 68, assignmentScore: 72 }, { name: "English", attendance: 75, marks: 60, assignmentScore: 65 }] },
  { roll: "S010", name: "Jack Thomas", subjects: [{ name: "Math", attendance: 42, marks: 30, assignmentScore: 35 }, { name: "Science", attendance: 45, marks: 32, assignmentScore: 30 }, { name: "English", attendance: 38, marks: 28, assignmentScore: 32 }] },
  { roll: "S011", name: "Katie Martinez", subjects: [{ name: "Math", attendance: 85, marks: 72, assignmentScore: 75 }, { name: "Science", attendance: 88, marks: 75, assignmentScore: 78 }, { name: "English", attendance: 82, marks: 68, assignmentScore: 70 }] },
  { roll: "S012", name: "Liam Garcia", subjects: [{ name: "Math", attendance: 62, marks: 50, assignmentScore: 45 }, { name: "Science", attendance: 58, marks: 48, assignmentScore: 42 }, { name: "English", attendance: 65, marks: 55, assignmentScore: 48 }] },
  { roll: "S013", name: "Mia Robinson", subjects: [{ name: "Math", attendance: 90, marks: 88, assignmentScore: 85 }, { name: "Science", attendance: 92, marks: 90, assignmentScore: 88 }, { name: "English", attendance: 88, marks: 85, assignmentScore: 82 }] },
  { roll: "S014", name: "Noah Clark", subjects: [{ name: "Math", attendance: 50, marks: 38, assignmentScore: 42 }, { name: "Science", attendance: 48, marks: 35, assignmentScore: 38 }, { name: "English", attendance: 52, marks: 40, assignmentScore: 45 }] },
  { roll: "S015", name: "Olivia Lewis", subjects: [{ name: "Math", attendance: 75, marks: 60, assignmentScore: 58 }, { name: "Science", attendance: 72, marks: 55, assignmentScore: 52 }, { name: "English", attendance: 78, marks: 65, assignmentScore: 62 }] },
  { roll: "S016", name: "Peter Hall", subjects: [{ name: "Math", attendance: 38, marks: 28, assignmentScore: 22 }, { name: "Science", attendance: 35, marks: 25, assignmentScore: 20 }, { name: "English", attendance: 40, marks: 30, assignmentScore: 25 }] },
  { roll: "S017", name: "Quinn Young", subjects: [{ name: "Math", attendance: 82, marks: 70, assignmentScore: 72 }, { name: "Science", attendance: 80, marks: 68, assignmentScore: 70 }, { name: "English", attendance: 85, marks: 75, assignmentScore: 78 }] },
  { roll: "S018", name: "Rachel King", subjects: [{ name: "Math", attendance: 55, marks: 45, assignmentScore: 40 }, { name: "Science", attendance: 52, marks: 42, assignmentScore: 38 }, { name: "English", attendance: 58, marks: 48, assignmentScore: 42 }] },
  { roll: "S019", name: "Sam Wright", subjects: [{ name: "Math", attendance: 93, marks: 82, assignmentScore: 80 }, { name: "Science", attendance: 90, marks: 85, assignmentScore: 82 }, { name: "English", attendance: 95, marks: 88, assignmentScore: 85 }] },
  { roll: "S020", name: "Tina Lopez", subjects: [{ name: "Math", attendance: 48, marks: 35, assignmentScore: 30 }, { name: "Science", attendance: 45, marks: 32, assignmentScore: 28 }, { name: "English", attendance: 50, marks: 38, assignmentScore: 32 }] },
]

class InMemoryDb {
  teachers: Map<string, TeacherRow> = new Map()
  students: Map<string, StudentRow> = new Map()
  remarks: RemarkRow[] = []
  responses: ResponseRow[] = []
  private remarkIdCounter = 1
  private responseIdCounter = 1

  constructor() {
    const now = new Date().toISOString()
    this.teachers.set("T001", { teacher_id: "T001", name: "Dr. Sharma", created_at: now })
    this.teachers.set("T002", { teacher_id: "T002", name: "Prof. Patel", created_at: now })
    this.teachers.set("T003", { teacher_id: "T003", name: "Dr. Gupta", created_at: now })

    for (const { roll, name, subjects } of SEED_STUDENTS) {
      const p = predictFromSubjects(subjects)
      this.students.set(roll, {
        roll_number: roll,
        name,
        subjects,
        overall_attendance: p.avgAtt,
        overall_marks: p.avgMarks,
        overall_assignment: p.avgAssign,
        risk_level: p.riskLevel,
        risk_label: p.riskLabel,
        dominant_risk_factor: p.dominant,
        risk_reasons: JSON.stringify(p.reasons),
        learning_decline: p.decline ? 1 : 0,
        trend_scores: JSON.stringify(p.trend),
        teacher_id: "T001",
        created_at: now,
      })
    }
  }

  getTeacher(id: string): TeacherRow | undefined { return this.teachers.get(id) }
  getStudent(roll: string): StudentRow | undefined { return this.students.get(roll) }
  upsertStudent(s: StudentRow): void { this.students.set(s.roll_number, s) }

  getStudentsByTeacher(teacherId: string): StudentRow[] {
    return Array.from(this.students.values())
      .filter((s) => s.teacher_id === teacherId)
      .sort((a, b) => b.risk_level !== a.risk_level ? b.risk_level - a.risk_level : a.name.localeCompare(b.name))
  }

  countStudentsByTeacher(id: string): number { return Array.from(this.students.values()).filter(s => s.teacher_id === id).length }
  countHighRiskByTeacher(id: string): number { return Array.from(this.students.values()).filter(s => s.teacher_id === id && s.risk_level === 2).length }

  addRemark(roll: string, teacherId: string, remark: string, rec: string): RemarkRow {
    const row: RemarkRow = { id: this.remarkIdCounter++, roll_number: roll, teacher_id: teacherId, remark, recommendation: rec, created_at: new Date().toISOString() }
    this.remarks.push(row)
    return row
  }

  getRemarksByStudent(roll: string, teacherId?: string): (RemarkRow & { teacher_name: string })[] {
    return this.remarks
      .filter(r => r.roll_number === roll && (!teacherId || r.teacher_id === teacherId))
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map(r => ({ ...r, teacher_name: this.teachers.get(r.teacher_id)?.name ?? "Unknown" }))
  }

  hasRemarkForStudent(roll: string, teacherId: string): boolean { return this.remarks.some(r => r.roll_number === roll && r.teacher_id === teacherId) }
  getStudentsWithRemarksByTeacher(teacherId: string): string[] { return [...new Set(this.remarks.filter(r => r.teacher_id === teacherId).map(r => r.roll_number))] }

  addResponse(roll: string, reason: string, explanation: string): ResponseRow {
    const row: ResponseRow = { id: this.responseIdCounter++, roll_number: roll, reason, explanation, created_at: new Date().toISOString() }
    this.responses.push(row)
    return row
  }

  getLatestResponse(roll: string): ResponseRow | undefined {
    return [...this.responses].filter(r => r.roll_number === roll).sort((a, b) => b.created_at.localeCompare(a.created_at))[0]
  }

  hasResponse(roll: string): boolean { return this.responses.some(r => r.roll_number === roll) }

  countPendingResponses(teacherId: string): number {
    const withRemarks = this.getStudentsWithRemarksByTeacher(teacherId)
    return withRemarks.filter(roll => !this.hasResponse(roll)).length
  }
}

const globalForDb = globalThis as typeof globalThis & { __riskDb?: InMemoryDb }
export function getDb(): InMemoryDb {
  if (!globalForDb.__riskDb) globalForDb.__riskDb = new InMemoryDb()
  return globalForDb.__riskDb
}

export { predictFromSubjects }
