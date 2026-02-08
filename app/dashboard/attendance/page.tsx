import { getTeacherClasses } from "@/actions/teacher"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, ClipboardCheck } from "lucide-react"

export default async function AttendanceSelectionPage() {
    const classes = await getTeacherClasses()

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Attendance</h2>
                <p className="text-muted-foreground">Select a class to mark attendance for today.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {classes.map(c => (
                    <Card key={c.id} className="hover:border-indigo-500 transition-colors cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Grade {c.grade}-{c.section}
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold mb-4">{c.subject}</div>
                            <Link href={`/dashboard/attendance/${c.grade}/${c.section}`}>
                                <Button className="w-full">
                                    <ClipboardCheck className="mr-2 h-4 w-4" />
                                    Mark Attendance
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ))}
                
                {classes.length === 0 && (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        No classes assigned to you.
                    </div>
                )}
            </div>
        </div>
    )
}
