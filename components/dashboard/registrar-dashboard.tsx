import { Users, UserPlus, BookOpen, ClipboardList } from 'lucide-react'
import { EnrollmentChart } from '@/components/dashboard/enrollment-chart'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { NoticeBoard } from '@/components/dashboard/notice-board'
import { Suspense } from 'react'

export function RegistrarDashboard({ metrics, notices, canPost }: { metrics: any, notices: any[], canPost: boolean }) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Registrar Dashboard</h2>
        <p className="text-muted-foreground">Manage student admissions, records, and academic documents.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Students" value={metrics.totalStudents.toString()} icon={Users} trend="Current enrollment" trendUp={null} />
        <MetricCard title="New Admissions" value="15" icon={UserPlus} trend="This month" trendUp={true} />
        <MetricCard title="Grade Levels" value="12" icon={BookOpen} trend="Active sections" trendUp={null} />
        <MetricCard title="Records Pending" value="8" icon={ClipboardList} trend="Need verification" trendUp={false} />
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <Suspense fallback={<div className="h-[300px] bg-muted animate-pulse rounded-lg" />}><EnrollmentChart /></Suspense>
        </div>
        <div className="p-6 border rounded-xl bg-card">
          <h3 className="font-semibold mb-4">Latest Enrollments</h3>
          <RecentActivity grades={metrics.recentGrades} showPayments={false} />
        </div>
      </div>

      <div className="mt-8">
        <NoticeBoard initialNotices={notices} canPost={canPost} />
      </div>
    </div>
  )
}

function MetricCard({ title, value, icon: Icon, trend, trendUp }: any) {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between space-x-4">
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{trend}</p>
        </div>
        <div className="rounded-full bg-purple-500/10 p-3">
          <Icon className="h-6 w-6 text-purple-600" />
        </div>
      </div>
    </div>
  )
}
