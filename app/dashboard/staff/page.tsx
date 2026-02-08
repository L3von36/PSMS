import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getStaffMembers } from "@/actions/staff"
import { getGradingData } from "@/actions/grading"
import { StaffManagement } from "@/components/dashboard/staff-management"

export default async function StaffPage() {
    const session = await auth()
    if (!['ADMIN', 'DIRECTOR', 'UNIT_LEADER'].includes(session?.user?.role || '')) {
        redirect('/dashboard')
    }

    const { staff } = await getStaffMembers()
    const { subjects } = await getGradingData()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
                <p className="text-muted-foreground">Assign teachers to subjects and class sections.</p>
            </div>

            <StaffManagement initialStaff={staff || []} subjects={subjects || []} />
        </div>
    )
}
