"use client"
import { recordPayment } from "@/actions/finance"
import { getStudents } from "@/actions/student"
import { useActionState, useEffect, useState } from "react"
import { toast } from "sonner"

const initialState = { message: "", errors: {}, success: false }

export function PaymentForm() {
  const [state, formAction, isPending] = useActionState(recordPayment, initialState)
  const [students, setStudents] = useState<any[]>([])

  useEffect(() => {
    getStudents().then(result => {
      if (result.success) setStudents(result.students)
    })
  }, [])

  useEffect(() => {
    if (state.success) {
      toast.success(state.message)
    } else if (state.message) {
      toast.error(state.message)
    }
  }, [state])

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Record Payment</h3>
        <form action={formAction} className="space-y-3">
            <div>
                <select name="studentId" className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="">Select Student</option>
                    {students.map(s => (
                        <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                    ))}
                </select>
                {state?.errors?.studentId && <p className="text-red-500 text-xs mt-1">{state.errors.studentId[0]}</p>}
            </div>

            <div>
                <input name="amount" type="number" placeholder="Amount (ETB)" className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                {state?.errors?.amount && <p className="text-red-500 text-xs mt-1">{state.errors.amount[0]}</p>}
            </div>

            <div>
                <select name="method" className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Mobile Money">Mobile Money</option>
                </select>
                {state?.errors?.method && <p className="text-red-500 text-xs mt-1">{state.errors.method[0]}</p>}
            </div>

            <button type="submit" className="w-full bg-primary text-primary-foreground rounded-lg py-2 font-medium hover:bg-primary/90 transition-colors disabled:opacity-50" disabled={isPending}>
                {isPending ? "Recording..." : "Record Payment"}
            </button>
        </form>
    </div>
  )
}
