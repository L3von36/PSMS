import type { Role } from "@/lib/generated-prisma"
import { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface User {
        role: Role
        schoolId?: string | null
    }
    interface Session {
        user: {
            id: string
            role: Role
            schoolId?: string | null
        } & DefaultSession["user"]
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: Role
        id: string
        schoolId?: string | null
    }
}
