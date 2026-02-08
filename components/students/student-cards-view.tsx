"use client"

import { Mail, Phone, GraduationCap, MoreVertical, Eye, Pencil, Trash2 } from 'lucide-react'

type Student = {
  id: string
  firstName: string
  lastName: string
  grade: string
  section: string | null
  createdAt: Date
}

export function StudentCardsView({ 
  students,
  onViewStudent,
  onEditStudent,
  onDeleteStudent 
}: { 
  students: Student[]
  onViewStudent: (student: Student) => void
  onEditStudent: (student: Student) => void
  onDeleteStudent: (student: Student) => void
}) {
  if (students.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <GraduationCap className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
        <p className="text-sm font-medium">No students found</p>
        <p className="text-xs text-muted-foreground">Add your first student to get started</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {students.map((student) => (
        <div
          key={student.id}
          className="group relative rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md cursor-pointer"
          onClick={() => onViewStudent(student)}
        >
          {/* Action Menu */}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="relative">
              <button 
                className="p-2 hover:bg-muted rounded-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              <div className="absolute right-0 top-full mt-1 w-48 bg-card border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onViewStudent(student)
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onEditStudent(student)
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteStudent(student)
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>

          {/* Avatar */}
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-bold text-primary">
                {student.firstName[0]}{student.lastName[0]}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{student.firstName} {student.lastName}</h3>
              <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                Active
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <GraduationCap className="h-4 w-4" />
              <span>Grade {student.grade} {student.section && `• Section ${student.section}`}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>student@example.com</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>+251 912 345 678</span>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
            Enrolled: {new Date(student.createdAt).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  )
}
