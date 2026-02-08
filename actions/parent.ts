"use server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/lib/auth"

const ParentSchema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    phone: z.string().min(10, "Phone number is required"),
    secondaryPhone: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
    whatsapp: z.string().optional(),
    telegram: z.string().optional(),
    occupation: z.string().optional(),
    employer: z.string().optional(),
    nationalId: z.string().optional(),
    isEmergencyContact: z.boolean().optional(),
    address: z.string().optional(),
    studentIds: z.array(z.string()).optional(),
})

export async function getParentData() {
    try {
        const session = await auth()
        if (!session?.user) return { parents: [], students: [], communications: [] }
        const schoolId = (session.user as any).schoolId
        if (!schoolId) return { parents: [], students: [], communications: [] }

        const role = session.user.role

        if (!['ADMIN', 'DIRECTOR', 'REGISTRAR'].includes(role)) {
            return { parents: [], students: [], communications: [] }
        }

        const parents = await prisma.parent.findMany({
            where: { schoolId },
            include: {
                students: true,
                communications: {
                    orderBy: { sentAt: 'desc' },
                    take: 5
                },
                _count: {
                    select: { students: true, communications: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        const students = await prisma.student.findMany({
            where: { schoolId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                grade: true,
                section: true
            },
            orderBy: { firstName: 'asc' }
        })

        const communications = await prisma.communication.findMany({
            where: { schoolId },
            include: { parent: true },
            orderBy: { sentAt: 'desc' },
            take: 50
        })

        return { parents, students, communications }
    } catch (error) {
        console.error("Parent data fetch failed:", error)
        return { parents: [], students: [], communications: [] }
    }
}

export async function createParent(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session?.user) return { success: false, message: "Unauthorized" }
    const schoolId = (session.user as any).schoolId

    if (!['ADMIN', 'DIRECTOR', 'REGISTRAR'].includes(session.user.role)) {
        return { success: false, message: "Permission denied" }
    }

    const studentIds = formData.get("studentIds")
    const studentIdArray = studentIds ? JSON.parse(studentIds as string) : []

    const validatedFields = ParentSchema.safeParse({
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        phone: formData.get("phone"),
        secondaryPhone: formData.get("secondaryPhone") || undefined,
        email: formData.get("email") || undefined,
        whatsapp: formData.get("whatsapp") || undefined,
        telegram: formData.get("telegram") || undefined,
        occupation: formData.get("occupation") || undefined,
        employer: formData.get("employer") || undefined,
        nationalId: formData.get("nationalId") || undefined,
        isEmergencyContact: formData.get("isEmergencyContact") === "true",
        address: formData.get("address") || undefined,
        studentIds: studentIdArray,
    })

    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Validation failed"
        }
    }

    try {
        const { studentIds: linkedStudents, ...parentData } = validatedFields.data

        let userId = null
        if (parentData.email) {
            const user = await prisma.user.create({
                data: {
                    email: parentData.email,
                    name: `${parentData.firstName} ${parentData.lastName}`,
                    role: 'PARENT',
                    password: 'password123',
                    schoolId: schoolId
                }
            })
            userId = user.id
        }

        await prisma.parent.create({
            data: {
                ...parentData,
                userId,
                schoolId,
                students: linkedStudents && linkedStudents.length > 0 ? {
                    connect: linkedStudents.map(id => ({ id }))
                } : undefined
            }
        })

        revalidatePath("/dashboard/parents")
        return { success: true, message: "Parent created successfully" }
    } catch (e: any) {
        console.error("Parent creation error:", e)
        return { success: false, message: e.message || "Failed to create parent" }
    }
}

export async function updateParent(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session?.user) return { success: false, message: "Unauthorized" }
    const schoolId = (session.user as any).schoolId

    if (!['ADMIN', 'DIRECTOR', 'REGISTRAR'].includes(session.user.role)) {
        return { success: false, message: "Permission denied" }
    }

    const parentId = formData.get("parentId") as string
    const studentIds = formData.get("studentIds")
    const studentIdArray = studentIds ? JSON.parse(studentIds as string) : []

    const validatedFields = ParentSchema.safeParse({
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        phone: formData.get("phone"),
        secondaryPhone: formData.get("secondaryPhone") || undefined,
        email: formData.get("email") || undefined,
        whatsapp: formData.get("whatsapp") || undefined,
        telegram: formData.get("telegram") || undefined,
        occupation: formData.get("occupation") || undefined,
        employer: formData.get("employer") || undefined,
        nationalId: formData.get("nationalId") || undefined,
        isEmergencyContact: formData.get("isEmergencyContact") === "true",
        address: formData.get("address") || undefined,
        studentIds: studentIdArray,
    })

    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Validation failed"
        }
    }

    try {
        const { studentIds: linkedStudents, ...parentData } = validatedFields.data

        await prisma.parent.update({
            where: { id: parentId, schoolId },
            data: {
                ...parentData,
                students: {
                    set: linkedStudents && linkedStudents.length > 0
                        ? linkedStudents.map(id => ({ id }))
                        : []
                }
            }
        })

        revalidatePath("/dashboard/parents")
        return { success: true, message: "Parent updated successfully" }
    } catch (e: any) {
        console.error("Parent update error:", e)
        return { success: false, message: e.message || "Failed to update parent" }
    }
}

export async function deleteParent(parentId: string) {
    const session = await auth()
    if (!session?.user) return { success: false, message: "Unauthorized" }
    const schoolId = (session.user as any).schoolId

    if (!['ADMIN', 'DIRECTOR'].includes(session.user.role)) {
        return { success: false, message: "Permission denied" }
    }

    try {
        await prisma.parent.delete({ where: { id: parentId, schoolId } })
        revalidatePath("/dashboard/parents")
        return { success: true, message: "Parent deleted successfully" }
    } catch (e: any) {
        return { success: false, message: e.message || "Failed to delete parent" }
    }
}

export async function getCommunicationHistory(parentId: string) {
    const session = await auth()
    if (!session?.user) return []
    const schoolId = (session.user as any).schoolId

    try {
        const communications = await prisma.communication.findMany({
            where: { parentId, schoolId },
            orderBy: { sentAt: 'desc' }
        })
        return communications
    } catch (error) {
        console.error("Communication fetch error:", error)
        return []
    }
}

export async function sendCommunication(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session?.user) return { success: false, message: "Unauthorized" }
    const schoolId = (session.user as any).schoolId

    const parentIds = formData.get("parentIds")
    const parentIdArray = parentIds ? JSON.parse(parentIds as string) : []
    const type = formData.get("type") as string
    const subject = formData.get("subject") as string
    const content = formData.get("content") as string
    const studentId = formData.get("studentId") as string || undefined

    if (parentIdArray.length === 0) {
        return { success: false, message: "No parents selected" }
    }

    try {
        const parents = await prisma.parent.findMany({
            where: { id: { in: parentIdArray }, schoolId }
        })

        const communications = []
        const { sendTelegramMessage, isTelegramConfigured } = await import("@/lib/telegram")
        const { sendSMS } = await import("@/lib/sms")

        for (const parent of parents as any[]) {
            if (type === "Telegram") {
                if (isTelegramConfigured() && parent.telegramChatId) {
                    await sendTelegramMessage(parent.telegramChatId, `${subject ? `*${subject}*\n\n` : ''}${content}`)
                }
            } else if (type === "SMS") {
                if (parent.phone) {
                    await sendSMS(parent.phone, `${subject ? `${subject}: ` : ''}${content}`)
                }
            }

            communications.push({
                type,
                subject,
                content,
                parentId: parent.id,
                senderId: session.user.id,
                studentId,
                isRead: false,
                schoolId
            })
        }

        await prisma.communication.createMany({ data: communications })
        revalidatePath("/dashboard/parents")
        return { success: true, message: `Message recorded for ${communications.length} parent(s)` }
    } catch (e: any) {
        return { success: false, message: e.message || "Failed to send communication" }
    }
}
