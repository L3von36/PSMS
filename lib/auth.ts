import NextAuth, { CredentialsSignin } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"

class UserNotFoundError extends CredentialsSignin {
    code = "UserNotFound"
}

class PasswordMismatchError extends CredentialsSignin {
    code = "PasswordMismatch"
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" }, // Credentials provider requires JWT strategy
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                console.log('🔐 Auth attempt with credentials:', {
                    email: credentials?.email,
                    hasPassword: !!credentials?.password
                })

                if (!credentials?.email || !credentials?.password) {
                    console.log('❌ Missing email or password')
                    return null;
                }

                // Find user
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string }
                });

                console.log('👤 User found:', user ? `Yes (${user.email}, role: ${user.role})` : 'No')

                if (!user || !user.password) {
                    console.log('❌ User not found or no password set')
                    throw new UserNotFoundError()
                }

                // Check if stored password is a hash (starts with $2b$)
                const isHash = user.password.startsWith("$2b$")

                let isValid = false
                if (isHash) {
                    isValid = await compare(credentials.password as string, user.password)
                } else {
                    // Fallback for legacy plain text users
                    isValid = credentials.password === user.password
                }

                console.log('🔑 Password comparison:', {
                    storedType: isHash ? "Hash" : "Plain",
                    match: isValid
                })

                if (isValid) {
                    console.log('✅ Login successful!')
                    return user;
                }

                console.log('❌ Password mismatch')
                throw new PasswordMismatchError()
                return null;
            },
        }),
    ],
    logger: {
        error(code, ...message) {
            // Check if it's a CredentialsSignin error (including our custom subclasses)
            if (code instanceof Error && (code as any).type === "CredentialsSignin") {
                const errorCode = (code as any).code || "CredentialsSignin";
                console.log(`❌ [Auth] Login Failed: ${errorCode}`);
                return;
            }

            console.error(code, ...message)
        }
    },
    callbacks: {
        authorized({ request, auth }) {
            // Basic protection: Allow access if authenticated, or public routes
            // const { pathname } = request.nextUrl
            // if (pathname.startsWith("/dashboard")) return !!auth
            return true
        },
        jwt({ token, user }) {
            if (user) {
                token.role = user.role
                token.id = user.id
            }
            return token
        },
        session({ session, token }) {
            if (session.user && token.id) {
                session.user.id = token.id
                session.user.role = token.role
            }
            return session
        }
    },
})
