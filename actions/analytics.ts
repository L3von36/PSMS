'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export type AtRiskStudent = {
    id: string
    name: string
    grade: string
    section: string
    reason: string // "Low Attendance" | "Failing Grades" | "Both"
    metric: string // "45% Avg" or "70% Attendance"
    severity: "HIGH" | "MEDIUM"
}

export async function getAtRiskStudents(): Promise<AtRiskStudent[]> {
    const session = await auth()
    if (!session?.user?.email) return []

    // 1. Get students for this teacher (Reusing logic or simplifying for demo)
    // For MVP, let takes all students in the teacher's SECTIONs
    const teacher = await prisma.staff.findFirst({
        where: { user: { email: session.user.email } },
        include: { assignments: true }
    })

    if (!teacher) return []

    // Get all students in assigned sections
    const sections = teacher.assignments.map(a => ({ grade: a.grade, section: a.section }))

    // Fetch students + grades + attendance
    // This is a "heavy" query, in production we'd optimize or use aggregation
    const students = await prisma.student.findMany({
        where: {
            OR: sections.map(s => ({ grade: s.grade, section: s.section }))
        },
        include: {
            grades: true,
            attendances: true
        }
    })

    const atRisk: AtRiskStudent[] = []
    const last7Days = new Date()
    last7Days.setDate(last7Days.getDate() - 7)

    for (const s of students) {
        // AI Logic 1: Check Weekly Patterns (Proactive)
        const recentAbsences = s.attendances.filter(a =>
            a.status === 'ABSENT' && new Date(a.date) >= last7Days
        ).length

        if (recentAbsences >= 3) {
            atRisk.push({
                id: s.id,
                name: `${s.firstName} ${s.lastName}`,
                grade: s.grade,
                section: s.section || "",
                reason: "Frequent Absence",
                metric: `${recentAbsences} abs. this week`,
                severity: "HIGH"
            })
            continue
        }

        // AI Logic 2: Check Long-term Attendance
        const totalDays = s.attendances.length
        const absentDays = s.attendances.filter(a => a.status === 'ABSENT').length
        const attendanceRate = totalDays > 0 ? ((totalDays - absentDays) / totalDays) * 100 : 100

        // AI Logic 3: Check Grades
        const grades = s.grades.map(g => g.score)
        const avgGrade = grades.length > 0 ? grades.reduce((a, b) => a + b, 0) / grades.length : 100

        if (attendanceRate < 80) {
            atRisk.push({
                id: s.id,
                name: `${s.firstName} ${s.lastName}`,
                grade: s.grade,
                section: s.section || "",
                reason: "Low Attendance",
                metric: `${attendanceRate.toFixed(1)}% Total`,
                severity: attendanceRate < 70 ? "HIGH" : "MEDIUM"
            })
            continue
        }

        if (avgGrade < 50) {
            atRisk.push({
                id: s.id,
                name: `${s.firstName} ${s.lastName}`,
                grade: s.grade,
                section: s.section || "",
                reason: "Failing Grades",
                metric: `${avgGrade.toFixed(1)}% Avg`,
                severity: avgGrade < 40 ? "HIGH" : "MEDIUM"
            })
        }
    }

    // Sort by severity (HIGH first)
    return atRisk.sort((a, b) => (a.severity === 'HIGH' ? -1 : 1))
}
