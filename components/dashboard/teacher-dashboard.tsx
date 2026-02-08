import { TeacherOverview } from "@/components/dashboard/teacher/teacher-overview"

export async function TeacherDashboard({ metrics }: { metrics: any }) {
  return <TeacherOverview metrics={metrics} />
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
        <div className="rounded-full bg-blue-500/10 p-3">
          <Icon className="h-6 w-6 text-blue-600" />
        </div>
      </div>
    </div>
  )
}
