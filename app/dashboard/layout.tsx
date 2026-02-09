'use client'

import Link from 'next/link'
import { signOut } from "@/lib/auth"
import { LayoutDashboard, Users, Banknote, GraduationCap, FileQuestion, ShieldCheck, ClipboardList, History, Package, ReceiptText, CreditCard, Menu, X } from "lucide-react"
import { GlobalSearch } from '@/components/global-search'
import { LanguageSwitcher } from '@/components/language-switcher'
import { useState, useEffect } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'DIRECTOR', 'TEACHER', 'ACCOUNTANT', 'REGISTRAR', 'UNIT_LEADER', 'STUDENT', 'PARENT'] },
  { name: 'Staff Management', href: '/dashboard/staff', icon: ShieldCheck, roles: ['ADMIN', 'DIRECTOR', 'UNIT_LEADER'] },
  { name: 'Students', href: '/dashboard/students', icon: Users, roles: ['ADMIN', 'DIRECTOR', 'REGISTRAR', 'UNIT_LEADER', 'TEACHER'] },
  { name: 'Parents', href: '/dashboard/parents', icon: Users, roles: ['ADMIN', 'DIRECTOR', 'REGISTRAR'] },
  { name: 'Attendance', href: '/dashboard/attendance', icon: ClipboardList, roles: ['ADMIN', 'DIRECTOR', 'TEACHER', 'UNIT_LEADER'] },
  { name: 'Attendance History', href: '/dashboard/attendance/history', icon: History, roles: ['ADMIN', 'DIRECTOR', 'TEACHER', 'UNIT_LEADER'] },
  { name: 'Finance', href: '/dashboard/finance', icon: Banknote, roles: ['ADMIN', 'DIRECTOR', 'ACCOUNTANT'] },
  { name: 'Payroll', href: '/dashboard/payroll', icon: ReceiptText, roles: ['ADMIN', 'DIRECTOR', 'ACCOUNTANT'] },
  { name: 'Inventory', href: '/dashboard/inventory', icon: Package, roles: ['ADMIN', 'DIRECTOR', 'ACCOUNTANT', 'UNIT_LEADER'] },
  { name: 'Grades', href: '/dashboard/grades', icon: GraduationCap, roles: ['ADMIN', 'DIRECTOR', 'UNIT_LEADER', 'TEACHER', 'STUDENT', 'PARENT'] },
  { name: 'Exam Bank', href: '/dashboard/exams', icon: FileQuestion, roles: ['ADMIN', 'DIRECTOR', 'UNIT_LEADER', 'TEACHER'] },
  { name: 'ID Cards', href: '/dashboard/id-cards', icon: CreditCard, roles: ['ADMIN', 'DIRECTOR', 'REGISTRAR'] },
  { name: 'Settings', href: '/dashboard/settings', icon: LayoutDashboard, roles: ['ADMIN', 'DIRECTOR'] },
]

function DashboardLayoutClient({
  children,
  session,
  role,
}: {
  children: React.ReactNode
  session: any
  role: string
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleResize = () => {
      const isNowMobile = window.innerWidth < 768
      setIsMobile(isNowMobile)
      if (!isNowMobile) {
        setSidebarOpen(true)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (!mounted) {
    return <div className="flex h-screen bg-gray-100 dark:bg-gray-900" />
  }

  const filteredNavigation = navigation.filter(item => item.roles.includes(role))

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay for mobile */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 w-64 flex-shrink-0 bg-white shadow-md dark:bg-gray-800 flex flex-col z-40 transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
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
        
        <nav className="flex-1 mt-6 px-4 space-y-2 overflow-y-auto">
          {filteredNavigation.map((item) => (
            <Link 
              key={item.href}
              href={item.href}
              onClick={() => isMobile && setSidebarOpen(false)}
              className="flex items-center px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors dark:text-gray-200 dark:hover:bg-gray-700 group"
            >
              <item.icon className="w-5 h-5 mr-3 text-gray-400 group-hover:text-indigo-600 dark:text-gray-500 dark:group-hover:text-white flex-shrink-0" />
              <span className="truncate">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t dark:border-gray-700">
          <form action={async () => {
             "use server"
             await signOut({ redirectTo: "/login" })
          }}>
            <button className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors dark:hover:bg-red-900/20">
              Sign Out
            </button>
          </form>
        </div>
      </aside>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b dark:bg-gray-800 dark:border-gray-700 flex items-center justify-between px-4 md:px-8 flex-shrink-0 z-10">
          <div className="flex-1 ml-12 md:ml-0">
            <GlobalSearch />
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { auth } = await import("@/lib/auth")
  const session = await auth()
  const role = session?.user?.role || 'STUDENT'

  return (
    <DashboardLayoutClient session={session} role={role as string}>
      {children}
    </DashboardLayoutClient>
  )
}
