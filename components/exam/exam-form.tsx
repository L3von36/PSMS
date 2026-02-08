"use client"
import { createExam } from "@/actions/exam"
import { useActionState, useEffect } from "react"
import { toast } from "sonner"

const initialState = { message: "", errors: {}, success: false }

export function ExamForm({ subjects }: { subjects: any[] }) {
  const [state, formAction, isPending] = useActionState(createExam, initialState)

  useEffect(() => {
    if (state.success) {
      toast.success(state.message)
    } else if (state.message) {
      toast.error(state.message)
    }
  }, [state])

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Create New Exam</h3>
        <form action={formAction} className="space-y-3">
            <div>
                <input name="title" placeholder="Exam Title (e.g. Final Exam 2024)" className="w-full rounded border p-2 dark:bg-gray-700" />
                {state?.errors?.title && <p className="text-red-500 text-xs mt-1">{state.errors.title[0]}</p>}
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

            <button type="submit" className="w-full bg-indigo-600 text-white rounded py-2 disabled:opacity-50" disabled={isPending}>
                {isPending ? "Creating..." : "Create Exam Repository"}
            </button>
        </form>
    </div>
  )
}
