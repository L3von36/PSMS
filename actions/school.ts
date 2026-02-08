"use server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { hash } from "bcryptjs"

const SchoolSchema = z.object({
    name: z.string().min(3, "School name must be at least 3 characters"),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
})

const AdminUserSchema = z.object({
    name: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
})

export async function createSchool(prevState: any, formData: FormData) {
    const session = await auth()
    if (session?.user?.role !== 'SUPER_ADMIN') {
        return { success: false, message: "Unauthorized" }
    }

    const validatedFields = SchoolSchema.safeParse({
        name: formData.get("name"),
        address: formData.get("address"),
        phone: formData.get("phone"),
        email: formData.get("email"),
    })

    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Validation failed"
        }
    }

    try {
        const school = await prisma.school.create({
            data: validatedFields.data
        })
        revalidatePath("/super-admin")
        return { success: true, message: "School created successfully", schoolId: school.id }
    } catch (error) {
        return { success: false, message: "Failed to create school" }
    }
}

export async function createSchoolAdmin(schoolId: string, formData: FormData) {
    const session = await auth()
    if (session?.user?.role !== 'SUPER_ADMIN') {
        return { success: false, message: "Unauthorized" }
    }

    const validatedFields = AdminUserSchema.safeParse({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
    })

    if (!validatedFields.success) {
        return { success: false, message: "Validation failed" }
    }

    const hashedPassword = await hash(validatedFields.data.password, 10)

    try {
        await prisma.user.create({
            data: {
                name: validatedFields.data.name,
                email: validatedFields.data.email,
                password: hashedPassword,
                role: "ADMIN",
                schoolId: schoolId
            }
        })
        return { success: true, message: "Admin user created successfully" }
    } catch (error) {
        return { success: false, message: "Failed to create admin user" }
    }
}

export async function getSchools() {
    return await prisma.school.findMany({
        include: {
            _count: {
                select: { students: true, users: true }
            }
        }
    })
}
