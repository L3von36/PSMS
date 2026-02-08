"use server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { Role } from "@/lib/generated-prisma"

export async function getStaffMembers() {
    try {
        const session = await auth()
        const schoolId = (session?.user as any)?.schoolId
        if (!schoolId || !['ADMIN', 'DIRECTOR', 'UNIT_LEADER'].includes(session?.user?.role || '')) {
            return { success: false, message: "Unauthorized" }
        }

        const staff = await prisma.staff.findMany({
            where: { schoolId },
            include: {
                assignments: {
                    include: { subject: true }
                },
                user: true
            },
            orderBy: { firstName: 'asc' }
        })
        return { success: true, staff }
    } catch (error) {
        console.error("Failed to fetch staff:", error)
        return { success: false, message: "Failed to fetch staff" }
    }
}

export async function assignTeacher(staffId: string, grade: string, section: string, subjectId?: string) {
    try {
        const session = await auth()
        if (!['ADMIN', 'DIRECTOR', 'UNIT_LEADER'].includes(session?.user?.role || '')) {
            return { success: false, message: "Unauthorized" }
        }

        const schoolId = (session?.user as any)?.schoolId
        await prisma.teacherAssignment.create({
            data: {
                staffId,
                grade,
                section,
                subjectId: (subjectId === 'null' || !subjectId) ? null : subjectId,
                schoolId: schoolId
            }
        })

        revalidatePath("/dashboard/staff")
        revalidatePath("/dashboard/students")
        revalidatePath("/dashboard/grades")

        return { success: true, message: "Assignment created successfully" }
    } catch (error) {
        console.error("Failed to create assignment:", error)
        return { success: false, message: "Failed to create assignment" }
    }
}

export async function removeAssignment(assignmentId: string) {
    try {
        const session = await auth()
        if (!['ADMIN', 'DIRECTOR', 'UNIT_LEADER'].includes(session?.user?.role || '')) {
            return { success: false, message: "Unauthorized" }
        }

        await prisma.teacherAssignment.delete({
            where: { id: assignmentId }
        })

        revalidatePath("/dashboard/staff")
        return { success: true, message: "Assignment removed successfully" }
    } catch (error) {
        return { success: false, message: "Failed to remove assignment" }
    }
}
