"use client"

import { DollarSign, TrendingUp, Clock, AlertCircle } from 'lucide-react'

type FinanceStats = {
  totalRevenue: number
  pendingPayments: number
  thisMonth: number
  overdueAmount: number
}

export function FinanceStatsCards({ stats }: { stats: FinanceStats }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Revenue"
        value={`ETB ${stats.totalRevenue.toLocaleString()}`}
        icon={DollarSign}
        iconColor="text-green-600"
        bgColor="bg-green-100 dark:bg-green-900/30"
        trend="+12% from last month"
        trendUp={true}
      />
      <StatCard
        title="Pending Payments"
        value={stats.pendingPayments.toString()}
        icon={Clock}
        iconColor="text-yellow-600"
        bgColor="bg-yellow-100 dark:bg-yellow-900/30"
      />
      <StatCard
        title="This Month"
        value={`ETB ${stats.thisMonth.toLocaleString()}`}
        icon={TrendingUp}
        iconColor="text-blue-600"
        bgColor="bg-blue-100 dark:bg-blue-900/30"
        trend="+8% from last month"
        trendUp={true}
      />
      <StatCard
        title="Overdue Amount"
        value={`ETB ${stats.overdueAmount.toLocaleString()}`}
        icon={AlertCircle}
        iconColor="text-red-600"
        bgColor="bg-red-100 dark:bg-red-900/30"
      />
    </div>
  )
}

function StatCard({ 
  title, 
  value, 
  icon: Icon,
  iconColor,
  bgColor,
  trend,
  trendUp
}: { 
  title: string
  value: string
  icon: any
  iconColor: string
  bgColor: string
  trend?: string
  trendUp?: boolean
}) {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {trend && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {trendUp !== undefined && (
                <span className={trendUp ? "text-green-600" : "text-red-600"}>
                  {trendUp ? "↑" : "↓"}
                </span>
              )}
              {trend}
            </p>
          )}
        </div>
        <div className={`rounded-full ${bgColor} p-3`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  )
}
