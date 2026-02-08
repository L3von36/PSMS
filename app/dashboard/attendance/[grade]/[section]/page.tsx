import { getClassRoster, getTeacherSubjectsForClass } from "@/actions/teacher"
import { AttendanceTracker } from "@/components/dashboard/teacher/attendance-tracker"

export default async function AttendanceClassPage(props: { params: Promise<{ grade: string, section: string }> }) {
    const params = await props.params
    const [students, subjects] = await Promise.all([
        getClassRoster(params.grade, params.section),
        getTeacherSubjectsForClass(params.grade, params.section)
    ])

    return (
        <div className="space-y-6">
            <AttendanceTracker 
                students={students as any}
                subjects={subjects as any}
                grade={params.grade} 
                section={params.section} 
            />
        </div>
    )
}
