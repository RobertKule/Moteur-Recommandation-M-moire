// src/app/(dashboard)/page.tsx 
'use client'

import { Target, Star, MessageSquare, TrendingUp, FileText, ArrowRight, User } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api, Sujet, UserPreference } from '@/lib/api'

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState([
    { label: 'Sujets', value: '0', icon: Target, color: 'text-blue-600' },
    { label: 'Recommandations', value: '0', icon: Star, color: 'text-green-600' },
    { label: 'Messages', value: '0', icon: MessageSquare, color: 'text-gray-600' },
    { label: 'Progression', value: '0%', icon: TrendingUp, color: 'text-orange-600' },
  ])
  const [preferences, setPreferences] = useState<UserPreference | null>(null)
  const [popularSujets, setPopularSujets] = useState<Sujet[]>([])
  const [loading, setLoading] = useState(true)

  const quickActions = [
    { title: 'Continuer le chat', href: '/dashboard/chat', icon: MessageSquare },
    { title: 'Voir recommandations', href: '/dashboard/recommendations', icon: Star },
    { title: 'Explorer sujets', href: '/dashboard/sujets', icon: Target },
    { title: 'Consulter ressources', href: '/dashboard/ressources', icon: FileText },
  ]

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Récupérer les préférences utilisateur
      const prefs = await api.getPreferences()
      setPreferences(prefs)

      // Récupérer les sujets populaires
      const sujets = await api.getPopularSujets(5)
      setPopularSujets(sujets)

      // Mettre à jour les stats
      setStats(prev => prev.map(stat => {
        if (stat.label === 'Sujets') {
          return { ...stat, value: sujets.length.toString() }
        }
        if (stat.label === 'Progression' && prefs.interests) {
          const interestsCount = prefs.interests.split(',').length
          const progress = Math.min(interestsCount * 20, 85)
          return { ...stat, value: `${progress}%` }
        }
        return stat
      }))
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement des données...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec nom d'utilisateur */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Bonjour, {user?.full_name.split(' ')[0] || 'Étudiant'} !
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Bienvenue sur votre espace de recherche de sujet
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Profil rapide */}
      {preferences && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Votre profil académique
              </h3>
              <div className="space-y-2">
                {preferences.level && (
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Niveau: <span className="font-medium">{preferences.level}</span>
                    </span>
                  </div>
                )}
                {preferences.faculty && (
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Faculté: <span className="font-medium">{preferences.faculty}</span>
                    </span>
                  </div>
                )}
                {preferences.interests && (
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Intérêts: <span className="font-medium">{preferences.interests}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
            <Link
              href="/dashboard/profile"
              className="px-4 py-2 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Modifier
            </Link>
          </div>
        </div>
      )}

      {/* Actions rapides */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className="p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:scale-110 transition-transform">
                  <action.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{action.title}</h3>
                  <div className="flex items-center text-sm text-blue-600 dark:text-blue-400 mt-1">
                    <span>Accéder</span>
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Contenu supplémentaire */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sujets populaires */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sujets populaires</h2>
          <div className="space-y-4">
            {popularSujets.length > 0 ? (
              popularSujets.map((sujet) => (
                <Link
                  key={sujet.id}
                  href={`/dashboard/sujets/${sujet.id}`}
                  className="block p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1 line-clamp-1">
                        {sujet.titre}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span>{sujet.domaine}</span>
                        <span>•</span>
                        <span>{sujet.niveau}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                      <Eye className="w-4 h-4" />
                      <span>{sujet.vue_count}</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">Aucun sujet populaire pour le moment</p>
              </div>
            )}
          </div>
        </div>

        {/* Progression */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Votre progression</h2>
          <div className="space-y-4">
            {[
              { label: 'Profil complété', progress: 100 },
              { label: 'Critères définis', progress: preferences?.interests ? 85 : 30 },
              { label: 'Sujets explorés', progress: popularSujets.length > 0 ? 60 : 20 },
              { label: 'Analyse approfondie', progress: 30 },
            ].map((item, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{item.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${item.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Suggestion d'action */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              💡 <strong>Conseil :</strong> Complétez vos préférences pour obtenir des recommandations plus précises.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}