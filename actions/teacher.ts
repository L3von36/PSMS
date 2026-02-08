'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { sendTelegramMessage } from "@/lib/telegram"

// --- Data Fetching ---

export async function getTeacherClasses() {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    // Find the staff record linked to this user
    const teacher = await prisma.staff.findFirst({
        where: { user: { email: session.user.email } },
        include: {
            assignments: {
                include: {
                    subject: true
                }
            }
        }
    })

    if (!teacher) return []

    // Group by Grade/Section
    // { grade: "10", section: "A", subject: "Math", studentCount: 123 }
    return teacher.assignments.map(a => ({
        id: a.id,
        grade: a.grade,
        section: a.section,
        subject: a.subject?.name || "Homeroom",
        subjectId: a.subjectId,
        // We would need to count students in this section.
        // For MVP, we'll fetch that separately or just return the metadata
    }))
}

export async function getClassRoster(grade: string, section: string) {
    // Basic security check: ensure teacher is assigned to this class? 
    // For now, allow logged in staff to view rosters.
    const students = await prisma.student.findMany({
        where: { grade, section },
        orderBy: { firstName: 'asc' },
        include: {
            attendances: {
                where: {
                    date: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0)) // Today
                    }
                }
            }
        }
    })
    return students
}

// --- Attendance Actions ---

export async function markAttendance(data: {
    studentId: string,
    status: string, // PRESENT, ABSENT, LATE, EXCUSED
    date: Date,
    subjectId?: string,
    period?: number,
    remarks?: string
}) {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized")

    // Upsert attendance record for today
    const startOfDay = new Date(data.date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(data.date)
    endOfDay.setHours(23, 59, 59, 999)

    // Check if record exists for this student on this day/subject/period
    const query: any = {
        studentId: data.studentId,
        date: {
            gte: startOfDay,
            lte: endOfDay
        }
    }

    // For primary schools, they might not use subjectId. 
    // For secondary, we want subject-specific records.
    if (data.subjectId) query.subjectId = data.subjectId
    if (data.period) query.period = data.period

    const existing = await prisma.attendance.findFirst({
        where: query
    })

    if (existing) {
        return await prisma.attendance.update({
            where: { id: existing.id },
            data: {
                status: data.status,
                date: data.date,
                remarks: data.remarks,
                subjectId: data.subjectId,
                period: data.period
            }
        })
    } else {
        return await prisma.attendance.create({
            data: {
                studentId: data.studentId,
                status: data.status,
                date: data.date,
                remarks: data.remarks,
                subjectId: data.subjectId,
                period: data.period
            }
        })
    }
}

export async function bulkMarkAttendance(
    records: { studentId: string, status: string, remarks?: string }[],
    date: Date,
    subjectId?: string,
    period?: number
) {
    for (const r of records) {
        await markAttendance({ ...r, date, subjectId, period })
    }
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/attendance/history')
    return { success: true }
}

export async function getAttendanceHistory(grade?: string, section?: string, date?: Date, subjectId?: string) {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized")

    const query: any = {}

    // RBAC Logic
    const isPowerUser = ['ADMIN', 'DIRECTOR', 'REGISTRAR'].includes(session.user.role as string)
    if (!isPowerUser) {
        const teacher = await prisma.staff.findFirst({
            where: { user: { email: session.user.email } },
            include: { assignments: true }
        })

        if (!teacher || teacher.assignments.length === 0) return []

        const assignmentConditions = teacher.assignments.map(a => {
            // If this is a grade/section wide assignment (homeroom), no subject filter
            // If it's subject specific, filter by that subject too
            const cond: any = {
                student: { grade: a.grade, section: a.section }
            }
            if (a.subjectId) cond.subjectId = a.subjectId
            return cond
        })
        query.OR = assignmentConditions
    }

    // Apply explicit filters if provided (must still be within RBAC bounds)
    if (grade && grade !== 'ALL') {
        query.student = { ...query.student, grade }
    }
    if (section && section !== 'ALL') {
        query.student = { ...query.student, section }
    }
    if (subjectId && subjectId !== 'ALL') {
        query.subjectId = subjectId
    }

    if (date) {
        const start = new Date(date)
        start.setHours(0, 0, 0, 0)
        const end = new Date(date)
        end.setHours(23, 59, 59, 999)
        query.date = { gte: start, lte: end }
    }

    return await prisma.attendance.findMany({
        where: query,
        include: {
            student: true,
            subject: true
        },
        orderBy: {
            date: 'desc'
        }
    })
}

export async function getMonthlyAttendance(year: number, month: number, grade?: string, section?: string, subjectId?: string) {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized")

    // month is 0-indexed (0 = Jan, 11 = Dec)
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999)

    const query: any = {
        date: {
            gte: startDate,
            lte: endDate
        }
    }

    // RBAC Logic
    const isPowerUser = ['ADMIN', 'DIRECTOR', 'REGISTRAR'].includes(session.user.role as string)
    if (!isPowerUser) {
        const teacher = await prisma.staff.findFirst({
            where: { user: { email: session.user.email } },
            include: { assignments: true }
        })

        if (!teacher || teacher.assignments.length === 0) return []

        const assignmentConditions = teacher.assignments.map(a => {
            const cond: any = {
                student: { grade: a.grade, section: a.section }
            }
            if (a.subjectId) cond.subjectId = a.subjectId
            return cond
        })
        query.AND = [
            { date: query.date },
            { OR: assignmentConditions }
        ]
        // Remove the top level date since it's now in AND
        delete query.date
    }

    // Explicit Filter Overrides
    if (grade && grade !== 'ALL') {
        if (!query.student) query.student = {}
        query.student.grade = grade
    }
    if (section && section !== 'ALL') {
        if (!query.student) query.student = {}
        query.student.section = section
    }
    if (subjectId && subjectId !== 'ALL') {
        query.subjectId = subjectId
    }

    return await prisma.attendance.findMany({
        where: query,
        include: {
            student: true,
            subject: true
        },
        orderBy: {
            date: 'asc'
        }
    })
}

export async function getTeacherSubjectsForClass(grade: string, section: string) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    const teacher = await prisma.staff.findFirst({
        where: { user: { email: session.user.email } },
        include: {
            assignments: {
                where: { grade, section },
                include: { subject: true }
            }
        }
    })

    if (!teacher) return []

    // Deduplicate subjects
    const subjectsMap = new Map()
    teacher.assignments.forEach(a => {
        if (a.subject) {
            subjectsMap.set(a.subject.id, a.subject)
        }
    })

    return Array.from(subjectsMap.values())
}

export async function getTeacherAssignments() {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    const teacher = await prisma.staff.findFirst({
        where: { user: { email: session.user.email } },
        include: {
            assignments: {
                include: { subject: true }
            }
        }
    })

    if (!teacher) return []
    return teacher.assignments
}

export async function notifyParentOfAbsence(studentId: string, status: string) {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized")

    const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: { parents: true }
    })

    if (!student || student.parents.length === 0) {
        return { success: false, error: "Student or parents not found" }
    }

    // Attempt to notify all parents linked to the student who have Telegram
    let sentCount = 0
    for (const parent of student.parents) {
        if (parent.telegramChatId) {
            const message = `🔔 *Attendance Alert*\n\nStudent: *${student.firstName} ${student.lastName}*\nStatus: *${status}*\nDate: ${new Date().toLocaleDateString()}\n\nPlease contact the school if you have any questions.`
            await sendTelegramMessage(parent.telegramChatId, message)
            sentCount++
        }
    }

    if (sentCount === 0) {
        return { success: false, error: "No parents have linked Telegram accounts." }
    }

    return { success: true, count: sentCount }
}

export async function getTeacherSchedule() {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    const teacher = await prisma.staff.findFirst({
        where: { user: { email: session.user.email } },
        include: {
            timetables: {
                include: { subject: true },
                orderBy: { startTime: 'asc' }
            }
        }
    })

    if (!teacher) return []

    // Map to normalized schedule objects
    return teacher.timetables.map(t => ({
        id: t.id,
        subject: t.subject.name,
        grade: t.grade,
        section: t.section,
        startTime: t.startTime,
        endTime: t.endTime,
        period: t.period,
        room: t.room || "Main Hall",
        dayOfWeek: t.dayOfWeek
    }))
}

// Temporary seed for schedule if none exists
export async function seedTeacherSchedule() {
    const session = await auth()
    if (!session?.user?.email) return

    const teacher = await prisma.staff.findFirst({
        where: { user: { email: session.user.email } },
        include: { assignments: true, timetables: true }
    })

    if (!teacher || teacher.timetables.length > 0) return
    if (teacher.assignments.length === 0) return

    const today = new Date().getDay() || 7 // 1-7
    const schedules = [
        { period: 1, start: "08:00", end: "08:45" },
        { period: 2, start: "08:50", end: "09:35" },
        { period: 3, start: "09:40", end: "10:25" },
        { period: 4, start: "10:45", end: "11:30" },
    ]

    for (let i = 0; i < teacher.assignments.length; i++) {
        const a = teacher.assignments[i]
        const s = schedules[i % schedules.length]

        await prisma.timetable.create({
            data: {
                staffId: teacher.id,
                subjectId: a.subjectId || "",
                grade: a.grade,
                section: a.section,
                period: s.period,
                startTime: s.start,
                endTime: s.end,
                dayOfWeek: today,
                room: `Room ${100 + i}`
            }
        })
    }
}
