"use client"

import { Award, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'

type GradeStats = {
  avgScore: number
  totalGrades: number
  highestScore: number
  lowestScore: number
}

export function GradeStatsCards({ stats }: { stats: GradeStats }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Average Score"
        value={`${stats.avgScore.toFixed(1)}%`}
        icon={BarChart3}
        iconColor="text-blue-600"
        bgColor="bg-blue-100 dark:bg-blue-900/30"
        trend="+3.2% from last term"
        trendUp={true}
      />
      <StatCard
        title="Total Grades"
        value={stats.totalGrades.toString()}
        icon={Award}
        iconColor="text-purple-600"
        bgColor="bg-purple-100 dark:bg-purple-900/30"
      />
      <StatCard
        title="Highest Score"
        value={`${stats.highestScore}%`}
        icon={TrendingUp}
        iconColor="text-green-600"
        bgColor="bg-green-100 dark:bg-green-900/30"
      />
      <StatCard
        title="Lowest Score"
        value={`${stats.lowestScore}%`}
        icon={TrendingDown}
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
