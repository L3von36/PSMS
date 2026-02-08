import { X, Award, User, BookOpen, Calendar, TrendingUp, TrendingDown, BarChart3, Download } from 'lucide-react'
import { useState } from 'react'
import { Grade } from "@/types/grading"
import { calculateEthiopianLetter } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'

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

  // Mock data for analytics
  const studentPerformanceData = [
    { name: 'Quiz 1', score: 85, avg: 72 },
    { name: 'Midterm', score: grade.score, avg: 68 },
    { name: 'Assignment', score: 92, avg: 75 },
    { name: 'Quiz 2', score: 78, avg: 70 },
  ]

  const subjectDistributionData = [
    { name: 'A (90-100)', value: 4, color: '#16a34a' },
    { name: 'B (80-89)', value: 12, color: '#2563eb' },
    { name: 'C (70-79)', value: 8, color: '#ca8a04' },
    { name: 'D (60-69)', value: 3, color: '#ea580c' },
    { name: 'F (<60)', value: 2, color: '#dc2626' },
  ]

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
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">Performance Timeline</h3>
                <div className="flex gap-4 text-xs font-medium">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    Student
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                    Class Average
                  </div>
                </div>
              </div>

              <div className="h-[250px] w-full bg-card rounded-xl border p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={studentPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="var(--primary)"
                      strokeWidth={3}
                      dot={{ r: 6, fill: 'var(--primary)', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="avg"
                      stroke="#94a3b8"
                      strokeDasharray="5 5"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border bg-green-50/50 dark:bg-green-900/10">
                  <p className="text-xs font-bold text-green-600 uppercase mb-1">Strengths</p>
                  <p className="text-sm">Consistently scores above average in Assignments and Quizzes.</p>
                </div>
                <div className="p-4 rounded-xl border bg-blue-50/50 dark:bg-blue-900/10">
                  <p className="text-xs font-bold text-blue-600 uppercase mb-1">Growth Area</p>
                  <p className="text-sm">Midterm score shows slight dip compared to class average.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="font-bold text-lg">Grade Distribution ({grade.subject.name})</h3>

              <div className="h-[250px] w-full bg-card rounded-xl border p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                    <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {subjectDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} opacity={entry.name.startsWith(calculateEthiopianLetter((grade.score / (grade.outOf || 100)) * 100)) ? 1 : 0.6} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Class Participation Rate</span>
                  <span className="text-sm font-bold">94%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '94%' }} />
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">Based on 29 students in {grade.student.grade}{grade.student.section}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t bg-muted/30">
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Close Preview
            </Button>
            <Button className="flex-1 gap-2">
              <Download className="h-4 w-4" />
              Download Report
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
