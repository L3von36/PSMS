import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Role } from '@/lib/generated-prisma'
import { AdminDashboard } from '@/components/dashboard/admin-dashboard'
import { TeacherDashboard } from '@/components/dashboard/teacher-dashboard'
import { AccountantDashboard } from '@/components/dashboard/accountant-dashboard'
import { RegistrarDashboard } from '@/components/dashboard/registrar-dashboard'
import { redirect } from 'next/navigation'

async function getDashboardMetrics() {
  const [
    totalStudents,
    totalRevenue,
    recentPayments,
    subjects,
    recentGrades
  ] = await Promise.all([
    prisma.student.count(),
    prisma.payment.aggregate({ _sum: { amount: true } }),
    prisma.payment.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { student: true }
    }),
    prisma.subject.count(),
    prisma.grade.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { student: true, subject: true }
    })
  ])

  return {
    totalStudents,
    totalRevenue: totalRevenue._sum.amount || 0,
    recentPayments,
    subjects,
    recentGrades
  }
}

export default async function DashboardPage() {
  const session = await auth()
  const role = session?.user?.role || 'STUDENT'
  const metrics = await getDashboardMetrics()

  // Render dashboard based on role
  switch (role as any) {
    case 'ADMIN':
    case 'DIRECTOR':
      return <AdminDashboard metrics={metrics} />
    
    case 'TEACHER':
    case 'UNIT_LEADER':
      return <TeacherDashboard metrics={metrics} />
    
    case 'ACCOUNTANT':
      return <AccountantDashboard metrics={metrics} />
    
    case 'REGISTRAR':
      return <RegistrarDashboard metrics={metrics} />
    
    case 'PARENT':
    case 'STUDENT':
      // Simplified personal dashboard for MVP
      return (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold">Welcome, {session?.user?.name}</h2>
          <p className="text-muted-foreground">Your personal academic and financial overview.</p>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="p-6 border rounded-xl bg-card">
              <h3 className="font-semibold mb-4">My Recent Grades</h3>
              {/* Filter for actual student when IDs are linked */}
              <div className="text-sm text-muted-foreground italic">Coming soon: Your personalized performance tracking.</div>
            </div>
            <div className="p-6 border rounded-xl bg-card">
              <h3 className="font-semibold mb-4">Mey Recent Payments</h3>
              <div className="text-sm text-muted-foreground italic">Coming soon: Your personalized payment history.</div>
            </div>
          </div>
        </div>
      )
    
    default:
      return <AdminDashboard metrics={metrics} />
  }
}
