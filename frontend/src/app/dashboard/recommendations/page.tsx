// src/app/(dashboard)/recommendations/page.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Filter, 
  Star, 
  TrendingUp, 
  Clock, 
  BookOpen, 
  Target,
  ChevronRight,
  Download,
  Share2,
  Bookmark,
  Check,
  X,
  Sparkles,
  BarChart,
  Users
} from 'lucide-react'

interface Topic {
  id: number
  title: string
  description: string
  domain: string
  level: string
  match: number
  complexity: 'Facile' | 'Moyen' | 'Avancé'
  duration: string
  resources: number
  tags: string[]
  saved: boolean
}

export default function RecommendationsPage() {
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [sortBy, setSortBy] = useState('match')
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)

  const topics: Topic[] = [
    {
      id: 1,
      title: "Impact de l'IA sur la cybersécurité moderne",
      description: "Analyse des nouvelles techniques d'IA pour la détection et prévention des cyberattaques",
      domain: "Informatique",
      level: "Master 2",
      match: 95,
      complexity: "Avancé",
      duration: "6-9 mois",
      resources: 12,
      tags: ["IA", "Cybersécurité", "Machine Learning"],
      saved: true
    },
    {
      id: 2,
      title: "Blockchain pour la traçabilité alimentaire",
      description: "Étude des applications blockchain dans la supply chain agroalimentaire",
      domain: "Informatique",
      level: "Master 1",
      match: 88,
      complexity: "Moyen",
      duration: "4-6 mois",
      resources: 8,
      tags: ["Blockchain", "Logistique", "IoT"],
      saved: false
    },
    {
      id: 3,
      title: "Optimisation des réseaux 5G avec IA",
      description: "Utilisation de l'IA pour l'optimisation des ressources dans les réseaux 5G",
      domain: "Télécommunications",
      level: "Master 2",
      match: 82,
      complexity: "Avancé",
      duration: "9-12 mois",
      resources: 15,
      tags: ["5G", "IA", "Réseaux"],
      saved: true
    },
    {
      id: 4,
      title: "Énergies renouvelables en milieu urbain",
      description: "Étude de la viabilité des énergies renouvelables dans les grandes villes",
      domain: "Génie Civil",
      level: "Master 2",
      match: 79,
      complexity: "Moyen",
      duration: "6-8 mois",
      resources: 10,
      tags: ["Énergie", "Urbanisme", "Développement"],
      saved: false
    }
  ]

  const filters = [
    { id: 'all', label: 'Tous les sujets', count: topics.length },
    { id: 'saved', label: 'Sauvegardés', count: topics.filter(t => t.saved).length },
    { id: 'highMatch', label: 'Haut match (>85%)', count: topics.filter(t => t.match > 85).length },
    { id: 'informatique', label: 'Informatique', count: topics.filter(t => t.domain === 'Informatique').length },
  ]

  const filteredTopics = topics.filter(topic => {
    if (selectedFilter === 'all') return true
    if (selectedFilter === 'saved') return topic.saved
    if (selectedFilter === 'highMatch') return topic.match > 85
    if (selectedFilter === 'informatique') return topic.domain === 'Informatique'
    return true
  })

  const sortedTopics = [...filteredTopics].sort((a, b) => {
    if (sortBy === 'match') return b.match - a.match
    if (sortBy === 'complexity') {
      const complexityOrder = { 'Facile': 1, 'Moyen': 2, 'Avancé': 3 }
      return complexityOrder[b.complexity] - complexityOrder[a.complexity]
    }
    return 0
  })

  const toggleSave = (id: number) => {
    // Dans une vraie app, on mettrait à jour l'état global ou l'API
    console.log('Toggle save:', id)
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Recommandations</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Sujets personnalisés selon votre profil
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Exporter
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filtres avancés
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{topics.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Sujets suggérés</div>
            </div>
            <Star className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">92%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Match moyen</div>
            </div>
            <Target className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">11.5</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Ressources/sujet</div>
            </div>
            <BookOpen className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">7.2</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Mois moyen</div>
            </div>
            <Clock className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filtres et tri */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Filtrer les recommandations</h2>
            <p className="text-gray-600 dark:text-gray-400">Trouvez les sujets qui correspondent à vos critères</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">Trier par :</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
            >
              <option value="match">Pertinence</option>
              <option value="complexity">Complexité</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {filters.map(filter => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                selectedFilter === filter.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {filter.label}
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                selectedFilter === filter.id
                  ? 'bg-white/20'
                  : 'bg-gray-200 dark:bg-gray-600'
              }`}>
                {filter.count}
              </span>
            </button>
          ))}
        </div>

        {/* Liste des sujets */}
        <div className="space-y-4">
          <AnimatePresence>
            {sortedTopics.map((topic, index) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-lg ${
                  selectedTopic?.id === topic.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={() => setSelectedTopic(topic)}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{topic.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">{topic.description}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleSave(topic.id)
                        }}
                        className={`p-2 rounded-lg ${
                          topic.saved
                            ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                            : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-100 dark:hover:bg-gray-600'
                        }`}
                      >
                        <Bookmark className={`w-5 h-5 ${topic.saved ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{topic.domain}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{topic.level}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{topic.duration}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {topic.tags.map((tag, i) => (
                        <span key={i} className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-4">
                    {/* Score de match */}
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">{topic.match}%</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Match</div>
                    </div>

                    {/* Complexité */}
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      topic.complexity === 'Facile'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : topic.complexity === 'Moyen'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {topic.complexity}
                    </div>

                    <button className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                      <span>Voir détails</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}