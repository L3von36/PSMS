"use client"

import { createParent, updateParent } from "@/actions/parent"
import { useActionState, useEffect, useState } from "react"
import { toast } from "sonner"

const initialState = { message: "", errors: {}, success: false }

type Student = {
  id: string
  firstName: string
  lastName: string
  grade: string
  section: string | null
}

type Parent = {
  id: string
  firstName: string
  lastName: string
  phone: string
  secondaryPhone?: string | null
  email?: string | null
  whatsapp?: string | null
  telegram?: string | null
  occupation?: string | null
  employer?: string | null
  nationalId?: string | null
  isEmergencyContact: boolean
  address?: string | null
  students: { id: string }[]
}

export function ParentForm({ 
  students, 
  parent,
  onSuccess 
}: { 
  students: Student[]
  parent?: Parent | null
  onSuccess?: () => void
}) {
  const [state, formAction, isPending] = useActionState(
    parent ? updateParent : createParent, 
    initialState
  )
  const [selectedStudents, setSelectedStudents] = useState<string[]>(
    parent?.students.map(s => s.id) || []
  )

  useEffect(() => {
    if (state.success) {
      toast.success(state.message)
      onSuccess?.()
    } else if (state.message) {
      toast.error(state.message)
    }
  }, [state, onSuccess])

  const toggleStudent = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  return (
    <form action={formAction} className="space-y-4">
      {parent && <input type="hidden" name="parentId" value={parent.id} />}
      <input type="hidden" name="studentIds" value={JSON.stringify(selectedStudents)} />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">First Name</label>
          <input
            name="firstName"
            defaultValue={parent?.firstName}
            className="w-full rounded-lg border bg-background px-3 py-2"
            required
          />
          {state?.errors?.firstName && <p className="text-red-500 text-xs mt-1">{state.errors.firstName[0]}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Last Name</label>
          <input
            name="lastName"
            defaultValue={parent?.lastName}
            className="w-full rounded-lg border bg-background px-3 py-2"
            required
          />
          {state?.errors?.lastName && <p className="text-red-500 text-xs mt-1">{state.errors.lastName[0]}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Primary Phone</label>
          <input
            name="phone"
            defaultValue={parent?.phone}
            placeholder="+251-91-234-5678"
            className="w-full rounded-lg border bg-background px-3 py-2"
            required
          />
          {state?.errors?.phone && <p className="text-red-500 text-xs mt-1">{state.errors.phone[0]}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Secondary Phone</label>
          <input
            name="secondaryPhone"
            defaultValue={parent?.secondaryPhone || ""}
            placeholder="Optional"
            className="w-full rounded-lg border bg-background px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          name="email"
          type="email"
          defaultValue={parent?.email || ""}
          placeholder="parent@example.com"
          className="w-full rounded-lg border bg-background px-3 py-2"
        />
        <p className="text-xs text-muted-foreground mt-1">Optional - Creates parent portal account if provided</p>
        {state?.errors?.email && <p className="text-red-500 text-xs mt-1">{state.errors.email[0]}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">WhatsApp</label>
          <input
            name="whatsapp"
            defaultValue={parent?.whatsapp || ""}
            placeholder="+251-91-234-5678"
            className="w-full rounded-lg border bg-background px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Telegram</label>
          <input
            name="telegram"
            defaultValue={parent?.telegram || ""}
            placeholder="@username"
            className="w-full rounded-lg border bg-background px-3 py-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Occupation</label>
          <input
            name="occupation"
            defaultValue={parent?.occupation || ""}
            placeholder="e.g., Teacher, Engineer"
            className="w-full rounded-lg border bg-background px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Employer</label>
          <input
            name="employer"
            defaultValue={parent?.employer || ""}
            placeholder="Company/Organization"
            className="w-full rounded-lg border bg-background px-3 py-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">National ID</label>
          <input
            name="nationalId"
            defaultValue={parent?.nationalId || ""}
            placeholder="ID Number"
            className="w-full rounded-lg border bg-background px-3 py-2"
          />
        </div>
        <div className="flex items-center pt-8">
          <input
            type="checkbox"
            name="isEmergencyContact"
            defaultChecked={parent?.isEmergencyContact}
            value="true"
            className="rounded border-gray-300 mr-2"
          />
          <label className="text-sm font-medium">Emergency Contact</label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Address</label>
        <textarea
          name="address"
          defaultValue={parent?.address || ""}
          rows={2}
          placeholder="Home address"
          className="w-full rounded-lg border bg-background px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Linked Students</label>
        <div className="border rounded-lg p-4 max-h-60 overflow-y-auto space-y-2">
          {students.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No students available</p>
          ) : (
            students.map(student => (
              <label key={student.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedStudents.includes(student.id)}
                  onChange={() => toggleStudent(student.id)}
                  className="rounded border-gray-300"
                />
                <div className="flex-1">
                  <p className="font-medium">{student.firstName} {student.lastName}</p>
                  <p className="text-xs text-muted-foreground">Grade {student.grade}{student.section ? `-${student.section}` : ''}</p>
                </div>
              </label>
            ))
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">Select all children of this parent</p>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-primary text-primary-foreground rounded-lg py-2 font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors"
      >
        {isPending ? (parent ? "Updating..." : "Creating...") : (parent ? "Update Parent" : "Create Parent")}
      </button>
    </form>
  )
}
