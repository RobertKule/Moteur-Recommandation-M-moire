'use client'

import { useAuth } from '@/contexts/AuthContext'
import DashboardHeader from '@/components/layout/dashboard-header'
import DashboardSidebar from '@/components/layout/dashboard-sidebar'
import { Loader2 } from 'lucide-react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!user) {
    // NE PAS REDIRIGER ICI
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader />
      <div className="flex pt-16">
        <aside className="hidden lg:block w-64">
          <DashboardSidebar />
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
