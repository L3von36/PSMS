"use client"

import { X } from 'lucide-react'
import { useState } from 'react'

type FilterValues = {
  grade: string
  section: string
  status: string
}

export function StudentFilters({ 
  onFilterChange,
  grades,
  sections 
}: { 
  onFilterChange: (filters: FilterValues) => void
  grades: string[]
  sections: string[]
}) {
  const [filters, setFilters] = useState<FilterValues>({
    grade: '',
    section: '',
    status: ''
  })

  const handleFilterChange = (key: keyof FilterValues, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const emptyFilters = { grade: '', section: '', status: '' }
    setFilters(emptyFilters)
    onFilterChange(emptyFilters)
  }

  const activeFilterCount = Object.values(filters).filter(v => v !== '').length

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={filters.grade}
        onChange={(e) => handleFilterChange('grade', e.target.value)}
        className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="">All Grades</option>
        {grades.map(grade => (
          <option key={grade} value={grade}>Grade {grade}</option>
        ))}
      </select>

      <select
        value={filters.section}
        onChange={(e) => handleFilterChange('section', e.target.value)}
        className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="">All Sections</option>
        {sections.map(section => (
          <option key={section} value={section}>Section {section}</option>
        ))}
      </select>

      <select
        value={filters.status}
        onChange={(e) => handleFilterChange('status', e.target.value)}
        className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="graduated">Graduated</option>
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
