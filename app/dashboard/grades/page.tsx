import { getGradingData } from "@/actions/grading"
import { GradingPageClient } from "@/components/grading/grading-page-client"

export default async function GradingPage() {
  const { subjects, recentGrades, students } = await getGradingData()
  
  // Filter out grades with null students or subjects
  const validGrades = recentGrades.filter(g => g.student !== null && g.subject !== null) as any[]

  return <GradingPageClient grades={validGrades} subjects={subjects} students={students} />
}
