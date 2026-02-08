import { DollarSign, CreditCard, AlertCircle, TrendingUp } from 'lucide-react'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { Suspense } from 'react'

export function AccountantDashboard({ metrics }: { metrics: any }) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Finance Dashboard</h2>
        <p className="text-muted-foreground">Track revenue, pending payments, and fee status.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Revenue" value={`ETB ${metrics.totalRevenue.toLocaleString()}`} icon={DollarSign} trend="+15% this quarter" trendUp={true} />
        <MetricCard title="Recent Collections" value="84" icon={CreditCard} trend="Payments today" trendUp={true} />
        <MetricCard title="Pending Fees" value="ETB 12,500" icon={AlertCircle} trend="5 students overdue" trendUp={false} />
        <MetricCard title="Projected" value="ETB 85K" icon={TrendingUp} trend="Target for this term" trendUp={true} />
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <Suspense fallback={<div className="h-[300px] bg-muted animate-pulse rounded-lg" />}><RevenueChart /></Suspense>
        </div>
        <div>
           <div className="p-6 border rounded-xl bg-card h-full">
            <h3 className="font-semibold mb-4">Collection History</h3>
            <RecentActivity payments={metrics.recentPayments} showGrades={false} />
           </div>
        </div>
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
        <div className="rounded-full bg-green-500/10 p-3">
          <Icon className="h-6 w-6 text-green-600" />
        </div>
      </div>
    </div>
  )
}
