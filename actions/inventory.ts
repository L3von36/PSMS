"use server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"

export async function getInventory() {
    const session = await auth()
    const schoolId = (session?.user as any)?.schoolId
    if (!schoolId) return []

    return await prisma.inventoryItem.findMany({
        where: { schoolId },
        include: { transactions: { take: 5, orderBy: { createdAt: 'desc' } } }
    })
}

export async function addInventoryItem(formData: FormData) {
    const session = await auth()
    const schoolId = (session?.user as any)?.schoolId
    if (!schoolId) return { success: false, message: "Unauthorized" }

    const name = formData.get("name") as string
    const category = formData.get("category") as string
    const quantity = parseInt(formData.get("quantity") as string)

    try {
        await prisma.inventoryItem.create({
            data: {
                schoolId,
                name,
                category,
                quantity,
            }
        })
        revalidatePath("/dashboard/inventory")
        return { success: true, message: "Item added successfully" }
    } catch (error) {
        return { success: false, message: "Failed to add item" }
    }
}
