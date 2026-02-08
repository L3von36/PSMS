"use client"

import { useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table'
import {
  Eye,
  Pencil,
  Trash2,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Send,
  Award,
  Search,
  ArrowUpDown // Keep ArrowUpDown as it's used in sorting
} from 'lucide-react'
import { Grade } from "@/types/grading"
import { calculateEthiopianLetter } from "@/lib/utils"
import { toast } from 'sonner' // Added toast import
import { exportToCSV } from "@/lib/export-utils"


export function EnhancedGradeTable({
  grades,
  onViewGrade,
  onEditGrade,
  onDeleteGrade,
  onOpenCommunication
}: { 
  grades: Grade[]
  onViewGrade: (grade: Grade) => void
  onEditGrade: (grade: Grade) => void
  onDeleteGrade: (grade: Grade) => void
  onOpenCommunication: (studentName: string, message: string) => void
}) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState({})

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400'
    if (score >= 75) return 'text-blue-600 dark:text-blue-400'
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    if (score >= 75) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
  }

  const columns: ColumnDef<Grade>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          className="rounded border-gray-300"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="rounded border-gray-300"
        />
      ),
    },
    {
      accessorFn: (row) => `${row.student.firstName} ${row.student.lastName}`,
      id: 'student',
      header: ({ column }) => (
        <button
          className="flex items-center gap-2 hover:text-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Student
          <ArrowUpDown className="h-4 w-4" />
        </button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              {row.original.student.firstName[0]}{row.original.student.lastName[0]}
            </span>
          </div>
          <div>
            <p className="font-medium">{row.original.student.firstName} {row.original.student.lastName}</p>
          </div>
        </div>
      ),
    },
    {
      accessorFn: (row) => row.subject.name,
      id: 'subject',
      header: 'Subject',
      cell: ({ row }) => (
        <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
          {row.original.subject.name}
        </span>
      ),
    },
    {
      accessorKey: 'score',
      header: ({ column }) => (
        <button
          className="flex items-center gap-2 hover:text-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Score
          <ArrowUpDown className="h-4 w-4" />
        </button>
      ),
      cell: ({ row }) => {
        const score = row.original.score
        const outOf = row.original.outOf || 100
        const percentage = (score / outOf) * 100
        return (
          <div className="flex flex-col">
            <span className={`text-lg font-bold ${getScoreColor(percentage)}`}>
              {score}/{outOf}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {percentage.toFixed(1)}%
            </span>
          </div>
        )
      },
    },
    {
      id: 'letter',
      header: 'Letter',
      cell: ({ row }) => {
        const score = row.original.score
        const outOf = row.original.outOf || 100
        const percentage = (score / outOf) * 100
        const letter = calculateEthiopianLetter(percentage)
        return (
          <span className={`font-bold ${
            letter.startsWith('A') ? 'text-green-600' : 
            letter.startsWith('B') ? 'text-blue-600' :
            letter.startsWith('F') ? 'text-red-600' : 'text-slate-600'
          }`}>
            {letter}
          </span>
        )
      }
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => {
        const cat = row.getValue<string>('category')
        return (
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
            cat === 'CA' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' :
            cat === 'Midterm' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
            'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
          }`}>
            {cat}
          </span>
        )
      }
    },
    {
      accessorKey: 'term',
      header: 'Term',
      cell: ({ row }) => (
        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
          {row.getValue('term')}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => new Date(row.getValue('createdAt')).toLocaleDateString(),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const grade = row.original
        const percentage = (grade.score / (grade.outOf || 100)) * 100
        const letter = calculateEthiopianLetter(percentage)

        const handleExportRecord = () => {
          const data = [{
            Student: `${grade.student.firstName} ${grade.student.lastName}`,
            Subject: grade.subject.name,
            Category: grade.category,
            Term: grade.term,
            Score: grade.score,
            OutOf: grade.outOf || 100,
            Percentage: `${percentage.toFixed(1)}%`,
            Grade: letter
          }]
          exportToCSV(data, `${grade.student.firstName}_Grade_${grade.category}`)
          toast.success("Record exported")
        }

        const handleSendRecord = () => {
          const summary = `*Grade Notification*\n\nStudent: ${grade.student.firstName} ${grade.student.lastName}\nSubject: ${grade.subject.name}\nAssessment: ${grade.category}\nScore: ${grade.score}/${grade.outOf || 100} (${percentage.toFixed(0)}%)\nGrade: ${letter}`
          onOpenCommunication(`${grade.student.firstName} ${grade.student.lastName}`, summary)
        }

        return (
          <div className="relative group">
            <button className="p-2 hover:bg-muted rounded-lg">
              <MoreVertical className="h-4 w-4" />
            </button>
            <div className="absolute right-0 top-full mt-1 w-48 bg-card border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
              <button
                onClick={() => onViewGrade(grade)}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
              >
                <Eye className="h-4 w-4" />
                View Details
              </button>
              <button
                onClick={handleSendRecord}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
              >
                <Send className="h-4 w-4" />
                Send to Parent
              </button>
              <button
                onClick={handleExportRecord}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
              >
                <Download className="h-4 w-4" />
                Export Record
              </button>
              <div className="border-t my-1" />
              <button
                onClick={() => onEditGrade(grade)}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </button>
              <button
                onClick={() => onDeleteGrade(grade)}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: grades,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      globalFilter,
      columnFilters,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  const selectedCount = Object.keys(rowSelection).length
  const avgScore = grades.length > 0 
    ? grades.reduce((sum, g) => sum + g.score, 0) / grades.length 
    : 0

  return (
    <div className="space-y-4">
      {/* Average Score Banner */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center">
            <Award className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Class Average</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{avgScore.toFixed(1)}%</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{grades.length} grades</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search grades..."
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="w-full rounded-lg border bg-background pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Bulk Actions Bar */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-4 bg-primary/10 px-4 py-2 rounded-lg">
          <span className="text-sm font-medium">{selectedCount} selected</span>
          <button className="text-sm px-3 py-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
            Export
          </button>
          <button className="text-sm px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700">
            Delete
          </button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-sm font-medium text-muted-foreground"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Award className="h-12 w-12 text-muted-foreground/50" />
                      <p className="text-sm font-medium">No grades found</p>
                      <p className="text-xs text-muted-foreground">Record your first grade to get started</p>
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => onViewGrade(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td 
                        key={cell.id} 
                        className="px-4 py-3 text-sm"
                        onClick={(e) => {
                          if (cell.column.id === 'select' || cell.column.id === 'actions') {
                            e.stopPropagation()
                          }
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {table.getRowModel().rows.length > 0 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <div className="text-sm text-muted-foreground">
              Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}{' '}
              of {table.getFilteredRowModel().rows.length} grades
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </span>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
