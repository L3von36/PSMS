import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getParentData } from "@/actions/parent"
import { ParentPageClient } from "@/components/parents/parent-page-client"

export default async function ParentsPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }

  const allowedRoles = ['ADMIN', 'DIRECTOR', 'REGISTRAR']
  if (!allowedRoles.includes(session.user.role)) {
    redirect("/dashboard")
  }

  const { parents, students } = await getParentData()

  return <ParentPageClient parents={parents} students={students} />
}
