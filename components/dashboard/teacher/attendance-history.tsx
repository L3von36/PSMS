'use client'

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getAttendanceHistory, getTeacherAssignments } from "@/actions/teacher"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon, Download, Search, Users, CheckCircle, XCircle, Clock } from "lucide-react"
import { Calendar } from "../../ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover"
import { format } from "date-fns"
import { toast } from "sonner"
import Papa from "papaparse"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { AttendanceGrid } from "./attendance-grid"

export function AttendanceHistory() {
    const [date, setDate] = useState<Date>(new Date())
    const [loading, setLoading] = useState(true)
    const [records, setRecords] = useState<any[]>([])
    const [assignments, setAssignments] = useState<any[]>([])
    const [statusFilter, setStatusFilter] = useState('ALL')
    const [gradeFilter, setGradeFilter] = useState('ALL')
    const [sectionFilter, setSectionFilter] = useState('ALL')
    const [subjectFilter, setSubjectFilter] = useState('ALL')
    const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily')

    const fetchHistory = async (selectedDate: Date) => {
        setLoading(true)
        try {
            const data = await getAttendanceHistory(undefined, undefined, selectedDate, subjectFilter)
            setRecords(data)
        } catch (error) {
            toast.error("Failed to fetch history")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const data = await getTeacherAssignments()
                setAssignments(data)
            } catch (error) {
                console.error("Failed to fetch assignments")
            }
        }
        fetchAssignments()
    }, [])

    useEffect(() => {
        if (viewMode === 'daily') {
            fetchHistory(date)
        }
    }, [date, viewMode, subjectFilter])

    const filteredRecords = records.filter(r => {
        const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter
        const matchesGrade = gradeFilter === 'ALL' || r.student.grade === gradeFilter
        const matchesSection = sectionFilter === 'ALL' || r.student.section === sectionFilter
        const matchesSubject = subjectFilter === 'ALL' || r.subjectId === subjectFilter
        return matchesStatus && matchesGrade && matchesSection && matchesSubject
    })

    const handleExport = () => {
        if (filteredRecords.length === 0) {
            toast.error("No data to export")
            return
        }
        const csv = Papa.unparse(filteredRecords.map(r => ({
            Date: format(new Date(r.date), 'yyyy-MM-dd'),
            Subject: r.subject?.name || 'Daily Summary',
            Student: `${r.student.firstName} ${r.student.lastName}`,
            Grade: r.student.grade,
            Section: r.student.section || 'N/A',
            Status: r.status,
            Remarks: r.remarks || ""
        })))
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `attendance_history_${format(date, 'yyyy-MM-dd')}.csv`
        a.click()
        toast.success("History Exported")
    }

    const stats = {
        present: records.filter(r => r.status === 'PRESENT').length,
        absent: records.filter(r => r.status === 'ABSENT').length,
        late: records.filter(r => r.status === 'LATE').length,
        total: records.length
    }

    // Populate filters from assignments (stable) or records (dynamic/admin)
    const uniqueGrades = assignments.length > 0 
        ? Array.from(new Set(assignments.map(a => a.grade))).sort()
        : Array.from(new Set(records.map(r => r.student.grade))).sort()
    
    const uniqueSections = assignments.length > 0
        ? Array.from(new Set(assignments.map(a => a.section))).sort()
        : Array.from(new Set(records.map(r => r.student.section).filter(Boolean))).sort()

    const uniqueSubjects: any[] = assignments.length > 0
        ? Array.from(new Map(assignments.filter(a => a.subject).map(a => [a.subject.id, a.subject])).values())
        : Array.from(new Map(records.filter(r => r.subject).map(r => [r.subject.id, r.subject])).values())

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight">Attendance History</h1>
                    <Tabs value={viewMode} onValueChange={(v: any) => setViewMode(v)} className="w-fit">
                        <TabsList className="bg-slate-100 dark:bg-slate-900">
                            <TabsTrigger value="daily">Daily View</TabsTrigger>
                            <TabsTrigger value="monthly">Monthly Grid</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                    {viewMode === 'daily' && (
                        <>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="end">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={(d) => d && setDate(d)}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <Button onClick={handleExport} disabled={filteredRecords.length === 0}>
                                <Download className="mr-2 h-4 w-4" />
                                Export
                            </Button>
                        </>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-2 bg-slate-50 dark:bg-slate-900 p-1 rounded-lg border">
                        <Select value={gradeFilter} onValueChange={setGradeFilter}>
                            <SelectTrigger className="w-[110px] bg-transparent border-none">
                                <SelectValue placeholder="Grade" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Grades</SelectItem>
                                {uniqueGrades.map((g: any) => (
                                    <SelectItem key={g} value={g}>Grade {g}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={sectionFilter} onValueChange={setSectionFilter}>
                            <SelectTrigger className="w-[110px] bg-transparent border-none">
                                <SelectValue placeholder="Section" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Sections</SelectItem>
                                {uniqueSections.map((s: any) => (
                                    <SelectItem key={s} value={s}>Section {s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                            <SelectTrigger className="w-[110px] bg-transparent border-none">
                                <SelectValue placeholder="Subject" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Subjects</SelectItem>
                                {uniqueSubjects.map((s: any) => (
                                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {viewMode === 'monthly' ? (
                <AttendanceGrid 
                    grade={gradeFilter} 
                    section={sectionFilter} 
                    subjectId={subjectFilter}
                />
            ) : (
                <>
                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <StatCard label="Total Records" value={stats.total} icon={Users} color="text-blue-600" />
                        <StatCard label="Present" value={stats.present} icon={CheckCircle} color="text-green-600" />
                        <StatCard label="Absent" value={stats.absent} icon={XCircle} color="text-red-600" />
                        <StatCard label="Late" value={stats.late} icon={Clock} color="text-yellow-600" />
                    </div>

                    <Card>
                        <CardHeader className="flex flex-col gap-4">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <CardTitle className="text-xl">
                                    Records for {format(date, "MMMM dd, yyyy")}
                                </CardTitle>
                            </div>
                            
                            <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
                                <TabsList className="grid w-full grid-cols-5">
                                    <TabsTrigger value="ALL">All</TabsTrigger>
                                    <TabsTrigger value="PRESENT">Present</TabsTrigger>
                                    <TabsTrigger value="LATE">Late</TabsTrigger>
                                    <TabsTrigger value="ABSENT">Absent</TabsTrigger>
                                    <TabsTrigger value="EXCUSED">Excused</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </CardHeader>
                        <CardContent>
                            <AnimatePresence mode="wait">
                                {loading ? (
                                    <div className="space-y-4">
                                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
                                    </div>
                                ) : filteredRecords.length === 0 ? (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-xl border-2 border-dashed"
                                    >
                                        <Search className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
                                        <h3 className="mt-4 text-lg font-semibold">No matches found</h3>
                                        <p className="text-muted-foreground">Try selecting a different date or filter.</p>
                                    </motion.div>
                                ) : (
                                    <div className="space-y-3">
                                        {filteredRecords.map((record, index) => (
                                            <motion.div
                                                key={record.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="flex items-center justify-between p-4 border rounded-xl hover:shadow-md transition-shadow bg-card"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <Avatar>
                                                        <AvatarImage src={record.student.photoUrl || ""} />
                                                        <AvatarFallback>{record.student.firstName[0]}{record.student.lastName[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-semibold">{record.student.firstName} {record.student.lastName}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <p className="text-xs text-muted-foreground">Grade {record.student.grade}-{record.student.section}</p>
                                                            {record.subject && (
                                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400 font-medium">
                                                                    {record.subject.name}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {record.remarks && (
                                                            <p className="text-xs text-muted-foreground italic mt-1">
                                                                Note: {record.remarks}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(record.status)}`}>
                                                    {record.status}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </AnimatePresence>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    )
}

function StatCard({ label, value, icon: Icon, color }: any) {
    return (
        <Card className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-950">
            <CardContent className="p-4 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{label}</p>
                    <p className="text-2xl font-bold">{value}</p>
                </div>
                <div className={`p-3 rounded-2xl bg-slate-100 dark:bg-slate-900 ${color}`}>
                    <Icon className="h-5 w-5" />
                </div>
            </CardContent>
        </Card>
    )
}

function getStatusColor(status: string) {
    switch (status) {
        case 'PRESENT': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
        case 'ABSENT': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        case 'LATE': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
        case 'EXCUSED': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
        default: return 'bg-slate-100 text-slate-700'
    }
}
