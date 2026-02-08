"use client"

import { X } from 'lucide-react'
import { useState } from 'react'

type FilterValues = {
  subject: string
  term: string
  category: string
  scoreRange: string
}

export function GradeFilters({ 
  onFilterChange,
  subjects,
  terms,
  categories = []
}: { 
  onFilterChange: (filters: FilterValues) => void
  subjects: string[]
  terms: string[]
  categories?: string[]
}) {
  const [filters, setFilters] = useState<FilterValues>({
    subject: '',
    term: '',
    category: '',
    scoreRange: ''
  })

  const handleFilterChange = (key: keyof FilterValues, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const emptyFilters = { subject: '', term: '', category: '', scoreRange: '' }
    setFilters(emptyFilters)
    onFilterChange(emptyFilters)
  }

  const activeFilterCount = Object.values(filters).filter(v => v !== '').length

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={filters.subject}
        onChange={(e) => handleFilterChange('subject', e.target.value)}
        className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="">All Subjects</option>
        {subjects.map(subject => (
          <option key={subject} value={subject}>{subject}</option>
        ))}
      </select>

      <select
        value={filters.term}
        onChange={(e) => handleFilterChange('term', e.target.value)}
        className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="">All Terms</option>
        {terms.map(term => (
          <option key={term} value={term}>{term}</option>
        ))}
      </select>

      <select
        value={filters.category}
        onChange={(e) => handleFilterChange('category', e.target.value)}
        className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="">All Categories</option>
        {categories.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>

      <select
        value={filters.scoreRange}
        onChange={(e) => handleFilterChange('scoreRange', e.target.value)}
        className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="">All Scores</option>
        <option value="A">A (90-100%)</option>
        <option value="B">B (75-89%)</option>
        <option value="C">C (60-74%)</option>
        <option value="D">D (50-59%)</option>
        <option value="F">F (&lt;50%)</option>
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
