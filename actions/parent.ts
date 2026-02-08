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

        const role = session.user.role

        // Only ADMIN, DIRECTOR, REGISTRAR can access parent management
        if (!['ADMIN', 'DIRECTOR', 'REGISTRAR'].includes(role)) {
            return { parents: [], students: [], communications: [] }
        }

        const parents = await prisma.parent.findMany({
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

        // Create User account for parent (optional - for parent portal access)
        let userId = null
        if (parentData.email) {
            const user = await prisma.user.create({
                data: {
                    email: parentData.email,
                    name: `${parentData.firstName} ${parentData.lastName}`,
                    role: 'PARENT',
                    password: 'password123' // TODO: Send activation email to set password
                }
            })
            userId = user.id
        }

        await prisma.parent.create({
            data: {
                ...parentData,
                userId,
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
            where: { id: parentId },
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

    if (!['ADMIN', 'DIRECTOR'].includes(session.user.role)) {
        return { success: false, message: "Permission denied" }
    }

    try {
        await prisma.parent.delete({ where: { id: parentId } })
        revalidatePath("/dashboard/parents")
        return { success: true, message: "Parent deleted successfully" }
    } catch (e: any) {
        return { success: false, message: e.message || "Failed to delete parent" }
    }
}

export async function sendCommunication(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session?.user) return { success: false, message: "Unauthorized" }

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
        // Fetch parents to get telegram info if needed
        const parents = await prisma.parent.findMany({
            where: { id: { in: parentIdArray } }
        })

        const communications = []
        let telegramSuccessCount = 0
        let telegramFailCount = 0

        // Import dynamically to avoid build issues if server-only
        const { sendTelegramMessage, isTelegramConfigured } = await import("@/lib/telegram")

        // Type casting to avoid build errors if Prisma types are not yet generated
        for (const parent of parents as any[]) {
            let isSent = false

            // Handle Telegram sending
            if (type === "Telegram") {
                if (!isTelegramConfigured()) {
                    console.error("Telegram token not configured")
                    // We still create the record but maybe mark as failed or just proceed? 
                    // For now, we'll proceed but it won't be sent really.
                } else if (parent.telegramChatId) {
                    const result = await sendTelegramMessage(parent.telegramChatId, `${subject ? `*${subject}*\n\n` : ''}${content}`)
                    if (result.success) {
                        telegramSuccessCount++
                        isSent = true // You could add a status field to Communication model later
                    } else {
                        telegramFailCount++
                        console.error(`Failed to send to parent ${parent.id}: ${result.error}`)
                    }
                } else {
                    telegramFailCount++ // No chat ID linked
                }
            }

            communications.push({
                type,
                subject,
                content,
                parentId: parent.id,
                senderId: session.user.id,
                studentId,
                isRead: false, // Default
            })
        }

        await prisma.communication.createMany({ data: communications })

        revalidatePath("/dashboard/parents")

        let message = `Message recorded for ${communications.length} parent(s)`
        if (type === "Telegram") {
            message = `Telegram: ${telegramSuccessCount} sent, ${telegramFailCount} failed/not linked.`
        }

        return { success: true, message }
    } catch (e: any) {
        return { success: false, message: e.message || "Failed to send communication" }
    }
}

export async function getCommunicationHistory(parentId: string) {
    const session = await auth()
    if (!session?.user) return []

    try {
        const communications = await prisma.communication.findMany({
            where: { parentId },
            orderBy: { sentAt: 'desc' }
        })
        return communications
    } catch (error) {
        console.error("Communication fetch error:", error)
        return []
    }
}
