'use client'

import { BookOpen } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SubjectSelector({ 
    subjects, 
    value, 
    onChange 
}: { 
    subjects: { id: string, name: string }[], 
    value: string, 
    onChange: (val: string) => void 
}) {
    return (
        <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger className="w-[180px] bg-white dark:bg-slate-950">
                    <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                    {subjects.length === 0 ? (
                        <SelectItem value="none" disabled>No subjects found</SelectItem>
                    ) : (
                        subjects.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                                {s.name}
                            </SelectItem>
                        ))
                    )}
                </SelectContent>
            </Select>
        </div>
    )
}
