import NextAuth, { CredentialsSignin } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { authConfig } from "./auth.config"

class UserNotFoundError extends CredentialsSignin {
    code = "UserNotFound"
}

class PasswordMismatchError extends CredentialsSignin {
    code = "PasswordMismatch"
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(prisma) as any,
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string }
                });

                if (!user || !user.password) {
                    throw new UserNotFoundError()
                }

                const isHash = user.password.startsWith("$2b$")
                let isValid = false
                if (isHash) {
                    isValid = await compare(credentials.password as string, user.password)
                } else {
                    isValid = credentials.password === user.password
                }

                if (isValid) {
                    return user;
                }

                throw new PasswordMismatchError()
            },
        }),
    ],
})
