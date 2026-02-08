"use client"

import { X, FileText, Clock, BookOpen, HelpCircle, CheckCircle, List } from 'lucide-react'
import { useState } from 'react'

type Question = {
  id: string
  text: string
  type: string
  options?: string | null
  answer: string
}

type Exam = {
  id: string
  title: string
  duration: number
  createdAt: Date
  subject: {
    name: string
  }
  questions: Question[]
}

type Tab = 'overview' | 'questions' | 'stats'

export function ExamDetailModal({ 
  exam, 
  onClose 
}: { 
  exam: Exam | null
  onClose: () => void
}) {
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  if (!exam) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold">{exam.title}</h2>
              <p className="text-muted-foreground mt-1">
                {exam.subject.name} • {exam.questions.length} Questions
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <div className="flex gap-1 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: BookOpen },
              { id: 'questions', label: 'Questions', icon: List },
              { id: 'stats', label: 'Statistics', icon: HelpCircle },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border bg-muted/30">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <p className="text-sm font-medium">Duration</p>
                  </div>
                  <p className="text-2xl font-bold">{exam.duration} min</p>
                </div>
                <div className="p-4 rounded-lg border bg-muted/30">
                  <div className="flex items-center gap-3 mb-2">
                    <HelpCircle className="h-5 w-5 text-purple-600" />
                    <p className="text-sm font-medium">Questions</p>
                  </div>
                  <p className="text-2xl font-bold">{exam.questions.length}</p>
                </div>
                <div className="p-4 rounded-lg border bg-muted/30">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <p className="text-sm font-medium">Status</p>
                  </div>
                  <p className="text-2xl font-bold text-green-600">Active</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Exam Information
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Subject</p>
                    <p className="font-medium">{exam.subject.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Created On</p>
                    <p className="font-medium">{new Date(exam.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'questions' && (
            <div className="space-y-4">
              {exam.questions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No questions added to this exam yet.
                </div>
              ) : (
                exam.questions.map((q, idx) => (
                  <div key={q.id} className="p-4 rounded-lg border space-y-2">
                    <div className="flex items-start justify-between">
                      <p className="font-medium">
                        <span className="text-muted-foreground mr-2">{idx + 1}.</span>
                        {q.text}
                      </p>
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                        {q.type}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">Answer:</span> {q.answer}
                    </p>
                    {q.options && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        <p className="font-semibold text-foreground">Options:</p>
                        <p className="mt-1">{q.options}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="text-center py-12">
              <HelpCircle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Performance statistics will appear here once the exam is completed by students.</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t bg-muted/50">
          <div className="flex gap-3">
            <button className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              Edit Exam
            </button>
            <button className="px-4 py-2 border rounded-lg hover:bg-muted transition-colors">
              Preview Exam
            </button>
            <button className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
