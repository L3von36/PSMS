"use client"

import { Users, UserCheck, UserPlus, Calendar } from 'lucide-react'

type StatsData = {
  total: number
  active: number
  newThisMonth: number
  avgAge: number
}

export function StudentStatsCards({ stats }: { stats: StatsData }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Students"
        value={stats.total.toString()}
        icon={Users}
        iconColor="text-blue-600"
        bgColor="bg-blue-100 dark:bg-blue-900/30"
      />
      <StatCard
        title="Active Students"
        value={stats.active.toString()}
        icon={UserCheck}
        iconColor="text-green-600"
        bgColor="bg-green-100 dark:bg-green-900/30"
      />
      <StatCard
        title="New This Month"
        value={stats.newThisMonth.toString()}
        icon={UserPlus}
        iconColor="text-purple-600"
        bgColor="bg-purple-100 dark:bg-purple-900/30"
      />
      <StatCard
        title="Average Age"
        value={`${stats.avgAge} years`}
        icon={Calendar}
        iconColor="text-amber-600"
        bgColor="bg-amber-100 dark:bg-amber-900/30"
      />
    </div>
  )
}

function StatCard({ 
  title, 
  value, 
  icon: Icon,
  iconColor,
  bgColor
}: { 
  title: string
  value: string
  icon: any
  iconColor: string
  bgColor: string
}) {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className={`rounded-full ${bgColor} p-3`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  )
}
