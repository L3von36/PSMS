"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Award } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

type Payment = {
  id: string
  amount: number
  createdAt: Date
  student: { firstName: string; lastName: string } | null
}

type Grade = {
  id: string
  score: number
  createdAt: Date
  student: { firstName: string; lastName: string } | null
  subject: { name: string } | null
}

export function RecentActivity({ 
  payments = [], 
  grades = [],
  showPayments = true,
  showGrades = true
}: { 
  payments?: Payment[]
  grades?: Grade[]
  showPayments?: boolean
  showGrades?: boolean
}) {
  const activities = [
    ...(showPayments ? payments.map(p => ({
      type: 'payment' as const,
      id: p.id,
      text: `${p.student?.firstName} ${p.student?.lastName} paid ETB ${p.amount.toLocaleString()}`,
      time: p.createdAt,
      icon: DollarSign,
      color: 'text-green-600'
    })) : []),
    ...(showGrades ? grades.map(g => ({
      type: 'grade' as const,
      id: g.id,
      text: `${g.student?.firstName} ${g.student?.lastName} scored ${g.score}% in ${g.subject?.name}`,
      time: g.createdAt,
      icon: Award,
      color: 'text-blue-600'
    })) : [])
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest payments and grade entries</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
          ) : (
            activities.map((activity) => {
              const Icon = activity.icon
              return (
                <div key={activity.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                  <div className={`rounded-full p-2 ${activity.type === 'payment' ? 'bg-green-100 dark:bg-green-900/20' : 'bg-blue-100 dark:bg-blue-900/20'}`}>
                    <Icon className={`h-4 w-4 ${activity.color}`} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{activity.text}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.time), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
