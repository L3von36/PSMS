"use client"

import { sendCommunication } from "@/actions/parent"
import { useActionState, useEffect, useState } from "react"
import { toast } from "sonner"
import { X } from 'lucide-react'

const initialState = { message: "", success: false }

type Parent = {
  id: string
  firstName: string
  lastName: string
  students: { firstName: string; lastName: string }[]
}

export function SendMessageModal({ 
  parents, 
  onClose 
}: { 
  parents: Parent[]
  onClose: () => void
}) {
  const [state, formAction, isPending] = useActionState(sendCommunication, initialState)
  const [selectedParents, setSelectedParents] = useState<string[]>([])

  useEffect(() => {
    if (state.success) {
      toast.success(state.message)
      onClose()
    } else if (state.message) {
      toast.error(state.message)
    }
  }, [state, onClose])

  const toggleParent = (parentId: string) => {
    setSelectedParents(prev =>
      prev.includes(parentId)
        ? prev.filter(id => id !== parentId)
        : [...prev, parentId]
    )
  }

  const selectAll = () => {
    setSelectedParents(parents.map(p => p.id))
  }

  const clearAll = () => {
    setSelectedParents([])
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold">Send Message to Parents</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form action={formAction} className="flex-1 overflow-y-auto p-6 space-y-4">
          <input type="hidden" name="parentIds" value={JSON.stringify(selectedParents)} />

          <div>
            <label className="block text-sm font-medium mb-1">Message Type</label>
            <select name="type" className="w-full rounded-lg border bg-background px-3 py-2" required defaultValue="Telegram">
              <option value="Telegram">Telegram</option>
              <option value="In-App">In-App Notification</option>
              <option value="SMS">SMS</option>
              <option value="Email">Email</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Subject (Optional)</label>
            <input
              name="subject"
              placeholder="Message subject"
              className="w-full rounded-lg border bg-background px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea
              name="content"
              rows={4}
              placeholder="Type your message here..."
              className="w-full rounded-lg border bg-background px-3 py-2"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Recipients ({selectedParents.length} selected)</label>
              <div className="flex gap-2">
                <button type="button" onClick={selectAll} className="text-xs text-blue-600 hover:underline">
                  Select All
                </button>
                <button type="button" onClick={clearAll} className="text-xs text-red-600 hover:underline">
                  Clear All
                </button>
              </div>
            </div>
            <div className="border rounded-lg p-4 max-h-60 overflow-y-auto space-y-2">
              {parents.map(parent => (
                <label key={parent.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedParents.includes(parent.id)}
                    onChange={() => toggleParent(parent.id)}
                    className="rounded border-gray-300"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{parent.firstName} {parent.lastName}</p>
                    {parent.students.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {parent.students.map(s => `${s.firstName} ${s.lastName}`).join(', ')}
                      </p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending || selectedParents.length === 0}
            className="w-full bg-green-600 text-white rounded-lg py-2 font-medium disabled:opacity-50 hover:bg-green-700 transition-colors"
          >
            {isPending ? "Sending..." : `Send to ${selectedParents.length} Parent(s)`}
          </button>
        </form>
      </div>
    </div>
  )
}
