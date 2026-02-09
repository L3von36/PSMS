"use client"

import { useState } from 'react'
import { Download, Upload, Plus, LayoutGrid, LayoutList } from 'lucide-react'
import { EnhancedStudentTable } from '@/components/students/enhanced-student-table'
import { StudentCardsView } from '@/components/students/student-cards-view'
import { StudentDetailModal } from '@/components/students/student-detail-modal'
import { StudentStatsCards } from '@/components/students/student-stats-cards'
import { StudentFilters } from '@/components/students/student-filters'
import { StudentForm } from '@/components/student-form'
import { ImportStudentsDialog } from '@/components/students/import-students-dialog'
import Papa from 'papaparse'
import { toast } from 'sonner'


type Student = {
  id: string
  firstName: string
  lastName: string
  grade: string
  section: string | null
  photoUrl?: string | null
  email?: string | null
  phone?: string | null
  status?: string
  enrollmentHistory?: string | null
  grades?: any[]
  attendances?: any[]
  createdAt: Date
}

type ViewMode = 'table' | 'cards'

export function StudentPageClient({ students, initialStudentId }: { students: Student[], initialStudentId?: string }) {
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(() => {
    if (initialStudentId) {
        return students.find(s => s.id === initialStudentId) || null
    }
    return null
  })
  const [showAddForm, setShowAddForm] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [filteredStudents, setFilteredStudents] = useState(students)

  // Calculate stats
  const stats = {
    total: students.length,
    active: students.filter(s => s.status !== 'Transferred').length,
    newThisMonth: students.filter(s => s.status === 'New').length,
    avgAge: 14 // Mock average age
  }

  // Get unique grades and sections
  const grades = Array.from(new Set(students.map(s => s.grade))).sort()
  const sections = Array.from(new Set(students.map(s => s.section).filter(Boolean) as string[])).sort()

  const handleFilterChange = (filters: any) => {
    let filtered = students

    if (filters.grade) {
      filtered = filtered.filter(s => s.grade === filters.grade)
    }
    if (filters.section) {
      filtered = filtered.filter(s => s.section === filters.section)
    }
    // Status filter would go here in real implementation

    setFilteredStudents(filtered)
  }

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student)
  }

  const handleEditStudent = (student: Student) => {
    // In real app, open edit form
    console.log('Edit student:', student)
  }

  const handleDeleteStudent = (student: Student) => {
    // In real app, show confirmation dialog
    console.log('Delete student:', student)
  }

  const handleExport = () => {
    const dataToExport = filteredStudents.map(({ id, createdAt, photoUrl, ...rest }) => rest)
    const csv = Papa.unparse(dataToExport)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `students_export_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    toast.success('Students exported successfully')
  }

  const handleImport = () => {
    setShowImportDialog(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Students</h2>
          <p className="text-muted-foreground">Manage student enrollments and information</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleImport}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted transition-colors"
          >
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Import</span>
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted transition-colors"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Student</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <StudentStatsCards stats={stats} />

      {/* Add Student Form (Collapsible) */}
      {showAddForm && (
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Add New Student</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>
          <StudentForm />
        </div>
      )}

      {/* Filters and View Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <StudentFilters
          onFilterChange={handleFilterChange}
          grades={grades}
          sections={sections}
        />
        
        <div className="flex items-center gap-1 rounded-lg border p-1">
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
              viewMode === 'table'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <LayoutList className="h-4 w-4" />
            <span className="text-sm">Table</span>
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
              viewMode === 'cards'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="text-sm">Cards</span>
          </button>
        </div>
      </div>

      {/* Student List */}
      {viewMode === 'table' ? (
        <EnhancedStudentTable
          students={filteredStudents}
          onViewStudent={handleViewStudent}
          onEditStudent={handleEditStudent}
          onDeleteStudent={handleDeleteStudent}
        />
      ) : (
        <StudentCardsView
          students={filteredStudents}
          onViewStudent={handleViewStudent}
          onEditStudent={handleEditStudent}
          onDeleteStudent={handleDeleteStudent}
        />
      )}

      {/* Student Detail Modal */}
      <StudentDetailModal
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
      />

      {/* Import Dialog */}
      {showImportDialog && (
        <ImportStudentsDialog onClose={() => setShowImportDialog(false)} />
      )}
    </div>
  )
}
