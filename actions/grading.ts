"use server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const SubjectSchema = z.object({
    name: z.string().min(2, "Subject name must be at least 2 characters"),
    gradeLevel: z.string().min(1, "Grade level is required"),
})

const GradeSchema = z.object({
    studentId: z.string().min(1, "Student is required"),
    subjectId: z.string().min(1, "Subject is required"),
    score: z.number().min(0, "Score must be at least 0"),
    outOf: z.number().min(1, "Total marks must be at least 1").default(100),
    category: z.string().min(1, "Category is required"),
    term: z.string().min(1, "Term is required"),
    academicYear: z.string().default("2017 E.C."),
}).refine(data => data.score <= data.outOf, {
    message: "Score cannot exceed total marks",
    path: ["score"]
})

import { calculateEthiopianLetter } from "@/lib/utils"

export async function createSubject(prevState: any, formData: FormData) {
    const validatedFields = SubjectSchema.safeParse({
        name: formData.get("name"),
        gradeLevel: formData.get("gradeLevel"),
    })

    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Validation failed"
        }
    }

    try {
        await prisma.subject.create({
            data: validatedFields.data
        })
        revalidatePath("/dashboard/grades")
        return { success: true, message: "Subject created successfully" }
    } catch (e) {
        return { success: false, message: "Failed to create subject" }
    }
}

import { auth } from "@/lib/auth"

export async function getGradingData() {
    try {
        const session = await auth()
        if (!session?.user) return { subjects: [], recentGrades: [], students: [] }

        const role = session.user.role
        const userId = session.user.id

        // Admin/Director/Registrar/Unit Leader (Power Users)
        const isPowerUser = ['ADMIN', 'DIRECTOR', 'REGISTRAR', 'UNIT_LEADER'].includes(role as string)
        if (isPowerUser) {
            const subjects = await prisma.subject.findMany({
                orderBy: { gradeLevel: 'asc' }
            })
            const recentGrades = await prisma.grade.findMany({
                take: 50,
                orderBy: { createdAt: 'desc' },
                include: { student: true, subject: true }
            })
            const students = await prisma.student.findMany({
                orderBy: { firstName: 'asc' }
            })
            return { subjects, recentGrades, students }
        }

        // Teachers (Standard & Homeroom)
        if (role === 'TEACHER') {
            const staff = await prisma.staff.findUnique({
                where: { userId },
                include: { assignments: { include: { subject: true } } }
            })

            if (!staff || staff.assignments.length === 0) {
                return { subjects: [], recentGrades: [], students: [] }
            }

            // Identify subjects and classes visibility
            const subjectIds = Array.from(new Set(staff.assignments.map(a => a.subjectId).filter(Boolean))) as string[]
            const classConditions = staff.assignments.map(a => ({
                grade: a.grade,
                section: a.section
            }))

            const subjects = await prisma.subject.findMany({
                where: {
                    OR: [
                        { id: { in: subjectIds } },
                        // For Homeroom teachers, they might want to see all subjects in their section
                        // But for primary "subject" list, we show what they teach + what they are homeroom for if applicable
                        { assignments: { some: { staff: { userId } } } }
                    ]
                },
                orderBy: { gradeLevel: 'asc' }
            })

            const students = await prisma.student.findMany({
                where: { OR: classConditions },
                orderBy: { firstName: 'asc' }
            })

            const recentGrades = await prisma.grade.findMany({
                where: {
                    OR: staff.assignments.map(a => {
                        const cond: any = {
                            student: { grade: a.grade, section: a.section }
                        }
                        if (a.subjectId) cond.subjectId = a.subjectId
                        return cond
                    })
                },
                take: 50,
                orderBy: { createdAt: 'desc' },
                include: { student: true, subject: true }
            })

            return { subjects, recentGrades, students }
        }

        return { subjects: [], recentGrades: [], students: [] }
    } catch (error) {
        console.error("Grading data fetch failed:", error)
        return { subjects: [], recentGrades: [], students: [] }
    }
}

export async function bulkRecordGrades(data: {
    grades: { studentId: string, score: number }[],
    subjectId: string,
    category: string,
    outOf: number,
    term: string,
    academicYear?: string
}) {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized")

    // Permission Check
    if (session.user.role === 'TEACHER') {
        const staff = await prisma.staff.findFirst({
            where: { user: { email: session.user.email } },
            include: { assignments: true }
        })

        if (!staff) throw new Error("Teacher profile not found")

        // Verify that for EACH student, the teacher is authorized
        for (const record of data.grades) {
            const student = await prisma.student.findUnique({ where: { id: record.studentId } })
            if (!student) continue

            const isAuthorized = staff.assignments.some(a =>
                (a.subjectId === data.subjectId || a.subjectId === null) && // Match subject OR homeroom
                a.grade === student.grade &&
                a.section === student.section
            )

            if (!isAuthorized) {
                throw new Error(`Unauthorized to record grades for student ${student.firstName} in this subject`)
            }
        }
    }

    try {
        await prisma.$transaction(
            data.grades.map(g =>
                prisma.grade.create({
                    data: {
                        studentId: g.studentId,
                        subjectId: data.subjectId,
                        score: g.score,
                        outOf: data.outOf || 100,
                        category: data.category,
                        term: data.term,
                        academicYear: data.academicYear || "2017 E.C."
                    }
                })
            )
        )

        revalidatePath("/dashboard/grades")
        return { success: true, message: `Successfully recorded ${data.grades.length} grades` }
    } catch (error) {
        console.error("Bulk grade recording failed:", error)
        return { success: false, message: "Failed to record grades bulk." }
    }
}

export async function recordGrade(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session?.user) return { success: false, message: "Unauthorized" }

    let category = formData.get("category") as string
    if (category === "Other") {
        category = formData.get("customCategory") as string
    }

    const validatedFields = GradeSchema.safeParse({
        studentId: formData.get("studentId"),
        subjectId: formData.get("subjectId"),
        score: parseFloat(formData.get("score") as string),
        outOf: parseFloat(formData.get("outOf") as string || "100"),
        category: category,
        term: formData.get("term"),
        academicYear: formData.get("academicYear") || "2017 E.C.",
    })

    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Validation failed"
        }
    }

    // Permission Verification for Teachers
    if (session.user.role === 'TEACHER') {
        const staff = await prisma.staff.findFirst({
            where: { user: { email: session.user.email } },
            include: { assignments: true }
        })

        const student = await prisma.student.findUnique({
            where: { id: validatedFields.data.studentId }
        })

        const isAuthorized = staff?.assignments.some((a: any) =>
            (a.subjectId === validatedFields.data.subjectId || a.subjectId === null) &&
            a.grade === student?.grade &&
            a.section === student?.section
        )

        if (!isAuthorized) {
            return { success: false, message: "You are not assigned to this class and subject" }
        }
    }

    try {
        await prisma.grade.create({
            data: {
                studentId: validatedFields.data.studentId,
                subjectId: validatedFields.data.subjectId,
                score: validatedFields.data.score,
                outOf: validatedFields.data.outOf,
                category: validatedFields.data.category,
                term: validatedFields.data.term,
                academicYear: validatedFields.data.academicYear,
            }
        })
        revalidatePath("/dashboard/grades")
        return { success: true, message: "Grade recorded successfully" }
    } catch (e) {
        return { success: false, message: "Failed to record grade" }
    }
}
