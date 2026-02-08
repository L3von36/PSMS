"use client"
import { recordGrade } from "@/actions/grading"
import { useActionState, useEffect, useState } from "react"
import { toast } from "sonner"

const initialState = { message: "", errors: {}, success: false }

export function GradeForm({ students, subjects }: { students: any[], subjects: any[] }) {
  const [state, formAction, isPending] = useActionState(recordGrade, initialState)
  const [category, setCategory] = useState("Quiz")
  const [addedCategories, setAddedCategories] = useState<string[]>([])
  const [customCategory, setCustomCategory] = useState("")

  useEffect(() => {
    if (state.success) {
      toast.success(state.message)
      setCustomCategory("")
    } else if (state.message) {
      toast.error(state.message)
    }
  }, [state])

  const handleAddCategory = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!customCategory.trim()) return toast.error("Enter a category name first")
    if (addedCategories.includes(customCategory.trim())) return toast.error("Category already in list")
    
    const newCat = customCategory.trim()
    setAddedCategories(prev => [...prev, newCat])
    setCategory(newCat)
    setCustomCategory("")
    toast.success(`"${newCat}" added to list`)
  }

  const defaultCategories = [
    { value: "Quiz", label: "Quiz" },
    { value: "Assignment", label: "Assignment" },
    { value: "Group Work", label: "Group Work / Project" },
    { value: "Classwork", label: "Classwork / Participation" },
    { value: "Midterm", label: "Midterm Exam" },
    { value: "Final", label: "Final Exam" },
  ]

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Enter Student Grade</h3>
        <form action={formAction} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <select name="studentId" className="w-full rounded border p-2 dark:bg-gray-700">
                        <option value="">Select Student</option>
                        {students?.map((s: any) => (
                            <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                        ))}
                    </select>
                    {state?.errors?.studentId && <p className="text-red-500 text-xs mt-1">{state.errors.studentId[0]}</p>}
                </div>
                
                <div>
                     <select name="subjectId" className="w-full rounded border p-2 dark:bg-gray-700">
                        <option value="">Select Subject</option>
                        {subjects.map(s => (
                            <option key={s.id} value={s.id}>{s.name} (Gr {s.gradeLevel})</option>
                        ))}
                    </select>
                    {state?.errors?.subjectId && <p className="text-red-500 text-xs mt-1">{state.errors.subjectId[0]}</p>}
                </div>
            </div>
           
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <select 
                        name="category" 
                        value={category} 
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full rounded border p-2 dark:bg-gray-700"
                    >
                        {defaultCategories.map(cat => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                        {addedCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                        <option value="Other">Other (Custom)</option>
                    </select>
                    {category === "Other" && (
                        <div className="flex gap-1 mt-2">
                            <input 
                                name="customCategory" 
                                type="text" 
                                value={customCategory}
                                onChange={(e) => setCustomCategory(e.target.value)}
                                placeholder="Specify category..." 
                                className="flex-1 rounded border p-2 dark:bg-gray-700 text-sm"
                            />
                            <button 
                                onClick={handleAddCategory}
                                className="px-3 bg-secondary text-secondary-foreground rounded border hover:bg-secondary/80 text-lg font-bold"
                                title="Add to list"
                            >
                                +
                            </button>
                        </div>
                    )}
                    {state?.errors?.category && <p className="text-red-500 text-xs mt-1">{state.errors.category[0]}</p>}
                </div>
                
                <div>
                    <select name="term" className="w-full rounded border p-2 dark:bg-gray-700">
                        <option value="">Select Term</option>
                        <option value="Semester 1">Semester 1</option>
                        <option value="Semester 2">Semester 2</option>
                    </select>
                    {state?.errors?.term && <p className="text-red-500 text-xs mt-1">{state.errors.term[0]}</p>}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
                <div>
                    <input name="score" type="number" step="0.1" placeholder="Score" className="w-full rounded border p-2 dark:bg-gray-700 font-bold" />
                    {state?.errors?.score && <p className="text-red-500 text-xs mt-1">{state.errors.score[0]}</p>}
                </div>
                <div>
                    <input name="outOf" type="number" defaultValue="100" placeholder="Out Of" className="w-full rounded border p-2 dark:bg-gray-700" title="Total Marks" />
                    {state?.errors?.outOf && <p className="text-red-500 text-xs mt-1">{state.errors.outOf[0]}</p>}
                </div>
                <div>
                    <input name="academicYear" type="text" defaultValue="2017 E.C." placeholder="Academic Year" className="w-full rounded border p-2 dark:bg-gray-700" />
                    {state?.errors?.academicYear && <p className="text-red-500 text-xs mt-1">{state.errors.academicYear[0]}</p>}
                </div>
            </div>

            <button type="submit" className="w-full bg-green-600 text-white rounded py-2 disabled:opacity-50" disabled={isPending}>
                {isPending ? "Submitting..." : "Submit Grade"}
            </button>
        </form>
    </div>
  )
}
