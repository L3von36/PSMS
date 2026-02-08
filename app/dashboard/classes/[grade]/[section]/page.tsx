import { getClassRoster } from "@/actions/teacher"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StudentIdCardButton } from "@/components/student/id-card-generator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default async function ClassRosterPage(props: { params: Promise<{ grade: string, section: string }> }) {
    const params = await props.params
    const students = await getClassRoster(params.grade, params.section)

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Class Roster</h2>
                <p className="text-muted-foreground">
                    Grade {params.grade}-{params.section} • {students.length} Students
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Student List</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {students.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">No students found in this class.</p>
                        ) : (
                            <div className="grid gap-4">
                                {students.map((student) => (
                                    <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={student.photoUrl || ""} />
                                                <AvatarFallback>{student.firstName[0]}{student.lastName[0]}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{student.firstName} {student.lastName}</p>
                                                <div className="text-xs text-muted-foreground flex gap-2">
                                                    <span>ID: {student.id.slice(-6).toUpperCase()}</span>
                                                    <span>•</span>
                                                    <span>{student.email || "No email"}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                           <StudentIdCardButton student={student} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
