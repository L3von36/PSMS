import { getAtRiskStudents } from "@/actions/analytics"
import { AtRiskStudentsCard } from "./at-risk-card"
import { getTeacherClasses, getTeacherSchedule, seedTeacherSchedule } from "@/actions/teacher"
import { MyClassesCard } from "./my-classes-card"
import { QuickActionsCard } from "./quick-actions"
import { ScheduleCard } from "./schedule-card"
import { NoticeBoard } from "../notice-board"

export async function TeacherOverview({ metrics, notices, canPost }: { metrics: any, notices: any[], canPost: boolean }) {
    // Basic seeding for dev environment to ensure data
    await seedTeacherSchedule()
    
    const classes = await getTeacherClasses()
    const atRiskStudents = await getAtRiskStudents()
    const schedule = await getTeacherSchedule()

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h2>
                <p className="text-muted-foreground">Manage your classroom, attendance, and grading.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <MyClassesCard classes={classes} />
                <QuickActionsCard />
                <AtRiskStudentsCard students={atRiskStudents} />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
               <ScheduleCard schedule={schedule} />
               <NoticeBoard initialNotices={notices} canPost={canPost} />
            </div>
        </div>
    )
}
