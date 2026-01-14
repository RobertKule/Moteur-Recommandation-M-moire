// src/app/(dashboard)/layout.tsx - CORRIGÉ AVEC SYNC DES ÉTATS
'use client'

import React, { useState, useEffect } from 'react'
import DashboardHeader from '@/components/layout/dashboard-header'
import DashboardSidebar from '@/components/layout/dashboard-sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen)
  }

  // Fermer le sidebar mobile quand on passe en desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Fermer le sidebar mobile si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (sidebarOpen && !target.closest('.sidebar-mobile') && !target.closest('.menu-button')) {
        setSidebarOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [sidebarOpen])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader
        onMenuClick={handleSidebarToggle}
      />

      <div className="flex pt-16">
        {/* Sidebar pour desktop - Toujours visible */}
        <aside
          className={`
            hidden lg:block fixed inset-y-0 left-0 z-30
            transition-all duration-300 ease-in-out
            ${isSidebarCollapsed ? 'lg:w-16' : 'lg:w-64'}
          `}
          style={{ top: '4rem' }}
        >
          <div className="h-[calc(100vh-4rem)] overflow-y-auto">

            <DashboardSidebar
              defaultCollapsed={isSidebarCollapsed}
              onCollapsedChange={setIsSidebarCollapsed}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </aside>

        {/* Sidebar mobile - Seulement quand ouverte */}
        <div className={`
          lg:hidden fixed inset-0 z-40
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside
            className="relative w-64 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 sidebar-mobile"
            style={{ top: '4rem' }}
          >
            <div className="h-[calc(100vh-4rem)] overflow-y-auto">
              <DashboardSidebar
                onClose={() => setSidebarOpen(false)}
                defaultCollapsed={false} // Toujours déplié sur mobile
              />
            </div>
          </aside>
        </div>

        {/* Contenu principal avec marge adaptative */}
        <main className={`
          flex-1 transition-all duration-300 ease-in-out
          ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}
        `}>
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}