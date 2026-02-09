import NextAuth from "next-auth"
import { authConfig } from "./lib/auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const role = (req.auth?.user as any)?.role
    const { pathname } = req.nextUrl

    const isOnDashboard = pathname.startsWith('/dashboard')
    const isOnSuperAdmin = pathname.startsWith('/super-admin')

    if ((isOnDashboard || isOnSuperAdmin) && !isLoggedIn) {
        return Response.redirect(new URL('/login', req.nextUrl))
    }

    if (isOnSuperAdmin && role !== 'SUPER_ADMIN') {
        return Response.redirect(new URL('/dashboard', req.nextUrl))
    }

    // Role-based Access Rules
    const restrictedRoutes: Record<string, string[]> = {
        '/dashboard/finance': ['ADMIN', 'DIRECTOR', 'ACCOUNTANT'],
        '/dashboard/grades': ['ADMIN', 'DIRECTOR', 'TEACHER', 'UNIT_LEADER', 'PARENT', 'STUDENT'],
        '/dashboard/exams': ['ADMIN', 'DIRECTOR', 'TEACHER', 'UNIT_LEADER'],
        '/dashboard/students': ['ADMIN', 'DIRECTOR', 'REGISTRAR', 'UNIT_LEADER', 'TEACHER'],
        '/dashboard/parents': ['ADMIN', 'DIRECTOR', 'REGISTRAR'],
    }

    for (const [route, allowedRoles] of Object.entries(restrictedRoutes)) {
        if (pathname.startsWith(route) && (!role || !allowedRoles.includes(role))) {
            return Response.redirect(new URL('/dashboard', req.nextUrl))
        }
    }
})

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
