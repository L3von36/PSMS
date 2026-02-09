"use client"
import { addQuestion } from "@/actions/exam"
import { useActionState, useEffect } from "react"
import { toast } from "sonner"

const initialState = { message: "", errors: {}, success: false }

export function QuestionForm({ exams }: { exams: any[] }) {
  const [state, formAction, isPending] = useActionState(addQuestion, initialState)

  useEffect(() => {
    if (state.success) {
      toast.success(state.message)
    } else if (state.message) {
      toast.error(state.message)
    }
  }, [state])

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Confirm Question Addition</h3>
        <form action={formAction} className="space-y-3">
            <div>
                <select name="examId" className="w-full rounded border p-2 dark:bg-gray-700">
                    <option value="">Select Exam Repository</option>
                    {exams.map(e => (
                            <option key={e.id} value={e.id}>{e.title}</option>
                    ))}
                </select>
                {state?.errors?.examId && <p className="text-red-500 text-xs mt-1">{state.errors.examId[0]}</p>}
            </div>

            <div>
                <textarea name="text" placeholder="Question Text" className="w-full rounded border p-2 dark:bg-gray-700" rows={3} />
                {state?.errors?.text && <p className="text-red-500 text-xs mt-1">{state.errors.text[0]}</p>}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                    <select name="type" className="w-full rounded border p-2 dark:bg-gray-700">
                        <option value="ShortAnswer">Short Answer</option>
                        <option value="MultipleChoice">Multiple Choice</option>
                        <option value="TrueFalse">True/False</option>
                    </select>
                    {state?.errors?.type && <p className="text-red-500 text-xs mt-1">{state.errors.type[0]}</p>}
                </div>
                
                <div>
                    <input name="answer" placeholder="Correct Answer" className="w-full rounded border p-2 dark:bg-gray-700" />
                    {state?.errors?.answer && <p className="text-red-500 text-xs mt-1">{state.errors.answer[0]}</p>}
                </div>
            </div>
            
            <input name="options" placeholder="Options (JSON: e.g. ['A', 'B']) - MCQ Only" className="w-full rounded border p-2 dark:bg-gray-700 text-sm" />

            <button type="submit" className="w-full bg-green-600 text-white rounded py-2 disabled:opacity-50" disabled={isPending}>
                {isPending ? "Adding..." : "Add Question to Bank"}
            </button>
        </form>
    </div>
  )
}
