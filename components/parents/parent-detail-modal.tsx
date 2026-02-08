"use client"

import { useState, useEffect } from 'react'
import { X, User, Phone, Mail, MessageCircle, Send, Briefcase, MapPin, Users, MessageSquare } from 'lucide-react'
import { getCommunicationHistory } from '@/actions/parent'

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
  students: { id: string; firstName: string; lastName: string; grade: string }[]
  _count: { students: number; communications: number }
}

export function ParentDetailModal({ parent, onClose }: { parent: Parent; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'communications'>('overview')
  const [communications, setCommunications] = useState<any[]>([])

  useEffect(() => {
    getCommunicationHistory(parent.id).then(setCommunications)
  }, [parent.id])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{parent.firstName} {parent.lastName}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {parent._count.students} {parent._count.students === 1 ? 'Child' : 'Children'} • {parent._count.communications} Messages
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b dark:border-gray-700">
          <div className="flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('communications')}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'communications'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Communications
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <Phone className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-xs text-muted-foreground">Primary Phone</p>
                      <p className="font-medium">{parent.phone}</p>
                    </div>
                  </div>
                  {parent.secondaryPhone && (
                    <div className="flex items-center gap-3 p-3 rounded-lg border">
                      <Phone className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-xs text-muted-foreground">Secondary Phone</p>
                        <p className="font-medium">{parent.secondaryPhone}</p>
                      </div>
                    </div>
                  )}
                  {parent.email && (
                    <div className="flex items-center gap-3 p-3 rounded-lg border">
                      <Mail className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="font-medium text-sm">{parent.email}</p>
                      </div>
                    </div>
                  )}
                  {parent.whatsapp && (
                    <div className="flex items-center gap-3 p-3 rounded-lg border">
                      <MessageCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-xs text-muted-foreground">WhatsApp</p>
                        <p className="font-medium">{parent.whatsapp}</p>
                      </div>
                    </div>
                  )}
                  {parent.telegram && (
                    <div className="flex items-center gap-3 p-3 rounded-lg border">
                      <Send className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-xs text-muted-foreground">Telegram</p>
                        <p className="font-medium">{parent.telegram}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Professional Info */}
              {(parent.occupation || parent.employer) && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Professional Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {parent.occupation && (
                      <div className="flex items-center gap-3 p-3 rounded-lg border">
                        <Briefcase className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="text-xs text-muted-foreground">Occupation</p>
                          <p className="font-medium">{parent.occupation}</p>
                        </div>
                      </div>
                    )}
                    {parent.employer && (
                      <div className="flex items-center gap-3 p-3 rounded-lg border">
                        <Briefcase className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="text-xs text-muted-foreground">Employer</p>
                          <p className="font-medium">{parent.employer}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Additional Info */}
              {(parent.address || parent.nationalId) && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
                  <div className="space-y-3">
                    {parent.address && (
                      <div className="flex items-start gap-3 p-3 rounded-lg border">
                        <MapPin className="h-5 w-5 text-orange-600 mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Address</p>
                          <p className="font-medium">{parent.address}</p>
                        </div>
                      </div>
                    )}
                    {parent.nationalId && (
                      <div className="flex items-center gap-3 p-3 rounded-lg border">
                        <User className="h-5 w-5 text-indigo-600" />
                        <div>
                          <p className="text-xs text-muted-foreground">National ID</p>
                          <p className="font-medium">{parent.nationalId}</p>
                        </div>
                      </div>
                    )}
                    {parent.isEmergencyContact && (
                      <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                        <p className="text-sm font-medium text-red-700 dark:text-red-400">✓ Emergency Contact</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Linked Students */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Linked Students</h3>
                {parent.students.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No students linked</p>
                ) : (
                  <div className="grid gap-3">
                    {parent.students.map(student => (
                      <div key={student.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                          <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <p className="font-medium">{student.firstName} {student.lastName}</p>
                          <p className="text-xs text-muted-foreground">Grade {student.grade}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'communications' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Communication History</h3>
              {communications.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No messages sent yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {communications.map(comm => (
                    <div key={comm.id} className="p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold uppercase ${
                          comm.type === 'SMS' ? 'bg-green-100 text-green-700' :
                          comm.type === 'Email' ? 'bg-blue-100 text-blue-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {comm.type}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comm.sentAt).toLocaleDateString()}
                        </span>
                      </div>
                      {comm.subject && <p className="font-medium mb-1">{comm.subject}</p>}
                      <p className="text-sm text-muted-foreground">{comm.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
