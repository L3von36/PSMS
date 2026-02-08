"use client"

import { useState, useMemo } from "react"
import { bulkRecordGrades } from "@/actions/grading"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { calculateEthiopianLetter } from "@/lib/utils"
import { Check, Loader2, Save, Users, Tags, Plus } from "lucide-react"

export function BulkGradeEntry({ students, subjects }: { students: any[], subjects: any[] }) {
    const [selectedGrade, setSelectedGrade] = useState<string>("")
    const [selectedSection, setSelectedSection] = useState<string>("")
    const [selectedSubject, setSelectedSubject] = useState<string>("")
    const [category, setCategory] = useState<string>("Quiz")
    const [addedCategories, setAddedCategories] = useState<string[]>([])
    const [customCategory, setCustomCategory] = useState<string>("")
    const [term, setTerm] = useState<string>("Semester 1")
    const [maxScore, setMaxScore] = useState<string>("100")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [scores, setScores] = useState<Record<string, string>>({})

    // Filter students by grade and section
    const roster = useMemo(() => {
        if (!selectedGrade || !selectedSection) return []
        return students.filter(s => s.grade === selectedGrade && s.section === selectedSection)
    }, [students, selectedGrade, selectedSection])

    // Get unique grades and sections from students
    const gradesList = useMemo(() => Array.from(new Set(students.map(s => s.grade))).sort(), [students])
    const sectionsList = useMemo(() => {
        if (!selectedGrade) return []
        return Array.from(new Set(students.filter(s => s.grade === selectedGrade).map(s => s.section))).sort()
    }, [students, selectedGrade])

    const handleScoreChange = (studentId: string, value: string) => {
        const outOfNum = parseFloat(maxScore) || 100
        if (value === "" || (!isNaN(parseFloat(value)) && parseFloat(value) <= outOfNum)) {
            setScores(prev => ({ ...prev, [studentId]: value }))
        }
    }

    const handleAddCategory = () => {
        if (!customCategory.trim()) return toast.error("Enter a category name first")
        if (addedCategories.includes(customCategory.trim())) return toast.error("Category already in list")
        
        const newCat = customCategory.trim()
        setAddedCategories(prev => [...prev, newCat])
        setCategory(newCat)
        setCustomCategory("")
        toast.success(`"${newCat}" added to session categories`)
    }

    const handleSubmit = async () => {
        if (!selectedSubject) return toast.error("Please select a subject")
        if (roster.length === 0) return toast.error("No students found in this roster")
        
        const finalCategory = category === "Other" ? customCategory : category
        if (!finalCategory) return toast.error("Please specify a category")

        const gradesToSave = Object.entries(scores)
            .filter(([_, score]) => score !== "")
            .map(([id, score]) => ({
                studentId: id,
                score: parseFloat(score)
            }))

        if (gradesToSave.length === 0) return toast.error("No scores entered")

        setIsSubmitting(true)
        try {
            const result = await bulkRecordGrades({
                grades: gradesToSave,
                subjectId: selectedSubject,
                category: finalCategory as any,
                outOf: parseFloat(maxScore) || 100,
                term
            })

            if (result.success) {
                toast.success(result.message)
                setScores({}) // Clear form
                if (category === "Other") setCustomCategory("")
            } else {
                toast.error(result.message)
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to record grades")
        } finally {
            setIsSubmitting(false)
        }
    }

    const defaultCategories = ["Quiz", "Assignment", "Group Work", "Classwork", "Midterm", "Final"]

    return (
        <Card className="border-none shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 overflow-hidden">
            <CardHeader className="bg-white/50 dark:bg-slate-900/50 border-b">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            Bulk Grade Entry
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">Record assessments for an entire class</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mt-4">
                    <Select value={selectedGrade} onValueChange={(v) => { setSelectedGrade(v); setSelectedSection(""); }}>
                        <SelectTrigger className="bg-white dark:bg-slate-900">
                            <SelectValue placeholder="Grade" />
                        </SelectTrigger>
                        <SelectContent>
                            {gradesList.map(g => (
                                <SelectItem key={g} value={g}>Grade {g}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={selectedSection} onValueChange={setSelectedSection}>
                        <SelectTrigger className="bg-white dark:bg-slate-900">
                            <SelectValue placeholder="Section" />
                        </SelectTrigger>
                        <SelectContent>
                            {sectionsList.map(s => (
                                <SelectItem key={s} value={s}>Section {s}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                        <SelectTrigger className="bg-white dark:bg-slate-900">
                            <SelectValue placeholder="Subject" />
                        </SelectTrigger>
                        <SelectContent>
                            {subjects.map(s => (
                                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className="flex flex-col gap-1 col-span-2 md:col-span-1">
                        <Select value={category} onValueChange={(v: any) => setCategory(v)}>
                            <SelectTrigger className="bg-white dark:bg-slate-900">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                {defaultCategories.map(cat => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                                {addedCategories.map(cat => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                                <SelectItem value="Other">Other (Custom)</SelectItem>
                            </SelectContent>
                        </Select>
                        {category === "Other" && (
                            <div className="flex items-center gap-1 mt-1">
                                <Input 
                                    placeholder="Name..." 
                                    value={customCategory} 
                                    onChange={(e) => setCustomCategory(e.target.value)}
                                    className="h-7 text-xs flex-1"
                                />
                                <Button 
                                    size="icon" 
                                    variant="secondary" 
                                    className="h-7 w-7"
                                    onClick={handleAddCategory}
                                    title="Add to list"
                                >
                                    <Plus className="h-3 w-3" />
                                </Button>
                            </div>
                        )}
                    </div>

                    <Select value={term} onValueChange={setTerm}>
                        <SelectTrigger className="bg-white dark:bg-slate-900">
                            <SelectValue placeholder="Term" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Semester 1">Semester 1</SelectItem>
                            <SelectItem value="Semester 2">Semester 2</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase px-1">Max Score</span>
                        <Input 
                            type="number" 
                            value={maxScore} 
                            onChange={(e) => setMaxScore(e.target.value)}
                            className="h-10 bg-white dark:bg-slate-900 font-bold"
                            placeholder="Total..."
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {roster.length === 0 ? (
                    <div className="py-20 text-center border-b border-dashed">
                        <Users className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
                        <h3 className="mt-4 text-lg font-semibold text-slate-400">Select a Class to Load Roster</h3>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-100 dark:bg-slate-800/50">
                                <tr>
                                    <th className="px-6 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Student Name</th>
                                    <th className="px-6 py-3 text-center font-semibold text-slate-600 dark:text-slate-300 w-32">Score (100)</th>
                                    <th className="px-6 py-3 text-center font-semibold text-slate-600 dark:text-slate-300 w-24">Letter</th>
                                    <th className="px-6 py-3 text-right font-semibold text-slate-600 dark:text-slate-300">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {roster.map(s => {
                                    const scoreValue = scores[s.id] || ""
                                    const scoreNum = parseFloat(scoreValue)
                                    const letter = scoreValue ? calculateEthiopianLetter(scoreNum) : "-"
                                    const hasValue = scoreValue !== ""

                                    return (
                                        <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                                            <td className="px-6 py-4 font-medium">
                                                {s.firstName} {s.lastName}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <Input
                                                    type="number"
                                                    value={scoreValue}
                                                    onChange={(e) => handleScoreChange(s.id, e.target.value)}
                                                    className="w-24 mx-auto text-center font-bold"
                                                    placeholder="0.0"
                                                />
                                                <p className="text-[10px] text-muted-foreground mt-1">out of {maxScore}</p>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`font-bold ${
                                                    letter.startsWith('A') ? 'text-green-600' : 
                                                    letter.startsWith('B') ? 'text-blue-600' :
                                                    letter.startsWith('F') ? 'text-red-600' : 'text-slate-600'
                                                }`}>
                                                    {letter}
                                                </span>
                                                <p className="text-[10px] text-muted-foreground mt-1">
                                                    {scoreValue ? `${((scoreNum / (parseFloat(maxScore) || 100)) * 100).toFixed(1)}%` : "-"}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {hasValue && (
                                                    <span className="flex items-center justify-end gap-1 text-xs text-green-600 font-medium">
                                                        <Check className="h-3 w-3" /> Ready
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
                
                {roster.length > 0 && (
                    <div className="p-6 bg-slate-50/50 dark:bg-slate-900/30 border-t flex items-center justify-between">
                        <p className="text-sm text-muted-foreground italic">
                            Letters are shown as estimated performance for this component.
                        </p>
                        <Button 
                            className="w-40" 
                            disabled={isSubmitting || Object.keys(scores).length === 0}
                            onClick={handleSubmit}
                        >
                            {isSubmitting ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                            ) : (
                                <><Save className="mr-2 h-4 w-4" /> Save Grades</>
                            )}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
