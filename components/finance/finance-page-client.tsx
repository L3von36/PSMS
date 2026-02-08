"use client"

import { useState } from 'react'
import { generateMonthlyInvoices } from '@/actions/finance'
import { toast } from 'sonner'
import { Download, Upload, Plus, Calculator } from 'lucide-react'
import { EnhancedPaymentTable } from '@/components/finance/enhanced-payment-table'
import { PaymentDetailModal } from '@/components/finance/payment-detail-modal'
import { FinanceStatsCards } from '@/components/finance/finance-stats-cards'
import { PaymentFilters } from '@/components/finance/payment-filters'
import { FeeForm } from '@/components/finance/fee-form'
import { PaymentForm } from '@/components/finance/payment-form'

type Payment = {
  id: string
  amount: number
  method: string
  createdAt: Date
  student: {
    id: string
    firstName: string
    lastName: string
  }
}

type FeeStructure = {
  id: string
  title: string
  amount: number
  gradeLevel: string | null
}

export function FinancePageClient({ 
  payments,
  feeStructures 
}: { 
  payments: Payment[]
  feeStructures: FeeStructure[]
}) {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [showAddFee, setShowAddFee] = useState(false)
  const [showAddPayment, setShowAddPayment] = useState(false)
  const [filteredPayments, setFilteredPayments] = useState(payments)

  // Calculate stats
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0)
  const thisMonth = payments
    .filter(p => {
      const date = new Date(p.createdAt)
      const now = new Date()
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    })
    .reduce((sum, p) => sum + p.amount, 0)

  const stats = {
    totalRevenue,
    pendingPayments: 0, // Mock data
    thisMonth,
    overdueAmount: 0, // Mock data
  }

  // Get unique methods and students
  const methods = Array.from(new Set(payments.map(p => p.method)))
  const students = Array.from(new Set(payments.map(p => ({
    id: p.student.id,
    name: `${p.student.firstName} ${p.student.lastName}`
  }))))

  const handleFilterChange = (filters: any) => {
    let filtered = payments

    if (filters.method) {
      filtered = filtered.filter(p => p.method === filters.method)
    }
    if (filters.student) {
      filtered = filtered.filter(p => p.student.id === filters.student)
    }
    if (filters.dateRange) {
      const now = new Date()
      filtered = filtered.filter(p => {
        const date = new Date(p.createdAt)
        switch (filters.dateRange) {
          case 'today':
            return date.toDateString() === now.toDateString()
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            return date >= weekAgo
          case 'month':
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
          case 'year':
            return date.getFullYear() === now.getFullYear()
          default:
            return true
        }
      })
    }

    setFilteredPayments(filtered)
  }

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment)
  }

  const handleEditPayment = (payment: Payment) => {
    console.log('Edit payment:', payment)
  }

  const handleDeletePayment = (payment: Payment) => {
    console.log('Delete payment:', payment)
  }

  const handleExport = () => {
    console.log('Exporting payments...')
  }

  const handleImport = () => {
    console.log('Importing payments...')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Finance</h2>
          <p className="text-muted-foreground">Manage fees, payments, and revenue</p>
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
        </div>
      </div>

      {/* Stats Cards */}
      <FinanceStatsCards stats={stats} />

      {/* Forms Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Fee Structures</h3>
            <button
              onClick={() => setShowAddFee(!showAddFee)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              <Plus className="h-3 w-3" />
              Add Fee
            </button>
          </div>
          {showAddFee && <FeeForm />}
          {!showAddFee && feeStructures.length > 0 && (
            <div className="space-y-2 mt-4">
              {feeStructures.slice(0, 3).map((fee) => (
                <div key={fee.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50">
                  <div>
                    <p className="font-medium">{fee.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {fee.gradeLevel ? `Grade ${fee.gradeLevel}` : 'All Grades'}
                    </p>
                  </div>
                  <span className="font-semibold text-green-600">ETB {fee.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Record Payment</h3>
            <button
              onClick={() => setShowAddPayment(!showAddPayment)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              <Plus className="h-3 w-3" />
              {showAddPayment ? 'Hide' : 'Show'} Form
            </button>
          </div>
          {showAddPayment && <PaymentForm />}
        </div>
      </div>

      {/* Filters */}
      <PaymentFilters
        onFilterChange={handleFilterChange}
        methods={methods}
        students={students}
      />

      {/* Payment Table */}
      <EnhancedPaymentTable
        payments={filteredPayments}
        onViewPayment={handleViewPayment}
        onEditPayment={handleEditPayment}
        onDeletePayment={handleDeletePayment}
      />

      {/* Payment Detail Modal */}
      <PaymentDetailModal
        payment={selectedPayment}
        onClose={() => setSelectedPayment(null)}
      />
    </div>
  )
}
