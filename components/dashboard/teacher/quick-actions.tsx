'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link2, MessageSquare, ClipboardCheck, FileSpreadsheet } from "lucide-react"
import Link from "next/link"

export function QuickActionsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-indigo-600" />
            Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        <Link href="/dashboard/attendance">
            <Button variant="outline" className="w-full justify-start gap-2 h-12">
                <ClipboardCheck className="h-4 w-4 text-green-600" />
                Take Attendance
            </Button>
        </Link>
        <Link href="/dashboard/grades">
            <Button variant="outline" className="w-full justify-start gap-2 h-12">
                <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                Enter Grades
            </Button>
        </Link>
        <Button variant="outline" className="w-full justify-start gap-2 h-12" disabled title="Coming Soon">
            <MessageSquare className="h-4 w-4 text-amber-600" />
            Message Parents
        </Button>
      </CardContent>
    </Card>
  )
}
