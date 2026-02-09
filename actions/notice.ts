"use server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"

export async function getNotices() {
    const session = await auth()
    const schoolId = (session?.user as any)?.schoolId
    if (!schoolId) return []

    return await prisma.notice.findMany({
        where: { schoolId },
        orderBy: { createdAt: 'desc' },
        take: 10
    })
}

export async function createNotice(formData: FormData) {
    const session = await auth()
    if (!session?.user) return { success: false, message: "Unauthorized" }
    const schoolId = (session.user as any).schoolId

    const title = formData.get("title") as string
    const content = formData.get("content") as string
    const target = formData.get("target") as string
    const priority = formData.get("priority") as string

    try {
        await prisma.notice.create({
            data: {
                title,
                content,
                target,
                priority,
                schoolId,
                authorId: session.user.id
            }
        })
        revalidatePath("/dashboard")
        return { success: true, message: "Notice posted successfully" }
    } catch (error) {
        return { success: false, message: "Failed to post notice" }
    }
}
