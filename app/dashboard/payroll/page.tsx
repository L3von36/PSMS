import { getPayrollData } from "@/actions/payroll"
import { PayrollClient } from "./payroll-client"

export default async function PayrollPage() {
    const { payrolls, staff } = await getPayrollData()

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Payroll Management</h1>
            <p className="text-muted-foreground">Manage staff salaries, bonuses, and generate payslips.</p>
            <PayrollClient initialPayrolls={payrolls} staff={staff} />
        </div>
    )
}
