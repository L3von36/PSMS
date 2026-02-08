"use client"

import { X, Calendar } from 'lucide-react'
import { useState } from 'react'

type FilterValues = {
  method: string
  dateRange: string
  student: string
}

export function PaymentFilters({ 
  onFilterChange,
  methods,
  students
}: { 
  onFilterChange: (filters: FilterValues) => void
  methods: string[]
  students: { id: string; name: string }[]
}) {
  const [filters, setFilters] = useState<FilterValues>({
    method: '',
    dateRange: '',
    student: ''
  })

  const handleFilterChange = (key: keyof FilterValues, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const emptyFilters = { method: '', dateRange: '', student: '' }
    setFilters(emptyFilters)
    onFilterChange(emptyFilters)
  }

  const activeFilterCount = Object.values(filters).filter(v => v !== '').length

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={filters.method}
        onChange={(e) => handleFilterChange('method', e.target.value)}
        className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="">All Methods</option>
        {methods.map(method => (
          <option key={method} value={method}>{method}</option>
        ))}
      </select>

      <select
        value={filters.dateRange}
        onChange={(e) => handleFilterChange('dateRange', e.target.value)}
        className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="">All Time</option>
        <option value="today">Today</option>
        <option value="week">This Week</option>
        <option value="month">This Month</option>
        <option value="year">This Year</option>
      </select>

      <select
        value={filters.student}
        onChange={(e) => handleFilterChange('student', e.target.value)}
        className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="">All Students</option>
        {students.map(student => (
          <option key={student.id} value={student.id}>{student.name}</option>
        ))}
      </select>

      {activeFilterCount > 0 && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-1 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
          Clear {activeFilterCount} {activeFilterCount === 1 ? 'filter' : 'filters'}
        </button>
      )}
    </div>
  )
}
