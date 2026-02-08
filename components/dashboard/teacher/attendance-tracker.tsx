'use client'

import { useState, useTransition } from "react"
import { motion } from "framer-motion"
import { getClassRoster, bulkMarkAttendance, notifyParentOfAbsence } from "@/actions/teacher"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, X, Clock, Loader2, Save, ArrowLeft, Download, MessageSquare, Shield, Bell } from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Papa from "papaparse"
import { Input } from "@/components/ui/input"
import { SubjectSelector } from "./subject-selector"
import { Student, Attendance } from "@/lib/generated-prisma"

export type StudentWithAttendance = Student & {
    attendances: Attendance[]
}

export function AttendanceTracker({ 
    students, 
    subjects,
    grade, 
    section 
}: { 
    students: StudentWithAttendance[], 
    subjects: { id: string, name: string }[],
    grade: string, 
    section: string 
}) {
    const [roster, setRoster] = useState(
        students.map(s => ({
            ...s,
            // Default to 'PRESENT' if no record, or load existing
            status: s.attendances[0]?.status || 'PRESENT',
            remarks: s.attendances[0]?.remarks || ''
        }))
    )
    const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.id || '')
    const [isPending, startTransition] = useTransition()
    const [activeFilter, setActiveFilter] = useState<'ALL' | 'PRESENT' | 'LATE' | 'ABSENT'>('ALL')
    
    // Live counts
    const presentCount = roster.filter(s => s.status === 'PRESENT').length
    const lateCount = roster.filter(s => s.status === 'LATE').length
    const absentCount = roster.filter(s => s.status === 'ABSENT').length

    const handleStatusChange = (studentId: string, status: string) => {
        setRoster(prev => prev.map(s => 
            s.id === studentId ? { ...s, status } : s
        ))
    }

    const handleRemarkChange = (studentId: string, remarks: string) => {
        setRoster(prev => prev.map(s => 
            s.id === studentId ? { ...s, remarks } : s
        ))
    }

    const handleBulkSave = async () => {
        if (!selectedSubject && subjects.length > 0) {
            toast.error("Please select a subject first")
            return
        }

        startTransition(async () => {
            try {
                const records = roster.map(s => ({
                    studentId: s.id,
                    status: s.status,
                    remarks: s.remarks
                }))
                // Use today's date
                await bulkMarkAttendance(records, new Date(), selectedSubject)
                
                toast.success("Attendance Saved", {
                    description: `Successfully marked attendance for ${grade}-${section}`,
                })
            } catch (error) {
                toast.error("Error", {
                    description: "Failed to save attendance. Please try again.",
                })
            }
        })
    }

    const handleBulkStatusChange = (studentIds: string[], status: string) => {
        setRoster(prev => prev.map(s => 
            studentIds.includes(s.id) ? { ...s, status } : s
        ))
        toast.success(`Marked ${studentIds.length} students as ${status}`)
    }

    // Filter logic for Detail View
    const filteredStudents = activeFilter === 'ALL' 
        ? roster 
        : roster.filter(s => s.status === activeFilter)

    if (activeFilter !== 'ALL') {
        return (
            <AttendanceDetailView 
                status={activeFilter} 
                students={filteredStudents} 
                onBack={() => setActiveFilter('ALL')}
                onStatusUpdate={(ids, status) => handleBulkStatusChange(ids, status)}
            />
        )
    }

    return (
        <div className="space-y-4">
             {/* Summary Counters and Subject Selector */}
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="grid grid-cols-3 gap-4 flex-1">
                    <CountCard 
                        label="Present" 
                        count={presentCount} 
                        color="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                        icon={Check} 
                        onClick={() => setActiveFilter('PRESENT')}
                    />
                    <CountCard 
                        label="Late" 
                        count={lateCount} 
                        color="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" 
                        icon={Clock} 
                        onClick={() => setActiveFilter('LATE')}
                    />
                    <CountCard 
                        label="Absent" 
                        count={absentCount} 
                        color="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" 
                        icon={X} 
                        onClick={() => setActiveFilter('ABSENT')}
                    />
                </div>
                <div className="flex flex-col gap-2 min-w-[200px]">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current Subject</p>
                    <SubjectSelector 
                        subjects={subjects} 
                        value={selectedSubject} 
                        onChange={setSelectedSubject} 
                    />
                </div>
            </div>

            <Card className="w-full">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Attendance: Grade {grade}-{section}</CardTitle>
                        <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString()}</p>
                    </div>
                    <Button onClick={handleBulkSave} disabled={isPending}>
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Attendance
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {roster.map(student => (
                            <div key={student.id} className="flex flex-col p-3 border rounded-lg bg-white dark:bg-slate-950 transition-shadow hover:shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={student.photoUrl || ""} />
                                            <AvatarFallback>{student.firstName[0]}{student.lastName[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{student.firstName} {student.lastName}</p>
                                            <p className="text-xs text-muted-foreground">{student.id.slice(-6)}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-1 scale-90">
                                        <StatusButton 
                                            active={student.status === 'PRESENT'} 
                                            onClick={() => handleStatusChange(student.id, 'PRESENT')}
                                            icon={Check}
                                            color="bg-green-100 text-green-700 hover:bg-green-200 border-green-200"
                                            activeColor="bg-green-600 text-white border-green-600 hover:bg-green-700"
                                            label="Present"
                                        />
                                        <StatusButton 
                                            active={student.status === 'LATE'} 
                                            onClick={() => handleStatusChange(student.id, 'LATE')}
                                            icon={Clock}
                                            color="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200"
                                            activeColor="bg-yellow-600 text-white border-yellow-600 hover:bg-yellow-700"
                                            label="Late"
                                        />
                                        <StatusButton 
                                            active={student.status === 'ABSENT'} 
                                            onClick={() => handleStatusChange(student.id, 'ABSENT')}
                                            icon={X}
                                            color="bg-red-100 text-red-700 hover:bg-red-200 border-red-200"
                                            activeColor="bg-red-600 text-white border-red-600 hover:bg-red-700"
                                            label="Absent"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2 items-center">
                                    <MessageSquare className="h-4 w-4 text-muted-foreground ml-1" />
                                    <Input 
                                        placeholder="Add a remark (reason, etc.)"
                                        className="h-8 text-sm"
                                        value={student.remarks}
                                        onChange={(e) => handleRemarkChange(student.id, e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function AttendanceDetailView({ status, students, onBack, onStatusUpdate }: { 
    status: string, 
    students: any[], 
    onBack: () => void,
    onStatusUpdate: (ids: string[], status: string) => void 
}) {
    const handleExport = () => {
        const csv = Papa.unparse(students.map(s => ({
            Name: `${s.firstName} ${s.lastName}`,
            ID: s.id,
            Status: s.status,
            Date: new Date().toLocaleDateString(),
            Remarks: s.remarks
        })))
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${status}_students_${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        toast.success("Exported List")
    }

    const handleSendNotification = async (studentId: string, studentName: string) => {
        try {
            toast.promise(notifyParentOfAbsence(studentId, status), {
                loading: `Sending notification to ${studentName}'s parents...`,
                success: (res: any) => res.success ? `Notification sent to ${res.count} parent(s)` : `Error: ${res.error}`,
                error: "Failed to send notification"
            })
        } catch (error) {
            toast.error("An unexpected error occurred")
        }
    }

    return (
        <Card className="w-full border-2 border-primary/10">
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onBack}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <CardTitle>{status} Students ({students.length})</CardTitle>
                        <p className="text-sm text-muted-foreground">Manage specific actions for this group</p>
                    </div>
                </div>
                <div className="flex gap-2">
                     <Button variant="outline" size="sm" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                    {status === 'ABSENT' && (
                        <Button variant="outline" size="sm" onClick={() => onStatusUpdate(students.map(s => s.id), 'EXCUSED')}>
                            <Shield className="mr-2 h-4 w-4" />
                            Excuse All
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {students.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        No students marked as {status}.
                    </div>
                ) : (
                    <div className="space-y-2">
                        {students.map((student: any) => (
                             <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg bg-card transition-shadow hover:shadow-md">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={student.photoUrl || ""} />
                                        <AvatarFallback>{student.firstName[0]}{student.lastName[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{student.firstName} {student.lastName}</p>
                                        <p className="text-xs text-muted-foreground italic truncate max-w-[200px]">
                                            {student.remarks || "No remarks"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="text-xs font-bold opacity-70 bg-secondary px-2 py-1 rounded">
                                        {status}
                                    </div>
                                    {(status === 'ABSENT' || status === 'LATE') && (
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="h-8 px-3 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border-indigo-200"
                                            onClick={() => handleSendNotification(student.id, `${student.firstName} ${student.lastName}`)}
                                        >
                                            <Bell className="mr-1 h-3 w-3" />
                                            Notify
                                        </Button>
                                    )}
                                    {status === 'ABSENT' && (
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                                            onClick={() => onStatusUpdate([student.id], 'EXCUSED')}
                                        >
                                            <Shield className="mr-1 h-3 w-3" />
                                            Excuse
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

function CountCard({ label, count, color, icon: Icon, onClick }: any) {
    return (
        <Card 
            onClick={onClick}
            className={`${color} border-none shadow-sm cursor-pointer hover:opacity-90 transition-opacity active:scale-95`}
        >
            <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-white/20 rounded-full">
                        <Icon className="h-4 w-4" />
                    </div>
                    <span className="font-semibold text-sm">{label}</span>
                </div>
                <motion.div
                    key={count}
                    initial={{ scale: 1.5 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="text-2xl font-bold"
                >
                    {count}
                </motion.div>
            </CardContent>
        </Card>
    )
}

function StatusButton({ active, onClick, icon: Icon, color, activeColor, label }: any) {
    return (
        <button
            onClick={onClick}
            className={`p-2 rounded-md border transition-all flex flex-col items-center justify-center w-20 h-16 gap-1 ${active ? activeColor : color}`}
            title={label}
        >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-semibold">{label}</span>
        </button>
    )
}
