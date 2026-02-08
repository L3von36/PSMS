import { Users, DollarSign, GraduationCap, TrendingUp } from 'lucide-react'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { EnrollmentChart } from '@/components/dashboard/enrollment-chart'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { Suspense } from 'react'

export function AdminDashboard({ metrics }: { metrics: any }) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        <p className="text-muted-foreground">Comprehensive school overview and financial health.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Students" value={metrics.totalStudents.toString()} icon={Users} trend="+12% this year" trendUp={true} />
        <MetricCard title="Total Revenue" value={`ETB ${metrics.totalRevenue.toLocaleString()}`} icon={DollarSign} trend="+8% vs last term" trendUp={true} />
        <MetricCard title="Active Subjects" value={metrics.subjects.toString()} icon={GraduationCap} trend="Across all units" trendUp={null} />
        <MetricCard title="Avg. Performance" value="87.5%" icon={TrendingUp} trend="+3.2% academic gain" trendUp={true} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Suspense fallback={<div className="h-[300px] bg-muted animate-pulse rounded-lg" />}><RevenueChart /></Suspense>
        <Suspense fallback={<div className="h-[300px] bg-muted animate-pulse rounded-lg" />}><EnrollmentChart /></Suspense>
      </div>

      <RecentActivity payments={metrics.recentPayments} grades={metrics.recentGrades} />
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
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {trendUp !== null && <span className={trendUp ? "text-green-600" : "text-red-600"}>{trendUp ? "↑" : "↓"}</span>}
            {trend}
          </p>
        </div>
        <div className="rounded-full bg-primary/10 p-3">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </div>
  )
}
