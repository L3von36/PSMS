"use client"
import { createStudent } from "@/actions/student"
import { useActionState, useEffect } from "react"
import { toast } from "sonner"
import { UserPlus } from "lucide-react"

import { useState } from "react"
import { StudentPhotoUpload } from "./student-photo-upload"

const initialState = { message: "", errors: {}, success: false }

export function StudentForm() {
  const [state, formAction, isPending] = useActionState(createStudent, initialState)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)

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
        <UserPlus className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Add New Student</h3>
      </div>
      
      <form action={formAction} className="space-y-4">
        <StudentPhotoUpload 
          onUploadSuccess={(url) => setPhotoUrl(url)} 
          currentPhotoUrl={photoUrl}
        />
        <input type="hidden" name="photoUrl" value={photoUrl || ""} />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">First Name</label>
            <input 
              name="firstName" 
              placeholder="John" 
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" 
            />
            {state?.errors?.firstName && <p className="text-red-500 text-xs mt-1">{state.errors.firstName[0]}</p>}
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Last Name</label>
            <input 
              name="lastName" 
              placeholder="Doe" 
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" 
            />
            {state?.errors?.lastName && <p className="text-red-500 text-xs mt-1">{state.errors.lastName[0]}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Grade</label>
            <input 
              name="grade" 
              placeholder="10" 
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" 
            />
            {state?.errors?.grade && <p className="text-red-500 text-xs mt-1">{state.errors.grade[0]}</p>}
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Section</label>
            <input 
              name="section" 
              placeholder="A (optional)" 
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" 
            />
            {state?.errors?.section && <p className="text-red-500 text-xs mt-1">{state.errors.section[0]}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Status</label>
            <select name="status" className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="New">New</option>
                <option value="Returning">Returning</option>
                <option value="Transferred">Transferred</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Email</label>
            <input 
              name="email" 
              type="email"
              placeholder="john@example.com" 
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" 
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground mb-1 block">Enrollment History / Prev. School</label>
          <textarea 
            name="enrollmentHistory" 
            placeholder="Details about previous academic performance or school..." 
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px]" 
          />
        </div>

        <div className="p-4 rounded-lg border bg-muted/30 space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
                <input name="isNationalExamCandidate" type="checkbox" className="rounded border-gray-300" />
                <span className="text-sm font-medium">National Exam Candidate (Grade 8 / 12)</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Exam Registration ID</label>
                <input name="nationalExamId" placeholder="ID Number" className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Previous Result (if any)</label>
                <input name="nationalExamResult" type="number" step="0.01" placeholder="Result" className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>
        </div>

        <button 
          type="submit" 
          className="w-full bg-primary text-primary-foreground rounded-lg py-2.5 font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2" 
          disabled={isPending}
        >
          {isPending ? "Adding..." : (
            <>
              <UserPlus className="h-4 w-4" />
              Add Student
            </>
          )}
        </button>
      </form>
    </div>
  )
}
