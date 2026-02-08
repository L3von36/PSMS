"use server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const ExamSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    subjectId: z.string().min(1, "Subject is required"),
})

const QuestionSchema = z.object({
    examId: z.string().min(1, "Exam is required"),
    text: z.string().min(5, "Question text must be at least 5 characters"),
    type: z.enum(["ShortAnswer", "MultipleChoice", "TrueFalse"]),
    answer: z.string().min(1, "Correct answer is required"),
    options: z.string().optional(), // JSON string for MC items
})

import { auth } from "@/lib/auth"

export async function getExamData() {
    try {
        const session = await auth()
        if (!session?.user) return { exams: [], subjects: [], questions: [] }

        const role = session.user.role
        const userId = session.user.id

        // Admin/Director/Unit Leader (God-view)
        if (['ADMIN', 'DIRECTOR', 'UNIT_LEADER'].includes(role)) {
            const exams = await prisma.exam.findMany({
                include: { subject: true, questions: true },
                orderBy: { createdAt: 'desc' }
            })
            const subjects = await prisma.subject.findMany({
                orderBy: { name: 'asc' }
            })
            const questions = await prisma.question.findMany()

            return { exams, subjects, questions }
        }

        // Teachers see only their assigned subjects and exams
        if (role === 'TEACHER') {
            const staff = await prisma.staff.findUnique({
                where: { userId },
                include: { assignments: { include: { subject: true } } }
            })

            if (!staff || staff.assignments.length === 0) {
                return { exams: [], subjects: [], questions: [] }
            }

            const subjectIds = Array.from(new Set(staff.assignments.map(a => a.subjectId).filter(Boolean))) as string[]

            const exams = await prisma.exam.findMany({
                where: { subjectId: { in: subjectIds } },
                include: { subject: true, questions: true },
                orderBy: { createdAt: 'desc' }
            })

            const subjects = await prisma.subject.findMany({
                where: { id: { in: subjectIds } },
                orderBy: { name: 'asc' }
            })

            const questions = await prisma.question.findMany({
                where: { exam: { subjectId: { in: subjectIds } } }
            })

            return { exams, subjects, questions }
        }

        return { exams: [], subjects: [], questions: [] }
    } catch (error) {
        console.error("Exam data fetch failed:", error)
        return { exams: [], subjects: [], questions: [] }
    }
}

export async function createExam(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session?.user) return { success: false, message: "Unauthorized" }

    const validatedFields = ExamSchema.safeParse({
        title: formData.get("title"),
        subjectId: formData.get("subjectId"),
    })

    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Validation failed"
        }
    }

    // Permission check for Teachers
    if (session.user.role === 'TEACHER') {
        const staff = await prisma.staff.findUnique({
            where: { userId: session.user.id },
            include: { assignments: true }
        })

        const isAssigned = staff?.assignments.some(a => a.subjectId === validatedFields.data.subjectId)
        if (!isAssigned) {
            return { success: false, message: "You are not assigned to this subject" }
        }
    }

    try {
        await prisma.exam.create({
            data: validatedFields.data
        })
        revalidatePath("/dashboard/exams")
        return { success: true, message: "Exam repository created successfully" }
    } catch (e) {
        return { success: false, message: "Failed to create exam" }
    }
}

export async function addQuestion(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session?.user) return { success: false, message: "Unauthorized" }

    const validatedFields = QuestionSchema.safeParse({
        examId: formData.get("examId"),
        text: formData.get("text"),
        type: formData.get("type"),
        answer: formData.get("answer"),
        options: formData.get("options") || undefined,
    })

    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Validation failed"
        }
    }

    // Permission check for Teachers - ensure they own the exam
    if (session.user.role === 'TEACHER') {
        const exam = await prisma.exam.findUnique({
            where: { id: validatedFields.data.examId },
            include: { subject: true }
        })

        if (!exam) {
            return { success: false, message: "Exam not found" }
        }

        const staff = await prisma.staff.findUnique({
            where: { userId: session.user.id },
            include: { assignments: true }
        })

        const isAssigned = staff?.assignments.some(a => a.subjectId === exam.subjectId)
        if (!isAssigned) {
            return { success: false, message: "You are not assigned to this exam's subject" }
        }
    }

    try {
        await prisma.question.create({
            data: validatedFields.data
        })
        revalidatePath("/dashboard/exams")
        return { success: true, message: "Question added successfully" }
    } catch (e) {
        return { success: false, message: "Failed to add question" }
    }
}
