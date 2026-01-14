// src/components/layout/dashboard-sidebar.tsx 
'use client'

import { 
  Home,
  MessageSquare,
  Target,
  Star,
  BookOpen,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Menu
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import clsx from 'clsx'

interface DashboardSidebarProps {
  onClose?: () => void
  defaultCollapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}

export default function DashboardSidebar({ 
  onClose, 
  defaultCollapsed = false,
  onCollapsedChange
}: DashboardSidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
  const [isHovered, setIsHovered] = useState(false)

  const menuItems = [
    { title: 'Accueil', href: '/dashboard', icon: Home },
    { title: 'Chat', href: '/dashboard/chat', icon: MessageSquare },
    { title: 'Sujets', href: '/dashboard/sujets', icon: Target },
    { title: 'Recommandations', href: '/dashboard/recommendations', icon: Star },
    { title: 'Ressources', href: '/dashboard/ressources', icon: BookOpen },
    { title: 'Profil', href: '/dashboard/profile', icon: MessageSquare }, // Changer FileText si nécessaire
  ]

  const secondaryItems = [
    { title: 'Paramètres', href: '/dashboard/settings', icon: Settings },
    { title: 'Aide', href: '/dashboard/help', icon: HelpCircle },
  ]

  // Fonction pour déterminer si un lien est actif
  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href
    }
    return pathname?.startsWith(href)
  }

  // Notifier le parent du changement d'état
  const toggleCollapsed = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    if (onCollapsedChange) {
      onCollapsedChange(newState)
    }
  }

  // Écouter les changements de defaultCollapsed
  useEffect(() => {
    setIsCollapsed(defaultCollapsed)
  }, [defaultCollapsed])

  return (
    <div 
      className={clsx(
        "h-full flex flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* En-tête avec bouton de réduction */}
      <div className={clsx(
        "flex items-center px-4 py-4 border-b border-gray-200 dark:border-gray-700",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        {(!isCollapsed || isHovered) && (
          <div className={clsx(
            "flex items-center gap-2 transition-opacity",
            isCollapsed ? "absolute left-4 opacity-100" : "opacity-100"
          )}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Menu className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <span className="font-bold text-xl text-gray-800 dark:text-white">
                Dashboard
              </span>
            )}
          </div>
        )}
        
        {/* Bouton de réduction - seulement visible sur desktop */}
        <button
          onClick={toggleCollapsed}
          className={clsx(
            "p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
            isCollapsed ? "mx-auto" : "ml-auto",
            "lg:block" // Seulement sur desktop
          )}
          aria-label={isCollapsed ? "Agrandir le menu" : "Réduire le menu"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          )}
        </button>
      </div>

      {/* Navigation principale */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const active = isActive(item.href)
            const Icon = item.icon
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={clsx(
                  "flex items-center gap-2 rounded-lg transition-colors group",
                  isCollapsed ? "justify-center px-3 py-3" : "justify-between px-4 py-3",
                  active
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                )}
                title={isCollapsed ? item.title : undefined}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {(!isCollapsed || isHovered) && (
                    <span className={clsx(
                      "font-medium whitespace-nowrap transition-opacity",
                      isCollapsed ? "absolute left-12 bg-gray-800 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 z-50" : "opacity-100"
                    )}>
                      {item.title}
                    </span>
                  )}
                </div>
                
                {(!isCollapsed || isHovered) && !isCollapsed && (
                  <ChevronRight className="w-4 h-4 flex-shrink-0" />
                )}
              </Link>
            )
          })}
        </div>

        {/* Section secondaire */}
        <div className={clsx(
          "mt-8 pt-6 border-t border-gray-200 dark:border-gray-700",
          isCollapsed ? "px-2" : "px-0"
        )}>
          <div className="space-y-1">
            {secondaryItems.map((item) => {
              const Icon = item.icon
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={clsx(
                    "flex items-center gap-3 rounded-lg transition-colors group",
                    isCollapsed ? "justify-center px-3 py-3" : "px-4 py-3",
                    'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                  title={isCollapsed ? item.title : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {(!isCollapsed || isHovered) && (
                    <span className={clsx(
                      "whitespace-nowrap transition-opacity",
                      isCollapsed ? "absolute left-12 bg-gray-800 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 z-50" : "opacity-100"
                    )}>
                      {item.title}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Déconnexion */}
      <div className={clsx(
        "p-4 border-t border-gray-200 dark:border-gray-700",
        isCollapsed ? "px-3" : "px-4"
      )}>
        <button 
          className={clsx(
            "flex items-center gap-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg w-full transition-colors group",
            isCollapsed ? "justify-center px-3 py-3" : "px-4 py-3"
          )}
          title={isCollapsed ? "Déconnexion" : undefined}
          onClick={onClose}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {(!isCollapsed || isHovered) && (
            <span className={clsx(
              "font-medium whitespace-nowrap transition-opacity",
              isCollapsed ? "absolute left-12 bg-gray-800 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 z-50" : "opacity-100"
            )}>
              Déconnexion
            </span>
          )}
        </button>
      </div>
    </div>
  )
}