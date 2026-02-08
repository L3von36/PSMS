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
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, DollarSign, MoreVertical, Eye, Pencil, Trash2, FileText } from 'lucide-react'

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

export function EnhancedPaymentTable({ 
  payments,
  onViewPayment,
  onEditPayment,
  onDeletePayment 
}: { 
  payments: Payment[]
  onViewPayment: (payment: Payment) => void
  onEditPayment: (payment: Payment) => void
  onDeletePayment: (payment: Payment) => void
}) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState({})

  const columns: ColumnDef<Payment>[] = [
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
      accessorKey: 'amount',
      header: ({ column }) => (
        <button
          className="flex items-center gap-2 hover:text-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Amount
          <ArrowUpDown className="h-4 w-4" />
        </button>
      ),
      cell: ({ row }) => (
        <span className="font-semibold text-green-600 dark:text-green-400">
          ETB {row.getValue<number>('amount').toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: 'method',
      header: 'Method',
      cell: ({ row }) => {
        const method = row.getValue<string>('method')
        const colorMap: Record<string, string> = {
          'Cash': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
          'Bank Transfer': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
          'Mobile Money': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
        }
        return (
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorMap[method] || 'bg-gray-100 text-gray-800'}`}>
            {method}
          </span>
        )
      },
    },
    {
      id: 'status',
      header: 'Status',
      cell: () => (
        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
          Paid
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <button
          className="flex items-center gap-2 hover:text-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Date
          <ArrowUpDown className="h-4 w-4" />
        </button>
      ),
      cell: ({ row }) => new Date(row.getValue('createdAt')).toLocaleDateString(),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="relative group">
          <button className="p-2 hover:bg-muted rounded-lg">
            <MoreVertical className="h-4 w-4" />
          </button>
          <div className="absolute right-0 top-full mt-1 w-48 bg-card border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
            <button
              onClick={() => onViewPayment(row.original)}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
            >
              <Eye className="h-4 w-4" />
              View Receipt
            </button>
            <button
              onClick={() => onEditPayment(row.original)}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </button>
            <button
              onClick={() => onDeletePayment(row.original)}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted text-red-600"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
      ),
    },
  ]

  const table = useReactTable({
    data: payments,
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
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-4">
      {/* Total Revenue Banner */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-green-600 flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">ETB {totalRevenue.toLocaleString()}</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{payments.length} payments</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search payments..."
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
            <FileText className="h-3 w-3 inline mr-1" />
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
                      <DollarSign className="h-12 w-12 text-muted-foreground/50" />
                      <p className="text-sm font-medium">No payments found</p>
                      <p className="text-xs text-muted-foreground">Record your first payment to get started</p>
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => onViewPayment(row.original)}
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
              of {table.getFilteredRowModel().rows.length} payments
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
