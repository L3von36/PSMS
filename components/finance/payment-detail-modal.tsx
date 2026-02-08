"use client"

import { X, DollarSign, User, Calendar, CreditCard, FileText } from 'lucide-react'
import { useState } from 'react'
import { generateReceiptPDF } from '@/lib/pdf-utils'

type Payment = {
  id: string
  amount: number
  method: string
  createdAt: Date
  student: {
    firstName: string
    lastName: string
    grade?: string
  }
}

type Tab = 'overview' | 'receipt' | 'history'

export function PaymentDetailModal({ 
  payment, 
  onClose 
}: { 
  payment: Payment | null
  onClose: () => void
}) {
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  if (!payment) return null

  const handlePrintReceipt = () => {
    generateReceiptPDF({
      receiptNo: payment.id.slice(0, 8).toUpperCase(),
      date: new Date(payment.createdAt).toLocaleDateString(),
      studentName: `${payment.student.firstName} ${payment.student.lastName}`,
      studentId: payment.id.slice(-6).toUpperCase(),
      grade: payment.student.grade || 'N/A',
      amount: payment.amount,
      method: payment.method,
      status: 'Paid',
      description: `Tuition Fees Payment`
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold">Payment Details</h2>
              <p className="text-muted-foreground mt-1">
                {payment.student.firstName} {payment.student.lastName}
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
              { id: 'overview', label: 'Overview' },
              { id: 'receipt', label: 'Receipt' },
              { id: 'history', label: 'History' },
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
              {/* Amount */}
              <div className="text-center p-6 rounded-lg bg-primary/10">
                <p className="text-sm text-muted-foreground mb-1">Amount Paid</p>
                <p className="text-4xl font-bold text-primary">ETB {payment.amount.toLocaleString()}</p>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-lg border">
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Student</p>
                    <p className="font-medium">{payment.student.firstName} {payment.student.lastName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-lg border">
                  <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Method</p>
                    <p className="font-medium">{payment.method}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-lg border">
                  <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Date</p>
                    <p className="font-medium">{new Date(payment.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'receipt' && (
            <div className="space-y-6">
              <div className="border rounded-lg p-8 bg-white dark:bg-gray-900">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold">Payment Receipt</h3>
                  <p className="text-sm text-muted-foreground">Official Payment Confirmation</p>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Receipt #:</span>
                    <span className="font-medium">{payment.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Student:</span>
                    <span className="font-medium">{payment.student.firstName} {payment.student.lastName}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium">{new Date(payment.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Method:</span>
                    <span className="font-medium">{payment.method}</span>
                  </div>
                  <div className="flex justify-between py-3 bg-primary/10 px-4 rounded-lg">
                    <span className="font-semibold">Total Amount:</span>
                    <span className="text-xl font-bold">ETB {payment.amount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  <p>Thank you for your payment</p>
                  <p className="mt-2">Private School Management System</p>
                </div>
              </div>

              <button 
                onClick={handlePrintReceipt}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <FileText className="h-4 w-4 inline mr-2" />
                Print Receipt
              </button>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Payment history for this student</p>
              <p className="text-xs text-muted-foreground mt-1">Related payments will appear here</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t bg-muted/50">
          <div className="flex gap-3">
            <button className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              Edit Payment
            </button>
            <button className="px-4 py-2 border rounded-lg hover:bg-muted transition-colors">
              Send Receipt
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
