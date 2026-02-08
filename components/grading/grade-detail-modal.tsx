import { X, Award, User, BookOpen, Calendar, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'
import { useState } from 'react'
import { Grade } from "@/types/grading"
import { calculateEthiopianLetter } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const getScoreColor = (score: number) => {
  if (score >= 90) return 'text-green-600 dark:text-green-500'
  if (score >= 75) return 'text-blue-600 dark:text-blue-500'
  if (score >= 60) return 'text-yellow-600 dark:text-yellow-500'
  if (score >= 50) return 'text-orange-600 dark:text-orange-500'
  return 'text-red-600 dark:text-red-500'
}

type Tab = 'overview' | 'student' | 'analytics'

export function GradeDetailModal({ 
  grade, 
  onClose 
}: { 
  grade: Grade | null
  onClose: () => void
}) {
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  if (!grade) return null

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400'
    if (score >= 75) return 'text-blue-600 dark:text-blue-400'
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const letter = calculateEthiopianLetter(grade.score)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-card rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border">
        {/* Header */}
        <div className="p-6 border-b bg-muted/20">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold">Assessment Breakdown</h2>
              <p className="text-muted-foreground mt-1">
                {grade.student.firstName} {grade.student.lastName} • {grade.subject.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors border shadow-sm"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b bg-card">
          <div className="flex gap-1 px-6">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'student', label: 'Student Performance' },
              { id: 'analytics', label: 'Subject Analytics' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Score Display */}
              <div className="text-center p-8 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 border shadow-inner">
                <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-white dark:bg-slate-950 shadow-xl mb-4 border-4 border-slate-200 dark:border-slate-800">
                  <span className={`text-4xl font-bold ${getScoreColor((grade.score / (grade.outOf || 100)) * 100)}`}>
                    {calculateEthiopianLetter((grade.score / (grade.outOf || 100)) * 100)}
                  </span>
                </div>
                <p className={`text-5xl font-black mb-2 ${getScoreColor((grade.score / (grade.outOf || 100)) * 100)}`}>
                  {grade.score}<span className="text-2xl text-muted-foreground font-light">/{grade.outOf || 100}</span>
                </p>
                <div className="px-4 py-1.5 bg-white/50 dark:bg-slate-950/50 rounded-full inline-block border text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {((grade.score / (grade.outOf || 100)) * 100).toFixed(1)}% Feedback Letter
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-xl border bg-card/50">
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center border border-blue-200 dark:border-blue-800">
                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Student</p>
                    <p className="font-semibold">{grade.student.firstName} {grade.student.lastName}</p>
                    <p className="text-xs text-muted-foreground">Grade {grade.student.grade} ({grade.student.section})</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl border bg-card/50">
                  <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center border border-purple-200 dark:border-purple-800">
                    <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Subject</p>
                    <p className="font-semibold">{grade.subject.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl border border-indigo-200 bg-indigo-50/20 dark:bg-indigo-900/10">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
                    <Award className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">Category</p>
                    <p className="font-bold text-indigo-700 dark:text-indigo-300">{grade.category}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl border bg-card/50">
                  <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center border border-green-200 dark:border-green-800">
                    <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Term & Year</p>
                    <p className="font-semibold">{grade.term} • {grade.academicYear}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'student' && (
            <div className="text-center py-20 bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-dashed">
              <Award className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-500">Student performance analytics coming soon</p>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="text-center py-20 bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-dashed">
              <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-500">Subject distribution analytics coming soon</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t bg-muted/30">
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Close Preview
            </Button>
            <Button className="flex-1">
              Download Summary
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
