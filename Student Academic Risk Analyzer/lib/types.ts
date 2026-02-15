export interface SubjectData {
  attendance: number
  marks: number
  assignmentScore: number
}

export interface StudentInput {
  RollNumber?: string
  Name: string
  subjects: Record<string, SubjectData>
}

export type RiskLevel = 0 | 1 | 2

export interface SubjectResult {
  name: string
  attendance: number
  marks: number
  assignmentScore: number
  composite: number
  riskLabel: "Safe" | "Needs Attention" | "High Risk"
}

export interface StudentResult {
  rollNumber: string
  name: string
  subjects: SubjectResult[]
  overallAttendance: number
  overallMarks: number
  overallAssignment: number
  riskLevel: RiskLevel
  riskLabel: "Safe" | "Needs Attention" | "High Risk"
  dominantRiskFactor: string
  riskReasons: string[]
  learningDecline: boolean
  trendScores: number[]
}

export interface PredictionResponse {
  students: StudentResult[]
  summary: {
    total: number
    safe: number
    needsAttention: number
    highRisk: number
    averageAttendance: number
    averageMarks: number
    averageAssignment: number
    dominantProblem: string
    subjects: string[]
  }
}

export interface Remark {
  id: number
  rollNumber: string
  teacherId: string
  remark: string
  recommendation: string
  createdAt: string
}

export interface StudentResponse {
  id: number
  rollNumber: string
  reason: string
  explanation: string
  createdAt: string
}

export interface TeacherDashboardData {
  totalStudents: number
  highRiskStudents: number
  pendingResponses: number
  teacherName: string
}
