"use client"

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { EnhancedExamTable } from '@/components/exams/enhanced-exam-table'
import { ExamStatsCards } from '@/components/exams/exam-stats-cards'
import { ExamForm } from '@/components/exam/exam-form'
import { QuestionForm } from '@/components/exam/question-form'
import { ExamDetailModal } from '@/components/exams/exam-detail-modal'

type Exam = {
  id: string
  title: string
  duration: number
  createdAt: Date
  subject: {
    name: string
  }
  questions: any[]
}

type Question = {
  id: string
  text: string
  type: string
  options?: string | null
  answer: string
}

export function ExamsPageClient({ 
  exams,
  questions,
  subjects 
}: { 
  exams: Exam[]
  questions: Question[]
  subjects: any[]
}) {
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
  const [showAddExam, setShowAddExam] = useState(false)
  const [showAddQuestion, setShowAddQuestion] = useState(false)

  // Calculate stats
  const stats = {
    totalExams: exams.length,
    activeExams: exams.length, // Mock - all active
    totalQuestions: questions.length,
    avgDuration: exams.length > 0 
      ? Math.round(exams.reduce((sum, e) => sum + e.duration, 0) / exams.length)
      : 0,
  }

  const handleViewExam = (exam: Exam) => {
    setSelectedExam(exam)
  }

  const handleEditExam = (exam: Exam) => {
    console.log('Edit exam:', exam)
  }

  const handleDeleteExam = (exam: Exam) => {
    console.log('Delete exam:', exam)
  }

  const handleDuplicateExam = (exam: Exam) => {
    console.log('Duplicate exam:', exam)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Exams</h2>
          <p className="text-muted-foreground">Manage exams and question bank</p>
        </div>
      </div>

      {/* Stats Cards */}
      <ExamStatsCards stats={stats} />

      {/* Forms Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Create Exam</h3>
            <button
              onClick={() => setShowAddExam(!showAddExam)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              <Plus className="h-3 w-3" />
              {showAddExam ? 'Hide' : 'Show'} Form
            </button>
          </div>
          {showAddExam && <ExamForm subjects={subjects} />}
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Question Bank</h3>
            <button
              onClick={() => setShowAddQuestion(!showAddQuestion)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              <Plus className="h-3 w-3" />
              Add Question
            </button>
          </div>
          {showAddQuestion && <QuestionForm exams={exams} />}
          {!showAddQuestion && questions.length > 0 && (
            <div className="space-y-2 mt-4">
              {questions.slice(0, 3).map((q) => (
                <div key={q.id} className="p-3 rounded-lg border hover:bg-muted/50">
                  <p className="text-sm font-medium line-clamp-2">{q.text}</p>
                  <span className="text-xs text-muted-foreground">{q.type}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Exam Table */}
      <div>
        <h3 className="text-lg font-semibold mb-4">All Exams</h3>
        <EnhancedExamTable
          exams={exams}
          onViewExam={handleViewExam}
          onEditExam={handleEditExam}
          onDeleteExam={handleDeleteExam}
          onDuplicateExam={handleDuplicateExam}
        />
      </div>

      {/* Exam Detail Modal */}
      <ExamDetailModal 
        exam={selectedExam}
        onClose={() => setSelectedExam(null)}
      />
    </div>
  )
}
