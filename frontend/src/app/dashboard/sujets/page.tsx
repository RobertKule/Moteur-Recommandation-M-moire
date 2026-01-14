// src/app/(dashboard)/sujets/page.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Target,
  BookOpen,
  Clock,
  Users,
  MessageSquare,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Plus,
  Filter,
  Search,
  TrendingUp,
  BarChart,
  FileText
} from 'lucide-react'

interface Topic {
  id: number
  title: string
  status: 'exploration' | 'selection' | 'analyse' | 'validation' | 'finalisé'
  progress: number
  match: number
  createdAt: string
  updatedAt: string
  notes: number
  discussions: number
  resources: number
}

export default function SujetsPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const topics: Topic[] = [
    {
      id: 1,
      title: "IA et cybersécurité moderne",
      status: 'analyse',
      progress: 75,
      match: 95,
      createdAt: '15/01/2024',
      updatedAt: '28/01/2024',
      notes: 8,
      discussions: 12,
      resources: 15
    },
    {
      id: 2,
      title: "Blockchain pour la traçabilité",
      status: 'selection',
      progress: 40,
      match: 88,
      createdAt: '18/01/2024',
      updatedAt: '25/01/2024',
      notes: 5,
      discussions: 8,
      resources: 10
    },
    {
      id: 3,
      title: "Optimisation réseaux 5G avec IA",
      status: 'exploration',
      progress: 25,
      match: 82,
      createdAt: '20/01/2024',
      updatedAt: '22/01/2024',
      notes: 3,
      discussions: 5,
      resources: 8
    },
    {
      id: 4,
      title: "Énergies renouvelables urbaines",
      status: 'validation',
      progress: 90,
      match: 79,
      createdAt: '10/01/2024',
      updatedAt: '27/01/2024',
      notes: 12,
      discussions: 15,
      resources: 20
    }
  ]

  const statusConfig = {
    exploration: { label: 'Exploration', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
    selection: { label: 'Sélection', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
    analyse: { label: 'Analyse', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
    validation: { label: 'Validation', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
    finalisé: { label: 'Finalisé', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' }
  }

  const filteredTopics = topics.filter(topic => {
    if (selectedStatus !== 'all' && topic.status !== selectedStatus) return false
    if (searchQuery && !topic.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mes sujets</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Gérez et suivez l'avancement de vos sujets de mémoire
              </p>
            </div>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Nouveau sujet
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{topics.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Sujets actifs</div>
            </div>
            <Target className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">57%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Progression moyenne</div>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">28</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Notes totales</div>
            </div>
            <FileText className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">40</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Échanges</div>
            </div>
            <MessageSquare className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Tous vos sujets</h2>
            <p className="text-gray-600 dark:text-gray-400">Suivez l'avancement de chaque sujet</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="search"
                placeholder="Rechercher un sujet..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white w-full sm:w-64"
              />
            </div>
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
            >
              <option value="all">Tous les statuts</option>
              {Object.entries(statusConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Liste des sujets */}
        <div className="space-y-4">
          {filteredTopics.map((topic, index) => (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                {/* Infos principales */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{topic.title}</h3>
                      <div className="flex items-center gap-4 mb-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig[topic.status].color}`}>
                          {statusConfig[topic.status].label}
                        </span>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>Créé le {topic.createdAt}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Progression */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-700 dark:text-gray-300">Progression</span>
                      <span className="font-medium text-gray-900 dark:text-white">{topic.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${topic.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-6">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">{topic.match}%</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Match</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">{topic.notes}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Notes</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <MessageSquare className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">{topic.discussions}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Échanges</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                        <BookOpen className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">{topic.resources}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Ressources</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 lg:w-48">
                  <button className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Continuer
                  </button>
                  <button className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2">
                    <BarChart className="w-4 h-4" />
                    Analytics
                  </button>
                  <button className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2">
                    <Users className="w-4 h-4" />
                    Partager
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Aucun résultat */}
        {filteredTopics.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucun sujet trouvé</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Aucun sujet ne correspond à vos critères de recherche
            </p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Créer un nouveau sujet
            </button>
          </div>
        )}
      </div>
    </div>
  )
}