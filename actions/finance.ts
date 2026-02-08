"use server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const FeeSchema = z.object({
    name: z.string().min(3, "Fee name must be at least 3 characters"),
    amount: z.coerce.number().positive("Amount must be positive"),
    gradeLevel: z.string().min(1, "Grade level is required"),
})

const PaymentSchema = z.object({
    studentId: z.string().min(1, "Student is required"),
    amount: z.number().min(0, "Amount must be greater than 0"),
    method: z.string().min(1, "Method is required"),
})

export async function createFeeStructure(prevState: any, formData: FormData) {
    const validatedFields = FeeSchema.safeParse({
        name: formData.get("name"),
        amount: formData.get("amount"),
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
        await prisma.feeStructure.create({
            data: {
                title: validatedFields.data.name, // Map 'name' to 'title' for database
                amount: validatedFields.data.amount,
                gradeLevel: validatedFields.data.gradeLevel,
            }
        })
        revalidatePath("/dashboard/finance")
        return { success: true, message: "Fee structure created successfully!", errors: {} }
    } catch (error) {
        return { success: false, message: "Failed to create fee structure", errors: {} }
    }
}

export async function recordPayment(prevState: any, formData: FormData) {
    const validatedFields = PaymentSchema.safeParse({
        studentId: formData.get("studentId"),
        amount: parseFloat(formData.get("amount") as string),
        method: formData.get("method"),
    })

    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Validation failed"
        }
    }

    try {
        await prisma.payment.create({
            data: {
                ...validatedFields.data,
                status: "PAID",
                feeId: formData.get("feeId") as string || null,
            }
        })
        revalidatePath("/dashboard/finance")
        return { success: true, message: "Payment recorded successfully" }
    } catch (e) {
        return { success: false, message: "Failed to record payment" }
    }
}

export async function generateMonthlyInvoices(monthName: string) {
    try {
        const students = await prisma.student.findMany()
        const feeStructures = await prisma.feeStructure.findMany()

        let count = 0
        for (const student of students) {
            const fee = feeStructures.find(f => f.gradeLevel === student.grade)
            if (!fee) continue

            // Check if already invoiced for this fee/month (naive check for now)
            // In a real app, we'd have a specific Invoice model or check by date range
            const existing = await prisma.payment.findFirst({
                where: {
                    studentId: student.id,
                    feeId: fee.id,
                    status: "PENDING",
                    createdAt: {
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                    }
                }
            })

            if (!existing) {
                await prisma.payment.create({
                    data: {
                        studentId: student.id,
                        amount: fee.amount,
                        method: "AUTO_GENERATED",
                        status: "PENDING",
                        feeId: fee.id,
                    }
                })
                count++
            }
        }

        revalidatePath("/dashboard/finance")
        return { success: true, message: `Invoiced ${count} students for ${monthName}` }
    } catch (error) {
        console.error("Invoicing failed:", error)
        return { success: false, message: "Invoicing failed" }
    }
}

export async function getFinanceData() {
    const feeStructures = await prisma.feeStructure.findMany({
        orderBy: { createdAt: 'desc' }
    })

    const payments = await prisma.payment.findMany({
        include: { student: true },
        orderBy: { createdAt: 'desc' }
    })

    return { feeStructures, payments }
}
