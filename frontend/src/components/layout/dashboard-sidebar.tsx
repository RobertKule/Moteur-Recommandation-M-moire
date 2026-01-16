// src/components/layout/dashboard-sidebar.tsx
'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Home, 
  Search, 
  Sparkles, 
  MessageSquare, 
  Brain, 
  Settings, 
  User,
  BookOpen,
  TrendingUp,
  Target,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
  FileText,
  Heart
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface DashboardSidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
  onClose?: () => void
  isMobile: boolean
}

export default function DashboardSidebar({ 
  collapsed, 
  onToggleCollapse, 
  onClose,
  isMobile 
}: DashboardSidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    if (onClose) onClose()
  }

  // Navigation basée sur vos pages existantes
  const mainNavItems = [
    {
      title: 'Tableau de bord',
      icon: Home,
      href: '/dashboard',
      color: 'text-blue-600'
    },
    {
      title: 'Recherche',
      icon: Search,
      href: '/dashboard/sujets/explore',
      color: 'text-green-600'
    },
    {
      title: 'Recommandations',
      icon: Sparkles,
      href: '/dashboard/recommendations',
      color: 'text-blue-600'
    },
    {
      title: 'Assistant IA',
      icon: MessageSquare,
      href: '/dashboard/chat',
      color: 'text-cyan-600'
    }
  ]

  const toolsNavItems = [
    {
      title: 'Sujets',
      icon: Target,
      href: '/dashboard/sujets',
      color: 'text-orange-600'
    },
    {
      title: 'Ressources',
      icon: FileText,
      href: '/dashboard/ressources',
      color: 'text-teal-600'
    },
    {
      title: 'Favoris',
      icon: Heart,
      href: '/dashboard/favoris',
      color: 'text-red-600'
    },
    {
      title: 'Historique',
      icon: TrendingUp,
      href: '/dashboard/historique',
      color: 'text-yellow-600'
    }
  ]

  const settingsNavItems = [
    {
      title: 'Profil',
      icon: User,
      href: '/dashboard/profile',
      color: 'text-gray-600'
    },
    {
      title: 'Paramètres',
      icon: Settings,
      href: '/dashboard/settings',
      color: 'text-gray-600'
    }
  ]

  const NavItem = ({ 
    item, 
    isCollapsed 
  }: { 
    item: typeof mainNavItems[0]
    isCollapsed: boolean 
  }) => {
    const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
    
    return (
      <Link
        href={item.href}
        onClick={onClose}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
          isActive 
            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
      >
        <div className={`p-2 rounded-lg ${item.color} ${isActive ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-gray-100 dark:bg-gray-800'}`}>
          <item.icon className="w-5 h-5" />
        </div>
        {!isCollapsed && (
          <span className="font-medium flex-1">{item.title}</span>
        )}
        {!isCollapsed && isActive && (
          <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
        )}
      </Link>
    )
  }

  const NavSection = ({ 
    title, 
    items, 
    isCollapsed 
  }: { 
    title: string
    items: typeof mainNavItems
    isCollapsed: boolean 
  }) => {
    if (isCollapsed) {
      return (
        <div className="space-y-1">
          {items.map((item) => (
            <NavItem key={item.href} item={item} isCollapsed={isCollapsed} />
          ))}
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <h3 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {title}
        </h3>
        <div className="space-y-1">
          {items.map((item) => (
            <NavItem key={item.href} item={item} isCollapsed={isCollapsed} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      {/* Header du sidebar */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  MemoBot
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Recherche de sujets
                </p>
              </div>
            </div>
          )}

          {collapsed && (
            <div className="w-full flex justify-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
            </div>
          )}

          {/* Boutons de contrôle */}
          <div className="flex items-center gap-2">
            {isMobile && (
              <button
                onClick={onClose}
                className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {!isMobile && (
              <button
                onClick={onToggleCollapse}
                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                title={collapsed ? "Agrandir" : "Réduire"}
              >
                {collapsed ? (
                  <ChevronRight className="w-5 h-5" />
                ) : (
                  <ChevronLeft className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 space-y-6">
        <NavSection 
          title="Principal" 
          items={mainNavItems} 
          isCollapsed={collapsed} 
        />
        
        <NavSection 
          title="Outils" 
          items={toolsNavItems} 
          isCollapsed={collapsed} 
        />
        
        <NavSection 
          title="Paramètres" 
          items={settingsNavItems} 
          isCollapsed={collapsed} 
        />
      </div>

      {/* Footer du sidebar */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        {!collapsed ? (
          <div className="space-y-4">
            {/* Profil utilisateur */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.full_name || 'Utilisateur'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email || 'email@exemple.com'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {user?.role === 'etudiant' ? 'Étudiant' : 
                   user?.role === 'enseignant' ? 'Enseignant' : 
                   user?.role === 'admin' ? 'Administrateur' : ''}
                </p>
              </div>
            </div>

            {/* Bouton déconnexion */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Déconnexion</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            {/* Avatar utilisateur réduit */}
            <div className="relative group">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
                <User className="w-5 h-5 text-white" />
              </div>
              {/* Tooltip pour le mode réduit */}
              <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {user?.full_name || 'Utilisateur'}
              </div>
            </div>

            {/* Bouton déconnexion réduit */}
            <button
              onClick={handleLogout}
              className="relative group p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Déconnexion"
            >
              <LogOut className="w-5 h-5" />
              {/* Tooltip pour le mode réduit */}
              <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Déconnexion
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}