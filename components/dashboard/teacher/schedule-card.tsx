import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, Clock, MapPin } from "lucide-react"

interface ScheduleItem {
    id: string
    subject: string
    grade: string
    section: string
    startTime: string
    endTime: string
    period: number
    room: string
}

export function ScheduleCard({ schedule }: { schedule: ScheduleItem[] }) {
    if (!schedule || schedule.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-indigo-600" />
                        Today's Schedule
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-muted-foreground italic text-center py-8">
                        No classes scheduled for today.
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-3 border-b bg-slate-50/50 dark:bg-slate-900/50">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <CalendarDays className="h-5 w-5 text-indigo-600" />
                    Today's Schedule
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {schedule.map((item) => (
                        <div key={item.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col items-center justify-center h-12 w-12 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 shrink-0">
                                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">Per</span>
                                        <span className="text-lg font-black text-indigo-700 dark:text-indigo-300">{item.period}</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            {item.subject}
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            Grade {item.grade} • Section {item.section}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end gap-1">
                                    <div className="flex items-center gap-1.5 text-sm font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                                        <Clock className="h-3 w-3" />
                                        {item.startTime} - {item.endTime}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <MapPin className="h-3 w-3" />
                                        {item.room}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
