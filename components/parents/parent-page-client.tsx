"use client"

import { useState } from 'react'
import { Users, MessageSquare, UserPlus, Link } from 'lucide-react'
import { EnhancedParentTable } from '@/components/parents/enhanced-parent-table'
import { ParentDetailModal } from '@/components/parents/parent-detail-modal'
import { ParentForm } from '@/components/parents/parent-form'
import { SendMessageModal } from '@/components/parents/send-message-modal'

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
  communications: any[]
  _count: { students: number; communications: number }
  createdAt: Date
}

type Student = {
  id: string
  firstName: string
  lastName: string
  grade: string
  section: string | null
}

export function ParentPageClient({ 
  parents, 
  students 
}: { 
  parents: Parent[]
  students: Student[]
}) {
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [editingParent, setEditingParent] = useState<Parent | null>(null)

  const stats = [
    {
      label: 'Total Parents',
      value: parents.length,
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30'
    },
    {
      label: 'Active Accounts',
      value: parents.filter(p => p.email).length,
      icon: UserPlus,
      color: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30'
    },
    {
      label: 'Students Linked',
      value: parents.reduce((sum, p) => sum + p._count.students, 0),
      icon: Link,
      color: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30'
    },
    {
      label: 'Messages Sent',
      value: parents.reduce((sum, p) => sum + p._count.communications, 0),
      icon: MessageSquare,
      color: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30'
    },
  ]

  const handleViewParent = (parent: Parent) => {
    setSelectedParent(parent)
  }

  const handleEditParent = (parent: Parent) => {
    setEditingParent(parent)
    setShowAddForm(true)
  }

  const handleCloseForm = () => {
    setShowAddForm(false)
    setEditingParent(null)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Parent Management</h1>
          <p className="text-muted-foreground mt-2">Manage parent accounts and communications</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowMessageModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            Send Message
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            Add Parent
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border bg-card p-6">
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-full ${stat.color} flex items-center justify-center`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Parent Table */}
      <EnhancedParentTable 
        parents={parents} 
        onViewParent={handleViewParent}
        onEditParent={handleEditParent}
      />

      {/* Detail Modal */}
      {selectedParent && (
        <ParentDetailModal
          parent={selectedParent}
          onClose={() => setSelectedParent(null)}
        />
      )}

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
              <h2 className="text-xl font-bold">{editingParent ? 'Edit Parent' : 'Add New Parent'}</h2>
              <button onClick={handleCloseForm} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>
            <div className="p-6">
              <ParentForm 
                students={students} 
                parent={editingParent}
                onSuccess={handleCloseForm}
              />
            </div>
          </div>
        </div>
      )}

      {/* Send Message Modal */}
      {showMessageModal && (
        <SendMessageModal
          parents={parents}
          onClose={() => setShowMessageModal(false)}
        />
      )}
    </div>
  )
}
