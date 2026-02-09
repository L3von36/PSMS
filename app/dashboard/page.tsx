import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Role } from '@/lib/generated-prisma'
import { AdminDashboard } from '@/components/dashboard/admin-dashboard'
import { TeacherDashboard } from '@/components/dashboard/teacher-dashboard'
import { AccountantDashboard } from '@/components/dashboard/accountant-dashboard'
import { RegistrarDashboard } from '@/components/dashboard/registrar-dashboard'
import { NoticeBoard } from '@/components/dashboard/notice-board'
import { getNotices } from '@/actions/notice'
import { redirect } from 'next/navigation'

async function getDashboardMetrics(schoolId?: string) {
  if (!schoolId) return {
    totalStudents: 0,
    totalRevenue: 0,
    recentPayments: [],
    subjects: 0,
    recentGrades: []
  }

  const [
    totalStudents,
    totalRevenue,
    recentPayments,
    subjects,
    recentGrades
  ] = await Promise.all([
    prisma.student.count({ where: { schoolId } }),
    prisma.payment.aggregate({ where: { schoolId, status: 'PAID' }, _sum: { amount: true } }),
    prisma.payment.findMany({
      where: { schoolId },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { student: true }
    }),
    prisma.subject.count({ where: { schoolId } }),
    prisma.grade.findMany({
      where: { schoolId },
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
  const schoolId = (session?.user as any)?.schoolId
  const metrics = await getDashboardMetrics(schoolId)
  const notices = await getNotices()
  const canPostNotices = ['ADMIN', 'DIRECTOR', 'UNIT_LEADER'].includes(role as string)

  // Render dashboard based on role
  switch (role as any) {
    case 'ADMIN':
    case 'DIRECTOR':
      return <AdminDashboard metrics={metrics} notices={notices} canPost={canPostNotices} />
    
    case 'TEACHER':
    case 'UNIT_LEADER':
      return <TeacherDashboard metrics={metrics} notices={notices} canPost={canPostNotices} />
    
    case 'ACCOUNTANT':
      return <AccountantDashboard metrics={metrics} notices={notices} canPost={canPostNotices} />
    
    case 'REGISTRAR':
      return <RegistrarDashboard metrics={metrics} notices={notices} canPost={canPostNotices} />
    
    case 'PARENT':
    case 'STUDENT':
      const userId = session?.user?.id
      let personalGrades = []
      let personalPayments = []

      if (role === 'STUDENT') {
        const student = await prisma.student.findUnique({
          where: { userId },
          include: {
            grades: { take: 5, orderBy: { createdAt: 'desc' }, include: { subject: true } },
            payments: { take: 5, orderBy: { createdAt: 'desc' } }
          }
        })
        personalGrades = student?.grades || []
        personalPayments = student?.payments || []
      } else {
        const parent = await prisma.parent.findUnique({
          where: { userId },
          include: {
            students: {
              include: {
                grades: { take: 5, orderBy: { createdAt: 'desc' }, include: { subject: true } }
              }
            },
            payments: { take: 5, orderBy: { createdAt: 'desc' }, include: { student: true } }
          }
        })
        // Aggregate grades from all students
        personalGrades = parent?.students.flatMap(s => s.grades.map(g => ({ ...g, student: s })))
          .sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, 5) || []
        personalPayments = parent?.payments || []
      }

      return (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold">Welcome, {session?.user?.name}</h2>
          <p className="text-muted-foreground">Your personal academic and financial overview.</p>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="p-6 border rounded-xl bg-card">
              <h3 className="font-semibold mb-4 text-lg">Recent Academic Performance</h3>
              <div className="space-y-4">
                {personalGrades.map((g: any, i) => (
                  <div key={i} className="flex justify-between items-center p-3 border rounded-lg bg-muted/30">
                    <div>
                      <p className="font-medium text-sm">{(g as any).subject?.name}</p>
                      <p className="text-xs text-muted-foreground">{(g as any).student ? `${(g as any).student.firstName} • ` : ''}{g.category} • {g.term}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-indigo-600">{g.score}%</p>
                    </div>
                  </div>
                ))}
                {personalGrades.length === 0 && <p className="text-sm text-muted-foreground italic">No recent grades found.</p>}
              </div>
            </div>
            <div className="p-6 border rounded-xl bg-card">
              <h3 className="font-semibold mb-4 text-lg">Recent Payments</h3>
              <div className="space-y-4">
                {personalPayments.map((p: any, i) => (
                  <div key={i} className="flex justify-between items-center p-3 border rounded-lg bg-muted/30">
                    <div>
                      <p className="font-medium text-sm">ETB {p.amount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{(p as any).student ? `${(p as any).student.firstName} • ` : ''}{new Date(p.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${p.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))}
                {personalPayments.length === 0 && <p className="text-sm text-muted-foreground italic">No recent payments found.</p>}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <NoticeBoard initialNotices={notices} canPost={canPostNotices} />
          </div>
        </div>
      )
    
    default:
      return <AdminDashboard metrics={metrics} notices={notices} canPost={canPostNotices} />
  }
}
