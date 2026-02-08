'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, ArrowRight } from "lucide-react"
import Link from "next/link"

interface ClassAssignment {
    id: string
    grade: string
    section: string
    subject: string
}

export function MyClassesCard({ classes }: { classes: ClassAssignment[] }) {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600" />
            My Classes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
            {classes.length === 0 ? (
                <p className="text-muted-foreground text-sm">No classes assigned.</p>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                    {classes.map((c) => (
                        <div key={c.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                            <div>
                                <div className="font-semibold text-sm">Grade {c.grade}-{c.section}</div>
                                <div className="text-xs text-muted-foreground">{c.subject}</div>
                            </div>
                            <Link 
                                href={`/dashboard/classes/${c.grade}/${c.section}`} 
                                className="p-2 rounded-full hover:bg-white hover:shadow-sm"
                            >
                                <ArrowRight className="h-4 w-4 text-gray-500" />
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  )
}
