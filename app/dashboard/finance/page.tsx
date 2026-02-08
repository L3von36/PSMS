import { getFinanceData } from "@/actions/finance"
import { FinancePageClient } from "@/components/finance/finance-page-client"

export default async function FinancePage() {
  const { feeStructures, payments } = await getFinanceData()
  
  // Filter out payments with null students
  const validPayments = payments.filter(p => p.student !== null) as any[]

  return <FinancePageClient payments={validPayments} feeStructures={feeStructures} />
}
