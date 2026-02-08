"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, BookOpen, GraduationCap, UserCog } from "lucide-react"
import { assignTeacher, removeAssignment } from "@/actions/staff"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function StaffManagement({ initialStaff, subjects }: { initialStaff: any[], subjects: any[] }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedStaff, setSelectedStaff] = useState<any>(null)
    const router = useRouter()

    async function handleAddAssignment(formData: FormData) {
        const grade = formData.get("grade") as string
        const section = formData.get("section") as string
        const subjectId = formData.get("subjectId") as string

        const res = await assignTeacher(selectedStaff.id, grade, section, subjectId)
        if (res.success) {
            toast.success(res.message)
            setIsDialogOpen(false)
            router.refresh()
        } else {
            toast.error(res.message)
        }
    }

    async function handleRemoveAssignment(id: string) {
        const res = await removeAssignment(id)
        if (res.success) {
            toast.success(res.message)
            router.refresh()
        } else {
            toast.error(res.message)
        }
    }

    return (
        <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {initialStaff.map((member) => (
                    <Card key={member.id} className="overflow-hidden">
                        <CardHeader className="bg-muted/50 pb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-full bg-primary/10 p-2">
                                        <UserCog className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">{member.firstName} {member.lastName}</CardTitle>
                                        <CardDescription className="text-xs uppercase font-semibold text-primary/70">{member.role}</CardDescription>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex flex-wrap gap-2 min-h-[40px]">
                                {member.assignments?.length === 0 ? (
                                    <p className="text-xs text-muted-foreground italic">No class assignments found.</p>
                                ) : (
                                    member.assignments.map((a: any) => (
                                        <Badge key={a.id} variant="secondary" className="flex items-center gap-1.5 py-1 px-2.5">
                                            <GraduationCap className="h-3.5 w-3.5" />
                                            <span className="font-medium">{a.grade}{a.section}</span>
                                            {a.subject && (
                                                <span className="flex items-center gap-1.5 border-l pl-2 ml-1 text-muted-foreground">
                                                    <BookOpen className="h-3.5 w-3.5" />
                                                    {a.subject.name}
                                                </span>
                                            )}
                                            <button 
                                                onClick={() => handleRemoveAssignment(a.id)}
                                                className="ml-1.5 text-muted-foreground hover:text-destructive transition-colors"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))
                                )}
                            </div>
                            
                            <Dialog open={isDialogOpen && selectedStaff?.id === member.id} onOpenChange={(open) => {
                                setIsDialogOpen(open)
                                if (open) setSelectedStaff(member)
                            }}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="w-full">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Assignment
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <form action={handleAddAssignment}>
                                        <DialogHeader>
                                            <DialogTitle>Assign {member.firstName}</DialogTitle>
                                            <DialogDescription>
                                                Link this teacher to a specific grade and section.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-6 py-6">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Grade Label</label>
                                                    <Input name="grade" placeholder="e.g. 10" required />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Section</label>
                                                    <Input name="section" placeholder="e.g. A" required />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Subject Role</label>
                                                <Select name="subjectId">
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select taught subject" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {subjects.map(s => (
                                                            <SelectItem key={s.id} value={s.id}>{s.name} (Grade {s.gradeLevel})</SelectItem>
                                                        ))}
                                                        <SelectItem value="null">General / Class Teacher</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button type="submit" className="w-full">Save Assignment</Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
