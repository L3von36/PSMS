"use client"

import { X, Mail, Phone, Calendar, GraduationCap, DollarSign, Award, FileDown, Layers } from 'lucide-react'
import { useState } from 'react'
import { generateReportCardPDF } from '@/lib/pdf-utils'
import { calculateEthiopianLetter } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

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
  isNationalExamCandidate?: boolean
  nationalExamId?: string | null
  nationalExamResult?: number | null
  grades?: any[]
  createdAt: Date
}

type Tab = 'overview' | 'grades' | 'payments' | 'attendance'

export function StudentDetailModal({ 
  student, 
  onClose 
}: { 
  student: Student | null
  onClose: () => void
}) {
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  if (!student) return null

  const handleDownloadReportCard = () => {
    generateReportCardPDF({
      studentName: `${student.firstName} ${student.lastName}`,
      studentId: student.id.slice(0, 8).toUpperCase(),
      grade: student.grade,
      term: 'Term 1, 2024',
      grades: [
        { subject: 'Mathematics', score: 85, grade: 'A' },
        { subject: 'Physics', score: 92, grade: 'A+' },
        { subject: 'Chemistry', score: 78, grade: 'B' },
        { subject: 'English', score: 88, grade: 'A' },
        { subject: 'Biology', score: 91, grade: 'A' },
      ],
      attendance: '95%',
      teacherComments: `${student.firstName} has been an outstanding student this term. Their participation in Physics experiments has been noteworthy. Keep up the great work!`
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center relative border-2 border-primary/20">
                {student.photoUrl ? (
                  <img 
                    src={student.photoUrl} 
                    alt={`${student.firstName} ${student.lastName}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-primary">
                    {student.firstName[0]}{student.lastName[0]}
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{student.firstName} {student.lastName}</h2>
                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <GraduationCap className="h-4 w-4" />
                    Grade {student.grade} {student.section && `• Section ${student.section}`}
                  </span>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    student.status === 'New' ? 'bg-blue-100 text-blue-800' : 
                    student.status === 'Transferred' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-green-100 text-green-800'
                  }`}>
                    {student.status || 'Active'}
                  </span>
                </div>
              </div>
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
              { id: 'overview', label: 'Overview' },
              { id: 'grades', label: 'Grades' },
              { id: 'payments', label: 'Payments' },
              { id: 'attendance', label: 'Attendance' },
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
              {/* Contact Info */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Contact Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{student.email || 'No email provided'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{student.phone || 'No phone number'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Enrolled: {new Date(student.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Enrollment History */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Enrollment History</h3>
                <div className="p-3 rounded-lg border bg-muted/50 text-sm italic">
                  {student.enrollmentHistory || "No additional enrollment history provided."}
                </div>
              </div>

              {/* National Exam Tracking (Ethiopian Specific) */}
              {(student.grade === '8' || student.grade === '12') && (
                <div className="p-4 rounded-lg border bg-blue-50/50 dark:bg-blue-900/10">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Award className="h-4 w-4 text-blue-600" />
                    National Exam Status
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold">Candidacy</p>
                      <Badge variant={student.isNationalExamCandidate ? "default" : "outline"} className="mt-1">
                        {student.isNationalExamCandidate ? "Candidate" : "Not Registered"}
                      </Badge>
                    </div>
                    {student.isNationalExamCandidate && (
                      <>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase font-semibold">Registration ID</p>
                          <p className="text-sm font-medium mt-0.5">{student.nationalExamId || 'Pending'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase font-semibold">Ministry Result</p>
                          <p className="text-sm font-bold mt-0.5 text-blue-600">
                            {student.nationalExamResult ? `${student.nationalExamResult}%` : 'Not Released'}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Quick Stats</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg border bg-muted/50">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Award className="h-4 w-4" />
                      <span className="text-xs">Avg Grade</span>
                    </div>
                    <p className="text-2xl font-bold">87.5%</p>
                  </div>
                  <div className="p-4 rounded-lg border bg-muted/50">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-xs">Paid</span>
                    </div>
                    <p className="text-2xl font-bold">ETB 15K</p>
                  </div>
                  <div className="p-4 rounded-lg border bg-muted/50">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Calendar className="h-4 w-4" />
                      <span className="text-xs">Attendance</span>
                    </div>
                    <p className="text-2xl font-bold">95%</p>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Recent Activity</h3>
                <div className="space-y-3">
                  {[
                    { type: 'grade', text: 'Mathematics: 85%', time: '2 days ago' },
                    { type: 'payment', text: 'Payment: ETB 5,000', time: '1 week ago' },
                    { type: 'grade', text: 'Physics: 92%', time: '1 week ago' },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg border">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        activity.type === 'grade' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-green-100 dark:bg-green-900/30'
                      }`}>
                        {activity.type === 'grade' ? (
                          <Award className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.text}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'grades' && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-4">Grade history (Weighted 40/20/40)</p>
              {(student.grades || []).length === 0 ? (
                <div className="text-center py-8 border rounded-lg bg-muted/20">
                    <Award className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No grades recorded yet.</p>
                </div>
              ) : (
                student.grades?.map((grade, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-lg ${
                            grade.score >= 85 ? 'bg-green-100 text-green-700' : 
                            grade.score >= 65 ? 'bg-blue-100 text-blue-700' :
                            grade.score >= 45 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                        }`}>
                            {calculateEthiopianLetter(grade.score)}
                        </div>
                        <div>
                            <p className="font-semibold">{grade.subject?.name || grade.subjectId}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                                <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 uppercase">{grade.category}</Badge>
                                <p className="text-xs text-muted-foreground">{grade.academicYear} • {grade.term}</p>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-bold">{grade.score}%</p>
                        <p className="text-[10px] text-muted-foreground uppercase">{grade.category === 'CA' ? 'Cont. Assessment' : grade.category}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-4">Payment history for this student</p>
              {[
                { amount: 5000, method: 'Cash', date: '2024-01-20' },
                { amount: 5000, method: 'Bank Transfer', date: '2023-12-15' },
                { amount: 5000, method: 'Mobile Money', date: '2023-11-10' },
              ].map((payment, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">ETB {payment.amount.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{payment.method} • {payment.date}</p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    Paid
                  </span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Attendance tracking coming soon</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t bg-muted/50">
          <div className="flex gap-3">
            <button className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              Edit Student
            </button>
            <button 
              onClick={handleDownloadReportCard}
              className="px-4 py-2 border rounded-lg hover:bg-muted transition-colors flex items-center gap-2"
            >
              <FileDown className="h-4 w-4" />
              Download Report Card
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
