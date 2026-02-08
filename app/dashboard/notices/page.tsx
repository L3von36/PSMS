import { Suspense } from "react"
import { NoticeBoard } from "@/components/dashboard/notice-board"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

async function GetNotices() {
  const session = await auth()
  if (!session?.user?.schoolId) return <NoticeBoard initialNotices={[]} canPost={false} />

  const notices = await prisma.notice.findMany({
    where: { schoolId: session.user.schoolId },
    orderBy: { createdAt: 'desc' },
    take: 10
  })

  return <NoticeBoard initialNotices={notices} canPost={['ADMIN', 'SUPER_ADMIN', 'TEACHER'].includes(session.user.role || '')} />
}

export default function NoticesPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Announcements & Notices</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-indigo-600" />
                Recent Notices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Loading notices...</div>}>
                <GetNotices />
            </Suspense>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-green-600" />
                Create New Notice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
                Broadcast a new message to students, parents, or staff members of your school.
            </p>
            <Button className="w-full gap-2">
                <Plus className="h-4 w-4" />
                Draft Announcement
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
