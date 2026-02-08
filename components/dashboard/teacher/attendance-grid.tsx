'use client'

import { useState, useEffect } from "react"
import { getMonthlyAttendance } from "@/actions/teacher"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Loader2, Download, Search } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function AttendanceGrid({ grade, section, subjectId }: { grade?: string, section?: string, subjectId?: string }) {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [loading, setLoading] = useState(true)
    const [records, setRecords] = useState<any[]>([])
    const [students, setStudents] = useState<any[]>([])

    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

    const fetchMonthlyData = async () => {
        setLoading(true)
        try {
            const data = await getMonthlyAttendance(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                grade === 'ALL' ? undefined : grade,
                section === 'ALL' ? undefined : section,
                subjectId === 'ALL' ? undefined : subjectId
            )
            setRecords(data)
            
            // Extract unique students from records or fetch separately
            const uniqueStudentsMap = new Map()
            data.forEach((r: any) => {
                if (!uniqueStudentsMap.has(r.student.id)) {
                    uniqueStudentsMap.set(r.student.id, r.student)
                }
            })
            setStudents(Array.from(uniqueStudentsMap.values()))
        } catch (error) {
            toast.error("Failed to fetch monthly data")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMonthlyData()
    }, [currentDate, grade, section, subjectId])

    const nextMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))
    const prevMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))

    const getStatusMarker = (studentId: string, day: Date) => {
        const record = records.find(r => 
            r.studentId === studentId && 
            isSameDay(new Date(r.date), day) &&
            (subjectId === 'ALL' || !subjectId || r.subjectId === subjectId)
        )
        if (!record) return null
        
        switch (record.status) {
            case 'PRESENT': return { label: 'P', color: 'bg-green-500', text: 'Present', remarks: record.remarks, subjectName: record.subject?.name }
            case 'ABSENT': return { label: 'A', color: 'bg-red-500', text: 'Absent', remarks: record.remarks, subjectName: record.subject?.name }
            case 'LATE': return { label: 'L', color: 'bg-yellow-500', text: 'Late', remarks: record.remarks, subjectName: record.subject?.name }
            case 'EXCUSED': return { label: 'E', color: 'bg-blue-500', text: 'Excused', remarks: record.remarks, subjectName: record.subject?.name }
            default: return null
        }
    }

    if (loading && students.length === 0) {
        return <div className="p-8 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
    }

    return (
        <Card className="overflow-hidden border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-4">
                    <CardTitle className="text-xl font-bold">
                        {format(currentDate, "MMMM yyyy")}
                    </CardTitle>
                    <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-lg p-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevMonth}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextMonth}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
                <table className="w-full border-collapse text-xs">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900/50">
                            <th className="p-3 text-left border-r sticky left-0 bg-slate-50 dark:bg-slate-900 z-10 min-w-[150px]">Student</th>
                            {days.map(day => (
                                <th key={day.toString()} className={`p-1 text-center border-b font-medium min-w-[28px] ${[0, 6].includes(day.getDay()) ? 'bg-slate-100/50 text-muted-foreground' : ''}`}>
                                    <span className="block text-[10px] uppercase opacity-50">{format(day, "eee")}</span>
                                    {format(day, "d")}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {students.length === 0 && !loading ? (
                            <tr>
                                <td colSpan={days.length + 1} className="p-12 text-center text-muted-foreground">
                                    <Search className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                    No students found for this period.
                                </td>
                            </tr>
                        ) : (
                            students.map(student => (
                                <tr key={student.id} className="border-b hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                                    <td className="p-3 border-r sticky left-0 bg-white dark:bg-slate-950 z-10 font-medium">
                                        {student.firstName} {student.lastName}
                                    </td>
                                    {days.map(day => {
                                        const marker = getStatusMarker(student.id, day)
                                        return (
                                            <td key={day.toString()} className={`p-1 border-r text-center ${[0, 6].includes(day.getDay()) ? 'bg-slate-50/30' : ''}`}>
                                                {marker ? (
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <div className={`w-5 h-5 mx-auto rounded-sm ${marker.color} text-white font-bold flex items-center justify-center cursor-help transition-transform hover:scale-110 shadow-sm`}>
                                                                    {marker.label}
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p className="font-bold">{marker.text}</p>
                                                                {marker.subjectName && (
                                                                    <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-tighter">
                                                                        {marker.subjectName}
                                                                    </p>
                                                                )}
                                                                <p className="text-xs text-muted-foreground">{format(day, "PPP")}</p>
                                                                {marker.remarks && <p className="text-xs italic mt-1 border-t pt-1">Note: {marker.remarks}</p>}
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                ) : (
                                                    <div className="w-5 h-5 mx-auto rounded-sm border border-dashed border-slate-200 dark:border-slate-800" />
                                                )}
                                            </td>
                                        )
                                    })}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </CardContent>
            
            {/* Legend */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-green-500" /> <span>Present (P)</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-red-500" /> <span>Absent (A)</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-yellow-500" /> <span>Late (L)</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-blue-500" /> <span>Excused (E)</span>
                </div>
                <div className="ml-auto text-muted-foreground italic">
                    Tip: Hover over a marker to see notes
                </div>
            </div>
        </Card>
    )
}
