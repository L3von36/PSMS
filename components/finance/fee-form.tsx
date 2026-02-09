"use client"
import { createFeeStructure } from "@/actions/finance"
import { useActionState, useEffect } from "react"
import { toast } from "sonner"
import { DollarSign } from "lucide-react"

const initialState = { message: "", errors: {}, success: false }

export function FeeForm() {
  const [state, formAction, isPending] = useActionState(createFeeStructure, initialState)

  useEffect(() => {
    if (state.success) {
      toast.success(state.message)
    } else if (state.message) {
      toast.error(state.message)
    }
  }, [state])

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Create Fee Structure</h3>
      </div>
      
      <form action={formAction} className="space-y-3">
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-1 block">Fee Name</label>
          <input 
            name="name" 
            placeholder="e.g. Tuition Fee" 
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" 
          />
          {state?.errors?.name && <p className="text-red-500 text-xs mt-1">{state.errors.name[0]}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Amount (ETB)</label>
            <input 
              name="amount" 
              type="number" 
              placeholder="5000" 
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" 
            />
            {state?.errors?.amount && <p className="text-red-500 text-xs mt-1">{state.errors.amount[0]}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Grade Level</label>
            <input 
              name="gradeLevel" 
              placeholder="10" 
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" 
            />
            {state?.errors?.gradeLevel && <p className="text-red-500 text-xs mt-1">{state.errors.gradeLevel[0]}</p>}
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full bg-primary text-primary-foreground rounded-lg py-2 font-medium hover:bg-primary/90 transition-colors disabled:opacity-50" 
          disabled={isPending}
        >
          {isPending ? "Creating..." : "Create Fee Structure"}
        </button>
      </form>
    </div>
  )
}
