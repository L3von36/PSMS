"use server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { writeFile } from "fs/promises"
import { join } from "path"

const StudentSchema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    grade: z.string().min(1, "Grade is required"),
    section: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional(),
    photoUrl: z.string().optional(),
    status: z.string().optional(),
    enrollmentHistory: z.string().optional(),
    isNationalExamCandidate: z.boolean().default(false),
    nationalExamId: z.string().optional(),
    nationalExamResult: z.number().optional().nullable(),
})

export async function createStudent(prevState: any, formData: FormData) {
    const data = {
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        grade: formData.get("grade"),
        section: formData.get("section"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        photoUrl: formData.get("photoUrl"),
        status: formData.get("status") || "New",
        enrollmentHistory: formData.get("enrollmentHistory"),
        isNationalExamCandidate: formData.get("isNationalExamCandidate") === "on",
        nationalExamId: formData.get("nationalExamId"),
        nationalExamResult: formData.get("nationalExamResult") ? parseFloat(formData.get("nationalExamResult") as string) : null,
    }

    const validatedFields = StudentSchema.safeParse(data)

    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Validation failed"
        }
    }

    try {
        await prisma.student.create({
            data: validatedFields.data
        })
        revalidatePath("/dashboard/students")
        return { success: true, message: "Student created successfully" }
    } catch (error) {
        console.error("Failed to create student:", error)
        return { success: false, message: "Failed to create student in database" }
    }
}

export async function bulkCreateStudents(students: any[]) {
    try {
        // Simple validation for each student
        const validStudents = students.filter(s => s.firstName && s.lastName && s.grade)

        if (validStudents.length === 0) {
            return { success: false, message: "No valid students found in file" }
        }

        await prisma.student.createMany({
            data: validStudents.map(s => ({
                firstName: s.firstName,
                lastName: s.lastName,
                grade: String(s.grade),
                section: s.section ? String(s.section) : null,
                email: s.email || null,
                phone: s.phone || null,
            }))
        })

        revalidatePath("/dashboard/students")
        return { success: true, message: `Successfully imported ${validStudents.length} students` }
    } catch (error) {
        console.error("Bulk import failed:", error)
        return { success: false, message: "Bulk import failed" }
    }
}

export async function uploadStudentPhoto(formData: FormData) {
    const file = formData.get("photo") as File
    if (!file) {
        return { success: false, message: "No file uploaded" }
    }

    try {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const filename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`
        const path = join(process.cwd(), "public", "uploads", "students", filename)

        await writeFile(path, buffer)

        return {
            success: true,
            photoUrl: `/uploads/students/${filename}`,
            message: "Photo uploaded successfully"
        }
    } catch (error) {
        console.error("Photo upload failed:", error)
        return { success: false, message: "Failed to save photo" }
    }
}

import { auth } from "@/lib/auth"

export async function getStudents() {
    try {
        const session = await auth()
        if (!session?.user) return { success: false, message: "Unauthorized" }

        const role = session.user.role
        const userId = session.user.id

        // Admin/Director/Registrar can see all students
        if (['ADMIN', 'DIRECTOR', 'REGISTRAR'].includes(role)) {
            const students = await prisma.student.findMany({
                orderBy: { createdAt: 'desc' }
            })
            return { success: true, students }
        }

        // Teachers and Unit Leaders see only their assigned students
        if (['TEACHER', 'UNIT_LEADER'].includes(role)) {
            // Find staff record for this user
            const staff = await prisma.staff.findUnique({
                where: { userId },
                include: { assignments: true }
            })

            if (!staff || staff.assignments.length === 0) {
                return { success: true, students: [] }
            }

            // Extract assigned grades and sections
            const conditions = (staff as any).assignments.map((a: any) => ({
                grade: a.grade,
                section: a.section
            }))

            const students = await prisma.student.findMany({
                where: {
                    OR: conditions as any
                },
                orderBy: { createdAt: 'desc' }
            })

            return { success: true, students }
        }

        // Students/Parents see only themselves (this would usually be filtered further in specific views)
        return { success: true, students: [] }

    } catch (error) {
        console.error("Failed to fetch students:", error)
        return { success: false, message: "Failed to fetch students" }
    }
}
