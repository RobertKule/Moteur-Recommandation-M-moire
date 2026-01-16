// src/app/dashboard/sujets/explore/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { 
  Search,
  Filter,
  Target,
  Heart,
  Eye,
  TrendingUp,
  BookOpen,
  Clock,
  X,
  ChevronDown
} from 'lucide-react'
import Link from 'next/link'
import { api, Sujet } from '@/lib/api'
import { toast } from 'sonner'

export default function ExploreSujetsPage() {
  const [sujets, setSujets] = useState<Sujet[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    domaine: '',
    niveau: '',
    difficulté: '',
    faculté: ''
  })
  const [showFilters, setShowFilters] = useState(false)
  const [interestedSujets, setInterestedSujets] = useState<number[]>([])

  // Charger les sujets
  useEffect(() => {
    fetchSujets()
  }, [])

  const fetchSujets = async () => {
    try {
      setLoading(true)
      const data = await api.getSujets()
      setSujets(data)
    } catch (error: any) {
      toast.error('Erreur lors du chargement des sujets')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleInterested = async (sujetId: number) => {
    try {
      await api.submitFeedback({
        sujet_id: sujetId,
        intéressé: true
      })
      
      setInterestedSujets(prev => 
        prev.includes(sujetId) 
          ? prev.filter(id => id !== sujetId)
          : [...prev, sujetId]
      )
      
      toast.success('Intérêt enregistré')
    } catch (error: any) {
      toast.error(error.message || 'Erreur')
    }
  }

  const filteredSujets = sujets.filter(sujet => {
    if (searchQuery && !sujet.titre.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    if (filters.domaine && !sujet.domaine.toLowerCase().includes(filters.domaine.toLowerCase())) {
      return false
    }
    if (filters.niveau && sujet.niveau !== filters.niveau) {
      return false
    }
    if (filters.difficulté && sujet.difficulté !== filters.difficulté) {
      return false
    }
    if (filters.faculté && !sujet.faculté.toLowerCase().includes(filters.faculté.toLowerCase())) {
      return false
    }
    return true
  })

  // Récupérer les valeurs uniques
  const domaines = [...new Set(sujets.map(s => s.domaine))]
  const niveaux = [...new Set(sujets.map(s => s.niveau))]
  const difficultés = [...new Set(sujets.map(s => s.difficulté))]
  const facultés = [...new Set(sujets.map(s => s.faculté))]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement des sujets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Explorer les sujets</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Découvrez des sujets de mémoire pertinents
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filtres
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Barre de recherche */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="search"
            placeholder="Rechercher un sujet par titre, mots-clés ou problématique..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
          />
        </div>

        {/* Filtres */}
        {showFilters && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Domaine
                </label>
                <select
                  value={filters.domaine}
                  onChange={(e) => setFilters(prev => ({ ...prev, domaine: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                >
                  <option value="">Tous les domaines</option>
                  {domaines.map(domaine => (
                    <option key={domaine} value={domaine}>{domaine}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Niveau
                </label>
                <select
                  value={filters.niveau}
                  onChange={(e) => setFilters(prev => ({ ...prev, niveau: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                >
                  <option value="">Tous les niveaux</option>
                  {niveaux.map(niveau => (
                    <option key={niveau} value={niveau}>{niveau}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Difficulté
                </label>
                <select
                  value={filters.difficulté}
                  onChange={(e) => setFilters(prev => ({ ...prev, difficulté: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                >
                  <option value="">Toutes les difficultés</option>
                  {difficultés.map(dif => (
                    <option key={dif} value={dif}>{dif}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Faculté
                </label>
                <select
                  value={filters.faculté}
                  onChange={(e) => setFilters(prev => ({ ...prev, faculté: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                >
                  <option value="">Toutes les facultés</option>
                  {facultés.map(fac => (
                    <option key={fac} value={fac}>{fac}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Liste des sujets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredSujets.map((sujet) => (
          <div
            key={sujet.id}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {sujet.titre}
                </h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm rounded-full">
                    {sujet.domaine}
                  </span>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm rounded-full">
                    {sujet.niveau}
                  </span>
                  <span className={`px-3 py-1 text-sm rounded-full ${
                    sujet.difficulté === 'facile' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                    sujet.difficulté === 'moyenne' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                    'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  }`}>
                    {sujet.difficulté}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleInterested(sujet.id)}
                className={`p-2 rounded-lg ${interestedSujets.includes(sujet.id) ? 'text-red-600 bg-red-50 dark:bg-red-900/20' : 'text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'}`}
              >
                <Heart className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
              {sujet.description}
            </p>

            <div className="space-y-3 mb-6">
              <div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Problématique
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {sujet.problématique}
                </p>
              </div>
              
              {sujet.keywords && (
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mots-clés
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {sujet.keywords.split(',').map((keyword, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
                        {keyword.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{sujet.vue_count} vues</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>{sujet.like_count} likes</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Link
                  href={`/dashboard/sujets/${sujet.id}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  Voir les détails
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Aucun résultat */}
      {filteredSujets.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Aucun sujet trouvé
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Essayez de modifier vos critères de recherche ou de filtrage
          </p>
        </div>
      )}
    </div>
  )
}