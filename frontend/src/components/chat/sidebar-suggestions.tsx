'use client'

import React from 'react'
import { BookOpen, TrendingUp, Star, Target, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function SidebarSuggestions() {
  const suggestedTopics = [
    {
      id: '1',
      title: 'IA en Éducation',
      description: 'Applications du machine learning pour l\'apprentissage personnalisé',
      field: 'Informatique',
      difficulty: 'Moyen',
      popularity: 'Tendance',
      tags: ['IA', 'Éducation', 'Machine Learning']
    },
    {
      id: '2',
      title: 'FinTech & Blockchain',
      description: 'Sécurité et innovation dans les systèmes financiers décentralisés',
      field: 'Finance',
      difficulty: 'Avancé',
      popularity: 'En croissance',
      tags: ['Blockchain', 'FinTech', 'Sécurité']
    },
    {
      id: '3',
      title: 'Énergie Renouvelable',
      description: 'Optimisation des réseaux électriques avec l\'IA',
      field: 'Génie',
      difficulty: 'Intermédiaire',
      popularity: 'Prioritaire',
      tags: ['Énergie', 'IA', 'Optimisation']
    },
    {
      id: '4',
      title: 'Santé Digitale',
      description: 'Télémédecine et analyse de données médicales',
      field: 'Médecine',
      difficulty: 'Intermédiaire',
      popularity: 'Très populaire',
      tags: ['Santé', 'Données', 'IA']
    }
  ]

  const trendingTags = [
    'Machine Learning', 'Data Science', 'IA Éthique', 'Cybersécurité',
    'IoT', 'Big Data', 'Cloud Computing', 'DevOps', 'UX/UI'
  ]

  return (
    <div className="space-y-6">
      {/* Statistiques rapides */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Votre activité
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">Questions posées</div>
            <div className="font-semibold">24</div>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">Sujets explorés</div>
            <div className="font-semibold">12</div>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">Recommandations</div>
            <div className="font-semibold">8</div>
          </div>
        </CardContent>
      </Card>

      {/* Sujets suggérés */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="w-4 h-4" />
            Sujets populaires
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {suggestedTopics.map((topic) => (
            <div key={topic.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-sm">{topic.title}</h4>
                <Badge variant="secondary" className="text-xs">
                  {topic.field}
                </Badge>
              </div>
              <p className="text-xs text-gray-600 mb-2">{topic.description}</p>
              <div className="flex flex-wrap gap-1 mb-2">
                {topic.tags.map((tag, index) => (
                  <span key={index} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {topic.difficulty}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  {topic.popularity}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Mots-clés tendance */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Mots-clés à explorer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {trendingTags.map((tag, index) => (
              <button
                key={index}
                className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conseils rapides */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">💡 Conseils</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <div className="p-2 bg-blue-50 rounded">
            <p className="font-medium text-blue-800">Définissez votre problématique</p>
            <p className="text-xs">Une bonne problématique est spécifique et testable</p>
          </div>
          <div className="p-2 bg-green-50 rounded">
            <p className="font-medium text-green-800">Validez avec un expert</p>
            <p className="text-xs">Discutez toujours de votre sujet avec un enseignant</p>
          </div>
          <div className="p-2 bg-purple-50 rounded">
            <p className="font-medium text-purple-800">Planifiez votre temps</p>
            <p className="text-xs">Prévoyez 20% de temps supplémentaire pour les imprévus</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}