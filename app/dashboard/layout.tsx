import Link from 'next/link'
import { auth, signOut } from "@/lib/auth"
import { LayoutDashboard, Users, Banknote, GraduationCap, FileQuestion, ShieldCheck, ClipboardList, History } from "lucide-react"
import { GlobalSearch } from '@/components/global-search'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  const role = session?.user?.role || 'STUDENT'

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'DIRECTOR', 'TEACHER', 'ACCOUNTANT', 'REGISTRAR', 'UNIT_LEADER', 'STUDENT', 'PARENT'] },
    { name: 'Staff Management', href: '/dashboard/staff', icon: ShieldCheck, roles: ['ADMIN', 'DIRECTOR', 'UNIT_LEADER'] },
    { name: 'Students', href: '/dashboard/students', icon: Users, roles: ['ADMIN', 'DIRECTOR', 'REGISTRAR', 'UNIT_LEADER', 'TEACHER'] },
    { name: 'Parents', href: '/dashboard/parents', icon: Users, roles: ['ADMIN', 'DIRECTOR', 'REGISTRAR'] },
    { name: 'Attendance', href: '/dashboard/attendance', icon: ClipboardList, roles: ['ADMIN', 'DIRECTOR', 'TEACHER', 'UNIT_LEADER'] },
    { name: 'Attendance History', href: '/dashboard/attendance/history', icon: History, roles: ['ADMIN', 'DIRECTOR', 'TEACHER', 'UNIT_LEADER'] },
    { name: 'Finance', href: '/dashboard/finance', icon: Banknote, roles: ['ADMIN', 'DIRECTOR', 'ACCOUNTANT'] },
    { name: 'Grades', href: '/dashboard/grades', icon: GraduationCap, roles: ['ADMIN', 'DIRECTOR', 'UNIT_LEADER', 'TEACHER', 'STUDENT', 'PARENT'] },
    { name: 'Exam Bank', href: '/dashboard/exams', icon: FileQuestion, roles: ['ADMIN', 'DIRECTOR', 'UNIT_LEADER', 'TEACHER'] },
  ]

  const filteredNavigation = navigation.filter(item => item.roles.includes(role))
  
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-white shadow-md dark:bg-gray-800 flex flex-col z-20">
        <div className="p-6 border-b dark:border-gray-700">
          <h1 className="text-2xl font-bold text-indigo-600 dark:text-white">PSMS</h1>
          <div className="mt-2 space-y-1">
            <p className="text-sm font-semibold truncate">
              {session?.user?.name || 'User'}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 font-bold uppercase tracking-wider">
                {role}
              </span>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 mt-6 px-4 space-y-2">
          {filteredNavigation.map((item) => (
            <Link 
              key={item.href}
              href={item.href} 
              className="flex items-center px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors dark:text-gray-200 dark:hover:bg-gray-700 group"
            >
              <item.icon className="w-5 h-5 mr-3 text-gray-400 group-hover:text-indigo-600 dark:text-gray-500 dark:group-hover:text-white" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t dark:border-gray-700">
          <form action={async () => {
             "use server"
             await signOut({ redirectTo: "/login" })
          }}>
            <button className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              Sign Out
            </button>
          </form>
        </div>
      </aside>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b dark:bg-gray-800 dark:border-gray-700 flex items-center justify-between px-8 flex-shrink-0 z-10">
          <GlobalSearch />
          <div className="flex items-center gap-4">
            {/* Other header items like notifications, theme toggle could go here */}
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
