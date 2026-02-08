"use client"

import { FileText, HelpCircle, Clock, BookOpen } from 'lucide-react'

type ExamStats = {
  totalExams: number
  activeExams: number
  totalQuestions: number
  avgDuration: number
}

export function ExamStatsCards({ stats }: { stats: ExamStats }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Exams"
        value={stats.totalExams.toString()}
        icon={FileText}
        iconColor="text-blue-600"
        bgColor="bg-blue-100 dark:bg-blue-900/30"
      />
      <StatCard
        title="Active Exams"
        value={stats.activeExams.toString()}
        icon={BookOpen}
        iconColor="text-green-600"
        bgColor="bg-green-100 dark:bg-green-900/30"
      />
      <StatCard
        title="Total Questions"
        value={stats.totalQuestions.toString()}
        icon={HelpCircle}
        iconColor="text-purple-600"
        bgColor="bg-purple-100 dark:bg-purple-900/30"
      />
      <StatCard
        title="Avg Duration"
        value={`${stats.avgDuration} min`}
        icon={Clock}
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
