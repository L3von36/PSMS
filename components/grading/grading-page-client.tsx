"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Plus } from 'lucide-react'
import { EnhancedGradeTable } from '@/components/grading/enhanced-grade-table'
import { GradeDetailModal } from '@/components/grading/grade-detail-modal'
import { GradeStatsCards } from '@/components/grading/grade-stats-cards'
import { GradeFilters } from '@/components/grading/grade-filters'
import { SubjectForm } from '@/components/grading/subject-form'
import { GradeForm } from '@/components/grading/grade-form'
import { BulkGradeEntry } from "./bulk-grade-entry"
import { GradebookSheet } from "./gradebook-sheet"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { LayoutGrid, List, FileText } from 'lucide-react'
import { Grade } from "@/types/grading"
import { calculateEthiopianLetter } from "@/lib/utils" 
import { toast } from 'sonner' // Added toast import
import { exportToCSV } from "@/lib/export-utils"
import { CommunicationModal } from "./communication-modal"



type Subject = {
  id: string
  name: string
  gradeLevel: string
}

export function GradingPageClient({ 
  grades,
  subjects,
  students
}: { 
  grades: Grade[]
  subjects: Subject[]
  students: any[]
}) {
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null)
  const [showAddSubject, setShowAddSubject] = useState(false)
  const [showAddGrade, setShowAddGrade] = useState(false)
  const [activeView, setActiveView] = useState<'view' | 'bulk'>('view')
  const [viewMode, setViewMode] = useState<'list' | 'sheet'>('sheet')
  
  // Communication Modal State
  const [commModal, setCommModal] = useState<{
    isOpen: boolean
    studentName: string
    initialMessage: string
  }>({
    isOpen: false,
    studentName: '',
    initialMessage: ''
  })
  const [filteredGrades, setFilteredGrades] = useState(grades)

  // Calculate stats based on percentage
  const percentages = grades.map(g => (g.score / (g.outOf || 100)) * 100)
  
  const avgScore = percentages.length > 0 
    ? percentages.reduce((sum, p) => sum + p, 0) / percentages.length 
    : 0
  const highestScore = percentages.length > 0 
    ? Math.max(...percentages) 
    : 0
  const lowestScore = percentages.length > 0 
    ? Math.min(...percentages) 
    : 0

  const stats = {
    avgScore,
    totalGrades: grades.length,
    highestScore,
    lowestScore,
  }

  // Get unique subjects, terms, and categories from records
  const subjectNames = Array.from(new Set(grades.map(g => g.subject.name)))
  const terms = Array.from(new Set(grades.map(g => g.term)))
  const categories = Array.from(new Set(grades.map(g => g.category)))

  const handleFilterChange = (filters: any) => {
    let filtered = grades

    if (filters.subject) {
      filtered = filtered.filter(g => g.subject.name === filters.subject)
    }
    if (filters.term) {
      filtered = filtered.filter(g => g.term === filters.term)
    }
    if (filters.category) {
      filtered = filtered.filter(g => g.category === filters.category)
    }
    if (filters.scoreRange) {
      const ranges: Record<string, [number, number]> = {
        'A': [90, 100],
        'B': [75, 89],
        'C': [60, 74],
        'D': [50, 59],
        'F': [0, 49],
      }
      const [min, max] = ranges[filters.scoreRange] || [0, 100]
      filtered = filtered.filter(g => g.score >= min && g.score <= max)
    }

    setFilteredGrades(filtered)
  }

  const handleViewGrade = (grade: Grade) => {
    setSelectedGrade(grade)
  }

  const handleEditGrade = (grade: Grade) => {
    console.log('Edit grade:', grade)
  }

  const handleDeleteGrade = (grade: Grade) => {
    console.log('Delete grade:', grade)
  }

  const handleExport = () => {
    const exportData = filteredGrades.map(g => ({
      Student: `${g.student.firstName} ${g.student.lastName}`,
      Subject: g.subject.name,
      Category: g.category,
      Term: g.term,
      Score: g.score,
      OutOf: g.outOf || 100,
      Percentage: `${((g.score / (g.outOf || 100)) * 100).toFixed(1)}%`,
      Date: new Date(g.createdAt).toLocaleDateString()
    }))
    
    exportToCSV(exportData, `Grades_Export_${new Date().toISOString().split('T')[0]}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Grading Center</h2>
          <Tabs value={activeView} onValueChange={(v: any) => setActiveView(v)} className="mt-2">
            <TabsList className="bg-slate-100 dark:bg-slate-900 border">
              <TabsTrigger value="view">View Records</TabsTrigger>
              <TabsTrigger value="bulk">Bulk Entry Mode</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {activeView === 'bulk' && (
          <BulkGradeEntry students={students} subjects={subjects} />
      )}

      {activeView === 'view' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Stats Cards */}
            <GradeStatsCards stats={stats} />

            {/* View Mode & Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 bg-white dark:bg-slate-950 p-1 rounded-lg border shadow-sm">
                <Button 
                  variant={viewMode === 'sheet' ? 'default' : 'ghost'} 
                  size="sm" 
                  onClick={() => setViewMode('sheet')}
                  className="flex items-center gap-2 h-8 px-3"
                >
                  <LayoutGrid className="h-4 w-4" />
                  <span className="hidden sm:inline">Spreadsheet</span>
                </Button>
                <Button 
                  variant={viewMode === 'list' ? 'default' : 'ghost'} 
                  size="sm" 
                  onClick={() => setViewMode('list')}
                  className="flex items-center gap-2 h-8 px-3"
                >
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline">Log View</span>
                </Button>
              </div>

              <GradeFilters
                  onFilterChange={handleFilterChange}
                  subjects={subjectNames}
                  terms={terms}
                  categories={categories}
              />
            </div>

            {/* Content Mode */}
            {viewMode === 'sheet' ? (
              <GradebookSheet 
                  grades={filteredGrades} 
                  students={students} 
                  onOpenCommunication={(name, msg) => setCommModal({ isOpen: true, studentName: name, initialMessage: msg })}
              />
            ) : (
              <EnhancedGradeTable
                  grades={filteredGrades}
                  onViewGrade={handleViewGrade}
                  onEditGrade={handleEditGrade}
                  onDeleteGrade={handleDeleteGrade}
                  onOpenCommunication={(name: string, msg: string) => setCommModal({ isOpen: true, studentName: name, initialMessage: msg })}
              />
            )}

            {/* Tools (Secondary) */}
            <div className="grid gap-6 md:grid-cols-2 mt-8 opacity-60 hover:opacity-100 transition-opacity">
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Subjects Inventory</h3>
                    <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddSubject(!showAddSubject)}
                    className="flex items-center gap-2 text-primary"
                    >
                    <Plus className="h-3 w-3" />
                    {showAddSubject ? 'Close' : 'Add Subject'}
                    </Button>
                </div>
                {showAddSubject && <SubjectForm />}
                </div>

                <div className="rounded-xl border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        Single Entry
                    </h3>
                    <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowAddGrade(!showAddGrade)}
                    >
                    {showAddGrade ? 'Hide Form' : 'Show Form'}
                    </Button>
                </div>
                {showAddGrade && <GradeForm students={students} subjects={subjects} />}
                </div>
            </div>
          </motion.div>
      )}

      {/* Grade Detail Modal */}
      <GradeDetailModal
        grade={selectedGrade}
        onClose={() => setSelectedGrade(null)}
      />

      <CommunicationModal 
        isOpen={commModal.isOpen}
        onClose={() => setCommModal({ ...commModal, isOpen: false })}
        studentName={commModal.studentName}
        initialMessage={commModal.initialMessage}
      />
    </div>
  )
}
