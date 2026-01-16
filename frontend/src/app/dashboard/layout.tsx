// src/app/dashboard/layout.tsx
'use client'

import { useAuth } from '@/contexts/AuthContext'
import DashboardHeader from '@/components/layout/dashboard-header'
import DashboardSidebar from '@/components/layout/dashboard-sidebar'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'

export default function DashboardLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const { user, isLoading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <DashboardHeader 
        onMenuClick={toggleSidebar} 
      />

      <div className="flex pt-16">
        {/* Mobile Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <DashboardSidebar 
            collapsed={false}
            onToggleCollapse={toggleSidebarCollapse}
            onClose={() => setSidebarOpen(false)}
            isMobile={true}
          />
        </aside>

        {/* Desktop Sidebar */}
        <aside className={`hidden lg:block fixed inset-y-0 left-0 pt-16 z-40 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}>
          <DashboardSidebar 
            collapsed={sidebarCollapsed}
            onToggleCollapse={toggleSidebarCollapse}
            onClose={() => setSidebarOpen(false)}
            isMobile={false}
          />
        </aside>

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        } ${sidebarOpen ? 'ml-64' : 'ml-0'} p-4 md:p-6`}>
          {children}
        </main>
      </div>
    </div>
  )
}