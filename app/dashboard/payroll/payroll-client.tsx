"use client"
import { useState, useTransition } from "react"
import { createPayroll } from "@/actions/payroll"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, ReceiptText, User } from "lucide-react"
import { toast } from "sonner"

export function PayrollClient({ initialPayrolls, staff }: { initialPayrolls: any[], staff: any[] }) {
    const [isPending, startTransition] = useTransition()
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

    const handleCreatePayroll = () => {
        startTransition(async () => {
            const result = await createPayroll(selectedMonth, selectedYear)
            if (result.success) {
                toast.success(result.message)
            } else {
                toast.error(result.message)
            }
        })
    }

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ]

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Generate New Payroll</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-4 items-end">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Month</label>
                        <select
                            className="w-full rounded-md border p-2 bg-background"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        >
                            {months.map((m, i) => (
                                <option key={m} value={i + 1}>{m}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Year</label>
                        <select
                            className="w-full rounded-md border p-2 bg-background"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        >
                            {[2024, 2025, 2026].map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                    <Button onClick={handleCreatePayroll} disabled={isPending}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Generate Payroll
                    </Button>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Staff Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {staff.map(s => (
                                <div key={s.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-100 rounded-full">
                                            <User className="h-4 w-4 text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{s.firstName} {s.lastName}</p>
                                            <p className="text-xs text-muted-foreground">{s.role}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-sm">ETB 5,000</p>
                                        <p className="text-[10px] text-muted-foreground">Base Salary</p>
                                    </div>
                                </div>
                            ))}
                            {staff.length === 0 && <p className="text-center text-muted-foreground">No staff members found.</p>}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Payrolls</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {initialPayrolls.map(p => (
                                <div key={p.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-100 rounded-full">
                                            <ReceiptText className="h-4 w-4 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{months[p.month - 1]} {p.year}</p>
                                            <p className="text-xs text-muted-foreground">{p.status} • {p.salaries.length} Employees</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm">View</Button>
                                </div>
                            ))}
                            {initialPayrolls.length === 0 && <p className="text-center text-muted-foreground">No payrolls generated yet.</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
