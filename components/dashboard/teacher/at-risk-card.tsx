'use client'

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, TrendingDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// We'll pass the data in, or fetch it inside if we want it isolated.
// For dashboard speed, passing it from the parent (server component) is better.
type AtRiskStudent = {
    id: string
    name: string
    grade: string
    section: string
    reason: string
    metric: string
    severity: "HIGH" | "MEDIUM"
}

export function AtRiskStudentsCard({ students }: { students: AtRiskStudent[] }) {
  return (
    <Card className="border-l-4 border-l-amber-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-700">
            <AlertTriangle className="h-5 w-5" />
            At-Risk Students (AI Detected)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
            {students.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-muted-foreground gap-2">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-green-600 font-bold">✓</span>
                    </div>
                    <p className="text-sm">All students are on track!</p>
                </div>
            ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {students.map((s) => (
                        <Link href={`/dashboard/students?studentId=${s.id}`} key={s.id}>
                            <div className="flex items-center justify-between p-3 border rounded-lg bg-orange-50/50 cursor-pointer hover:bg-orange-100 transition-colors">
                                <div>
                                    <div className="font-semibold text-sm">{s.name}</div>
                                    <div className="text-xs text-muted-foreground">{s.grade}-{s.section}</div>
                                </div>
                                <div className="text-right">
                                    <Badge variant={s.severity === 'HIGH' ? "destructive" : "secondary"} className="mb-1">
                                        {s.reason}
                                    </Badge>
                                    <div className="text-xs font-mono font-bold text-red-600">
                                        {s.metric}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  )
}
