"use client"
import { createNotice } from "@/actions/notice"
import { useState, useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Megaphone, Send, Bell } from "lucide-react"
import { toast } from "sonner"

export function NoticeBoard({ initialNotices, canPost }: { initialNotices: any[], canPost: boolean }) {
    const [notices, setNotices] = useState(initialNotices)
    const [isPending, startTransition] = useTransition()
    const [showForm, setShowForm] = useState(false)

    const handlePost = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        startTransition(async () => {
            const result = await createNotice(formData)
            if (result.success) {
                toast.success(result.message)
                setShowForm(false)
                // Refresh logic would ideally re-fetch or use optimistic updates
            } else {
                toast.error(result.message)
            }
        })
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <Megaphone className="h-5 w-5 text-indigo-600" />
                    School Notice Board
                </h3>
                {canPost && (
                    <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)}>
                        {showForm ? "Cancel" : "Post Notice"}
                    </Button>
                )}
            </div>

            {showForm && (
                <Card className="border-indigo-100 bg-indigo-50/30">
                    <CardContent className="pt-6">
                        <form onSubmit={handlePost} className="space-y-4">
                            <Input name="title" placeholder="Notice Title" required />
                            <Textarea name="content" placeholder="Type notice details here..." required />
                            <div className="flex gap-4">
                                <select name="target" className="flex-1 rounded-md border p-2 bg-background text-sm">
                                    <option value="ALL">Everyone</option>
                                    <option value="STUDENT">Students Only</option>
                                    <option value="PARENT">Parents Only</option>
                                    <option value="STAFF">Staff Only</option>
                                </select>
                                <select name="priority" className="flex-1 rounded-md border p-2 bg-background text-sm">
                                    <option value="NORMAL">Normal Priority</option>
                                    <option value="HIGH">High Priority</option>
                                    <option value="URGENT">Urgent</option>
                                </select>
                            </div>
                            <Button type="submit" className="w-full" disabled={isPending}>
                                <Send className="h-4 w-4 mr-2" />
                                {isPending ? "Posting..." : "Broadcast Notice"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4">
                {notices.map((notice) => (
                    <Card key={notice.id} className={notice.priority === 'URGENT' ? 'border-red-200 bg-red-50/20' : ''}>
                        <CardHeader className="py-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-base font-bold">{notice.title}</CardTitle>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                                        {new Date(notice.createdAt).toLocaleDateString()} • For: {notice.target}
                                    </p>
                                </div>
                                {notice.priority === 'URGENT' && (
                                    <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full animate-pulse">
                                        <Bell className="h-3 w-3" /> URGENT
                                    </span>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="pb-4">
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{notice.content}</p>
                        </CardContent>
                    </Card>
                ))}
                {notices.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed rounded-xl opacity-50">
                        <p className="text-sm text-muted-foreground">No active notices.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
