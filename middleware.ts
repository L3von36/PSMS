import { auth } from "@/lib/auth"

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const role = req.auth?.user?.role
    const { pathname } = req.nextUrl

    const isOnDashboard = pathname.startsWith('/dashboard')

    if (isOnDashboard && !isLoggedIn) {
        return Response.redirect(new URL('/login', req.nextUrl))
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
