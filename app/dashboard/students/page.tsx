import { getStudents } from "@/actions/student"
import { StudentPageClient } from "@/components/students/student-page-client"

export default async function StudentsPage({ searchParams }: { searchParams: Promise<{ studentId?: string }> }) {
  const params = await searchParams
  const result = await getStudents()
  const students = (result.success && result.students) ? result.students : []

  return <StudentPageClient students={students} initialStudentId={params.studentId} />
}
