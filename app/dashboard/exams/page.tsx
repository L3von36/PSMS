import { getExamData } from "@/actions/exam"
import { ExamsPageClient } from "@/components/exams/exams-page-client"

export default async function ExamPage() {
  const { exams, questions, subjects } = await getExamData()
  
  // Filter out exams with null subjects
  const validExams = exams.filter(e => e.subject !== null) as any[]

  return <ExamsPageClient exams={validExams} questions={questions} subjects={subjects} />
}
