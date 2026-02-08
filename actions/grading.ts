"use server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/lib/auth"

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

export async function createSubject(prevState: any, formData: FormData) {
    const session = await auth()
    const schoolId = (session?.user as any)?.schoolId
    if (!schoolId) return { success: false, message: "Unauthorized" }

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
            data: {
                ...validatedFields.data,
                schoolId: schoolId
            }
        })
        revalidatePath("/dashboard/grades")
        return { success: true, message: "Subject created successfully" }
    } catch (e) {
        return { success: false, message: "Failed to create subject" }
    }
}

export async function getGradingData() {
    try {
        const session = await auth()
        if (!session?.user) return { subjects: [], recentGrades: [], students: [] }
        const schoolId = (session.user as any).schoolId
        if (!schoolId) return { subjects: [], recentGrades: [], students: [] }

        const role = session.user.role
        const userId = session.user.id

        // Admin/Director/Registrar/Unit Leader (Power Users)
        const isPowerUser = ['ADMIN', 'DIRECTOR', 'REGISTRAR', 'UNIT_LEADER'].includes(role as string)
        if (isPowerUser) {
            const subjects = await prisma.subject.findMany({
                where: { schoolId },
                orderBy: { gradeLevel: 'asc' }
            })
            const recentGrades = await prisma.grade.findMany({
                where: { schoolId },
                take: 50,
                orderBy: { createdAt: 'desc' },
                include: { student: true, subject: true }
            })
            const students = await prisma.student.findMany({
                where: { schoolId },
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
                    schoolId,
                    OR: [
                        { id: { in: subjectIds } },
                        { assignments: { some: { staff: { userId } } } }
                    ]
                },
                orderBy: { gradeLevel: 'asc' }
            })

            const students = await prisma.student.findMany({
                where: { schoolId, OR: classConditions },
                orderBy: { firstName: 'asc' }
            })

            const recentGrades = await prisma.grade.findMany({
                where: {
                    schoolId,
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
    const schoolId = (session.user as any).schoolId

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
                        academicYear: data.academicYear || "2017 E.C.",
                        schoolId: schoolId
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
                schoolId: (session.user as any).schoolId
            }
        })
        revalidatePath("/dashboard/grades")
        return { success: true, message: "Grade recorded successfully" }
    } catch (e) {
        return { success: false, message: "Failed to record grade" }
    }
}
