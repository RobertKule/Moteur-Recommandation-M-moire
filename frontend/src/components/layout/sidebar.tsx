'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  MessageSquare, 
  BookOpen, 
  TrendingUp, 
  User, 
  Settings, 
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Home,
  Star
} from 'lucide-react'

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Chat IA', href: '/dashboard/chat', icon: MessageSquare },
  { name: 'Sujets', href: '/dashboard/sujets', icon: BookOpen },
  { name: 'Recommandations', href: '/dashboard/recommandations', icon: Star },
  { name: 'Statistiques', href: '/dashboard/stats', icon: TrendingUp },
  { name: 'Profil', href: '/dashboard/profile', icon: User },
]

const secondaryItems = [
  { name: 'Paramètres', href: '/dashboard/settings', icon: Settings },
  { name: 'Aide', href: '/dashboard/help', icon: HelpCircle },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-40 ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="h-full flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg">MemoBot</span>
              </div>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Navigation principale */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              )
            })}
          </div>

          {/* Séparateur */}
          {!collapsed && <div className="my-6 border-t border-gray-200"></div>}

          {/* Navigation secondaire */}
          <div className="space-y-2">
            {secondaryItems.map((item) => {
              const Icon = item.icon
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 p-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Icon className="w-5 h-5 text-gray-500" />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="p-4 border-t border-gray-100">
            <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900">Besoin d'aide ?</p>
              <p className="text-xs text-gray-600 mt-1">Notre équipe est là pour vous aider</p>
              <button className="mt-3 w-full py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                Contactez-nous
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}