import { useMemo } from "react"
import { Grade } from "@/types/grading"
import { calculateEthiopianLetter } from "@/lib/utils"
import { Award, User, MoreHorizontal, Download, Send, Share2 } from "lucide-react"
import { toast } from "sonner"
import { exportToCSV } from "@/lib/export-utils"

export function GradebookSheet({ 
    grades, 
    students,
    onOpenCommunication 
}: { 
    grades: Grade[], 
    students: any[],
    onOpenCommunication: (studentName: string, message: string) => void
}) {
    // Row Actions
    const handleExportRow = (student: any, scores: any, categories: string[]) => {
        const exportData = categories.map(cat => {
            const entry = scores[cat]
            return {
                Category: cat,
                Score: entry ? entry.score : '-',
                OutOf: entry ? entry.outOf : '-',
                Percentage: entry ? `${((entry.score / entry.outOf) * 100).toFixed(1)}%` : '-'
            }
        })
        
        exportToCSV(exportData, `${student.firstName}_${student.lastName}_GradeReport`)
        toast.success(`Exported report for ${student.firstName}`)
    }

    const handleSendSummary = (student: any, scores: any, categories: string[], avg: number, letter: string) => {
        let summary = `*Grade Summary for ${student.firstName} ${student.lastName}*\n\n`
        
        categories.forEach(cat => {
            const entry = scores[cat]
            if (entry) {
                summary += `• ${cat}: ${entry.score}/${entry.outOf} (${((entry.score / entry.outOf) * 100).toFixed(0)}%)\n`
            }
        })
        
        summary += `\n*Average: ${avg.toFixed(1)}%*\n*Letter Grade: ${letter}*`
        
        onOpenCommunication(`${student.firstName} ${student.lastName}`, summary)
    }

    // 1. Identify unique categories in order of appearance
    const categories = useMemo(() => {
        const cats: string[] = []
        grades.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        grades.forEach(g => {
            if (!cats.includes(g.category)) cats.push(g.category)
        })
        return cats
    }, [grades])

    // 2. Pivot data by student
    const pivotedData = useMemo(() => {
        const studentMap: Record<string, { 
            student: any, 
            scores: Record<string, { score: number, outOf: number }>,
            totalWeighted: number,
            count: number 
        }> = {}

        // Initialize with all students in the roster (or just those with grades)
        // Using filteredGrades to determine which students to show
        const uniqueStudentIds = Array.from(new Set(grades.map(g => g.student.id)))
        
        uniqueStudentIds.forEach(id => {
            const studentEntry = grades.find(g => g.student.id === id)?.student
            if (studentEntry) {
                studentMap[id] = { 
                    student: studentEntry, 
                    scores: {},
                    totalWeighted: 0,
                    count: 0
                }
            }
        })

        grades.forEach(g => {
            const sId = g.student.id
            if (studentMap[sId]) {
                // If multiple entries for same category, we'll store the latest for this simple view
                studentMap[sId].scores[g.category] = {
                    score: g.score,
                    outOf: g.outOf || 100
                }
                
                const percentage = (g.score / (g.outOf || 100)) * 100
                studentMap[sId].totalWeighted += percentage
                studentMap[sId].count += 1
            }
        })

        return Object.values(studentMap).sort((a, b) => 
            `${a.student.firstName} ${a.student.lastName}`.localeCompare(`${b.student.firstName} ${b.student.lastName}`)
        )
    }, [grades])

    if (grades.length === 0) {
        return (
            <div className="py-20 text-center bg-slate-50 dark:bg-slate-900 rounded-xl border-2 border-dashed">
                < Award className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
                <h3 className="text-lg font-semibold text-slate-400">No Assessment Data Found</h3>
                <p className="text-sm text-muted-foreground">Select a different filter or record grades to populate the sheet.</p>
            </div>
        )
    }

    return (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr className="bg-slate-100 dark:bg-slate-800/50 border-b">
                            <th className="sticky left-0 z-20 bg-slate-100 dark:bg-slate-800 px-6 py-4 text-left font-bold text-slate-700 dark:text-slate-200 border-r w-72 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                                <div className="flex items-center justify-between">
                                    <span>Student Name</span>
                                    <span className="text-[10px] opacity-40 uppercase">Actions</span>
                                </div>
                            </th>
                            {categories.map(cat => (
                                <th key={cat} className="px-4 py-4 text-center font-bold text-slate-600 dark:text-slate-300 border-r min-w-[120px]">
                                    <div className="flex flex-col items-center">
                                        <span className="text-xs uppercase tracking-wider opacity-70 mb-1">Assessment</span>
                                        <span>{cat}</span>
                                    </div>
                                </th>
                            ))}
                            <th className="px-6 py-4 text-center font-bold text-primary bg-primary/5 min-w-[100px]">
                                Total Avg
                            </th>
                            <th className="px-6 py-4 text-center font-bold text-primary bg-primary/5 min-w-[80px]">
                                Letter
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {pivotedData.map(({ student, scores, totalWeighted, count }) => {
                            const avg = count > 0 ? totalWeighted / count : 0
                            const letter = count > 0 ? calculateEthiopianLetter(avg) : "-"

                            return (
                                <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors group">
                                    <td className="sticky left-0 z-20 bg-white dark:bg-slate-950 px-6 py-4 border-r shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-7 w-7 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                                                    {student.firstName[0]}{student.lastName[0]}
                                                </div>
                                                <span className="truncate font-semibold max-w-[120px]">{student.firstName} {student.lastName}</span>
                                            </div>
                                            
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => handleExportRow(student, scores, categories)}
                                                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-500 hover:text-primary transition-colors"
                                                    title="Export Row"
                                                >
                                                    <Download className="h-3.5 w-3.5" />
                                                </button>
                                                <button 
                                                    onClick={() => handleSendSummary(student, scores, categories, avg, letter)}
                                                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-500 hover:text-primary transition-colors"
                                                    title="Send Summary"
                                                >
                                                    <Send className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                    {categories.map(cat => {
                                        const entry = scores[cat]
                                        return (
                                            <td key={cat} className="px-4 py-4 text-center border-r">
                                                {entry ? (
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-700 dark:text-slate-200">
                                                            {entry.score}
                                                            <span className="text-[10px] text-muted-foreground font-normal ml-0.5">/{entry.outOf}</span>
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground font-medium">
                                                            {((entry.score / entry.outOf) * 100).toFixed(0)}%
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-300 dark:text-slate-700">-</span>
                                                )}
                                            </td>
                                        )
                                    })}
                                    <td className="px-6 py-4 text-center bg-primary/5 font-black text-primary">
                                        {avg.toFixed(1)}%
                                    </td>
                                    <td className="px-6 py-4 text-center bg-primary/5">
                                        <span className={`font-black ${
                                            letter.startsWith('A') ? 'text-green-600' : 
                                            letter.startsWith('B') ? 'text-blue-600' :
                                            letter.startsWith('F') ? 'text-red-600' : 'text-slate-600'
                                        }`}>
                                            {letter}
                                        </span>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t flex items-center justify-between text-[11px] text-muted-foreground">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-green-500" /> A: 90-100</span>
                    <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-blue-500" /> B: 75-89</span>
                    <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-slate-400" /> C: 60-74</span>
                </div>
                <p>Scroll horizontally to see all assessment columns</p>
            </div>
        </div>
    )
}
