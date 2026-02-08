import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { IDCardGenerator } from "@/components/id-card-generator"

export default async function IDCardsPage() {
    const session = await auth()
    const schoolId = (session?.user as any)?.schoolId

    if (!schoolId) return <div>Unauthorized</div>

    const [students, school] = await Promise.all([
        prisma.student.findMany({
            where: { schoolId }
        }),
        prisma.school.findUnique({
            where: { id: schoolId }
        })
    ])

    return (
        <div className="space-y-6 p-8">
            <h1 className="text-3xl font-bold">ID Card Generator</h1>
            <p className="text-muted-foreground">Generate and print professional ID cards for students.</p>
            <IDCardGenerator students={students} schoolName={school?.name || "School ID"} />
        </div>
    )
}
