"use server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"

export async function getPayrollData() {
    const session = await auth()
    const schoolId = (session?.user as any)?.schoolId
    if (!schoolId) return { payrolls: [], staff: [] }

    const payrolls = await prisma.payroll.findMany({
        where: { schoolId },
        include: { salaries: { include: { staff: true } } },
        orderBy: { year: 'desc' }
    })

    const staff = await prisma.staff.findMany({
        where: { schoolId }
    })

    return { payrolls, staff }
}

export async function createPayroll(month: number, year: number) {
    const session = await auth()
    const schoolId = (session?.user as any)?.schoolId
    if (!schoolId) return { success: false, message: "Unauthorized" }

    try {
        const payroll = await prisma.payroll.create({
            data: {
                schoolId,
                month,
                year,
                status: "DRAFT"
            }
        })

        const staff = await prisma.staff.findMany({ where: { schoolId } })

        for (const s of staff) {
            await prisma.salary.create({
                data: {
                    staffId: s.id,
                    payrollId: payroll.id,
                    baseSalary: 5000,
                    netSalary: 5000,
                }
            })
        }

        revalidatePath("/dashboard/payroll")
        return { success: true, message: "Payroll draft created" }
    } catch (error) {
        return { success: false, message: "Failed to create payroll" }
    }
}
