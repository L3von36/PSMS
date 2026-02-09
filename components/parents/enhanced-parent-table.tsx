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
} from '@tanstack/react-table'
import { Search, ArrowUpDown, MoreVertical, Eye, Pencil, Trash2, Phone, MessageCircle, Send } from 'lucide-react'
import { deleteParent } from '@/actions/parent'
import { toast } from 'sonner'

type Parent = {
  id: string
  firstName: string
  lastName: string
  phone: string
  secondaryPhone?: string | null
  email?: string | null
  whatsapp?: string | null
  telegram?: string | null
  telegramChatId?: string | null
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

export function EnhancedParentTable({
  parents,
  onViewParent,
  onEditParent
}: {
  parents: Parent[]
  onViewParent: (parent: Parent) => void
  onEditParent: (parent: Parent) => void
}) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const handleDelete = async (parentId: string) => {
    if (!confirm('Are you sure you want to delete this parent? This will remove all linked relationships.')) {
      return
    }
    const result = await deleteParent(parentId)
    if (result.success) {
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }
  }

  const columns: ColumnDef<Parent>[] = [
    {
      accessorKey: 'firstName',
      header: ({ column }) => (
        <button
          className="flex items-center gap-2 hover:text-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Parent Name
          <ArrowUpDown className="h-4 w-4" />
        </button>
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.firstName} {row.original.lastName}</p>
          <p className="text-xs text-muted-foreground">{row.original.email || 'No email'}</p>
        </div>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Contact',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{row.original.phone}</span>
          {row.original.whatsapp && (
            <span title="WhatsApp available">
              <MessageCircle className="h-4 w-4 text-green-600" />
            </span>
          )}
          {/* Show Telegram icon if username exists OR if bot is linked (chatId exists) */}
          {(row.original.telegram || row.original.telegramChatId) && (
            <span title={row.original.telegramChatId ? "Telegram Bot Linked ✅" : "Telegram Username Available"}>
              <Send className={`h-4 w-4 ${row.original.telegramChatId ? "text-blue-600 fill-blue-100" : "text-blue-400"}`} />
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'students',
      header: 'Linked Students',
      cell: ({ row }) => {
        const students = row.original.students
        if (students.length === 0) {
          return <span className="text-sm text-muted-foreground">No students</span>
        }
        return (
          <div className="flex flex-wrap gap-1">
            {students.slice(0, 2).map(student => (
              <span key={student.id} className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-400">
                {student.firstName} {student.lastName}
              </span>
            ))}
            {students.length > 2 && (
              <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-700 px-2 py-0.5 text-xs">
                +{students.length - 2} more
              </span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: '_count.communications',
      header: 'Messages',
      cell: ({ row }) => (
        <span className="text-sm">{row.original._count.communications}</span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="relative group">
          <button className="p-2 hover:bg-muted rounded-lg">
            <MoreVertical className="h-4 w-4" />
          </button>
          <div className="absolute right-0 top-full mt-1 hidden group-hover:block z-10 w-48 rounded-lg border bg-popover shadow-lg">
            <div className="p-1">
              <button
                onClick={() => onViewParent(row.original)}
                className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm hover:bg-muted"
              >
                <Eye className="h-4 w-4" />
                View Details
              </button>
              <button
                onClick={() => onEditParent(row.original)}
                className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm hover:bg-muted"
              >
                <Pencil className="h-4 w-4" />
                Edit Parent
              </button>
              <button
                onClick={() => handleDelete(row.original.id)}
                className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      ),
    },
  ]

  const table = useReactTable({
    data: parents,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      globalFilter,
    },
    initialState: {
      pagination: { pageSize: 10 },
    },
  })

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search parents..."
          value={globalFilter}
          onChange={e => setGlobalFilter(e.target.value)}
          className="w-full rounded-lg border bg-background pl-10 pr-4 py-2"
        />
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <table className="w-full">
          <thead className="border-b bg-muted/50">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="px-4 py-3 text-left text-sm font-medium">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="border-b hover:bg-muted/50">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {table.getRowModel().rows.length} of {parents.length} parents
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 rounded border disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 rounded border disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
