import { auth } from '@/lib/auth'
import { DashboardLayoutClient } from './client'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  const role = session?.user?.role || 'GUEST'

  return (
    <DashboardLayoutClient session={session} role={role}>
      {children}
    </DashboardLayoutClient>
  )
}
