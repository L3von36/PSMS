import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    session: { strategy: "jwt" },
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isOnDashboard = nextUrl.pathname.startsWith("/dashboard")
            const isOnSuperAdmin = nextUrl.pathname.startsWith("/super-admin")

            if (isOnDashboard || isOnSuperAdmin) {
                if (isLoggedIn) return true
                return false // Redirect to login
            }
            return true
        },
        jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role
                token.id = user.id
                token.schoolId = (user as any).schoolId
            }
            return token
        },
        session({ session, token }) {
            if (session.user && token.id) {
                session.user.id = token.id as string
                session.user.role = token.role as any
                (session.user as any).schoolId = token.schoolId
            }
            return session
        }
    },
    providers: [], // Add providers in lib/auth.ts
} satisfies NextAuthConfig
