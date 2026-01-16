// src/app/dashboard/sujets/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Eye, 
  Heart, 
  Share2, 
  Bookmark, 
  Target, 
  Clock, 
  Users,
  FileText,
  TrendingUp,
  Calendar,
  MessageSquare,
  Download,
  Printer,
  Link as LinkIcon,
  AlertCircle,
  CheckCircle,
  Star,
  Brain,
  Zap,
  X,
  Lightbulb,
  Tag,
  GraduationCap,
  Building,
  Hash
} from 'lucide-react'
import Link from 'next/link'
import { api, Sujet, AIAnalysisResponse } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export default function SujetDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [sujet, setSujet] = useState<Sujet | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isInterested, setIsInterested] = useState(false)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResponse | null>(null)
  const [analyzing, setAnalyzing] = useState(false)

  const sujetId = Number(params.id)

  useEffect(() => {
    if (sujetId) {
      fetchSujet()
    }
  }, [sujetId])

  const fetchSujet = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await api.getSujet(sujetId)
      
      // La réponse API retourne { sujet: {...}, analyse: {...} }
      if (response && response.sujet) {
        setSujet(response.sujet)
        
        // Si l'analyse est déjà incluse dans la réponse
        if (response.analyse) {
          setAiAnalysis(response.analyse)
        }
      } else {
        // Fallback si la structure est différente
        setSujet(response as any)
      }
      
      // Simuler des états initiaux
      setIsLiked(Math.random() > 0.5)
      setIsSaved(Math.random() > 0.7)
      setIsInterested(Math.random() > 0.6)
      
    } catch (err: any) {
      console.error('Error fetching sujet:', err)
      setError(err.message || 'Erreur lors du chargement du sujet')
      toast.error('Impossible de charger le sujet')
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    if (!sujet) return
    
    try {
      setIsLiked(!isLiked)
      await api.submitFeedback({
        sujet_id: sujetId,
        intéressé: !isLiked
      })
      toast.success(isLiked ? 'Like retiré' : 'Sujet liké')
    } catch (err: any) {
      setIsLiked(!isLiked) // Revert on error
      toast.error(err.message || 'Erreur')
    }
  }

  const handleSave = () => {
    if (!sujet) return
    
    setIsSaved(!isSaved)
    toast.success(isSaved ? 'Sujet retiré des favoris' : 'Sujet ajouté aux favoris')
  }

  const handleMarkInterested = async () => {
    if (!sujet) return
    
    try {
      setIsInterested(!isInterested)
      await api.submitFeedback({
        sujet_id: sujetId,
        intéressé: !isInterested,
        sélectionné: !isInterested
      })
      toast.success(isInterested ? 'Intérêt retiré' : 'Intérêt enregistré')
    } catch (err: any) {
      setIsInterested(!isInterested) // Revert on error
      toast.error(err.message || 'Erreur')
    }
  }

  const handleAnalyzeWithAI = async () => {
    if (!sujet) return
    
    try {
      setAnalyzing(true)
      
      const analysis = await api.analyzeSubject({
        titre: sujet.titre,
        description: sujet.description,
        domaine: sujet.domaine || '',
        niveau: sujet.niveau || '',
        faculté: sujet.faculté || '',
        problématique: sujet.problématique || '',
        keywords: sujet.keywords || ''
      })
      
      setAiAnalysis(analysis)
      setShowAnalysis(true)
      toast.success('Analyse IA générée avec succès')
      
    } catch (err: any) {
      console.error('Error analyzing with AI:', err)
      toast.error(err.message || 'Erreur lors de l\'analyse')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleShare = () => {
    if (!sujet) return
    
    if (navigator.share) {
      navigator.share({
        title: sujet.titre,
        text: sujet.description,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Lien copié dans le presse-papier')
    }
  }

  // Fonction utilitaire pour gérer les champs optionnels
  const getKeywords = () => {
    if (!sujet?.keywords) return []
    return sujet.keywords.split(',').map(k => k.trim()).filter(k => k.length > 0)
  }

  const getTechnologies = () => {
    if (!sujet?.technologies) return []
    return sujet.technologies.split(',').map(t => t.trim()).filter(t => t.length > 0)
  }

  const getRessources = () => {
    if (!sujet?.ressources) return []
    return sujet.ressources.split('\n').map(r => r.trim()).filter(r => r.length > 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du sujet...</p>
        </div>
      </div>
    )
  }

  if (error || !sujet) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
        <div className="text-red-600 mb-4">
          <AlertCircle className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {error || 'Sujet non trouvé'}
        </h3>
        <p className="text-gray-600 text-center mb-4">
          Le sujet que vous recherchez n'existe pas ou a été supprimé.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 inline mr-2" />
            Retour
          </button>
          <Link
            href="/dashboard/sujets"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Explorer les sujets
          </Link>
        </div>
      </div>
    )
  }

  const difficultyColor = 
    sujet.difficulté === 'facile' ? 'text-green-600 bg-green-100' :
    sujet.difficulté === 'moyenne' ? 'text-yellow-600 bg-yellow-100' :
    'text-red-600 bg-red-100'

  const difficultyText = 
    sujet.difficulté === 'facile' ? 'Facile' :
    sujet.difficulté === 'moyenne' ? 'Moyenne' :
    'Difficile'

  const keywords = getKeywords()
  const technologies = getTechnologies()
  const ressources = getRessources()

  return (
    <div className="space-y-6">
      {/* Navigation et actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Détail du sujet</h1>
            <p className="text-gray-600">Explorez ce sujet en profondeur</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
            title="Partager"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <button
            onClick={handleSave}
            className={`p-2 rounded-lg ${isSaved ? 'text-yellow-500 bg-yellow-50' : 'text-gray-600 hover:text-yellow-500 hover:bg-yellow-50'}`}
            title={isSaved ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={handleLike}
            className={`p-2 rounded-lg ${isLiked ? 'text-red-500 bg-red-50' : 'text-gray-600 hover:text-red-500 hover:bg-red-50'}`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contenu principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* En-tête du sujet */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full flex items-center gap-1">
                <Building className="w-3 h-3" />
                {sujet.domaine}
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full flex items-center gap-1">
                <GraduationCap className="w-3 h-3" />
                {sujet.niveau}
              </span>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${difficultyColor} flex items-center gap-1`}>
                <Target className="w-3 h-3" />
                {difficultyText}
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                {sujet.faculté}
              </span>
            </div>
            
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              {sujet.titre}
            </h2>
            
            <p className="text-gray-600 text-lg mb-6">
              {sujet.description}
            </p>

            {/* Statistiques */}
            <div className="flex flex-wrap gap-6 py-4 border-t border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="font-semibold text-gray-900">{sujet.vue_count || 0}</div>
                  <div className="text-sm text-gray-500">Vues</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="font-semibold text-gray-900">{sujet.like_count || 0}</div>
                  <div className="text-sm text-gray-500">Likes</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="font-semibold text-gray-900">
                    {sujet.durée_estimée || '3-6 mois'}
                  </div>
                  <div className="text-sm text-gray-500">Durée estimée</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="font-semibold text-gray-900">
                    {sujet.created_at ? new Date(sujet.created_at).toLocaleDateString('fr-FR') : 'Date inconnue'}
                  </div>
                  <div className="text-sm text-gray-500">Ajouté le</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sections détaillées */}
          <div className="space-y-6">
            {/* Problématique */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Problématique
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {sujet.problématique}
              </p>
            </div>

            {/* Méthodologie */}
            {sujet.méthodologie && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  Méthodologie proposée
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {sujet.méthodologie}
                </p>
              </div>
            )}

            {/* Technologies */}
            {technologies.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  Technologies et outils
                </h3>
                <div className="flex flex-wrap gap-2">
                  {technologies.map((tech, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-gray-100 text-gray-800 text-sm rounded-lg">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Mots-clés */}
            {keywords.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Hash className="w-5 h-5 text-blue-600" />
                  Mots-clés
                </h3>
                <div className="flex flex-wrap gap-2">
                  {keywords.map((keyword, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-lg">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Ressources */}
            {ressources.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Download className="w-5 h-5 text-blue-600" />
                  Ressources recommandées
                </h3>
                <div className="space-y-3">
                  {ressources.map((ressource, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <LinkIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{ressource}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-3">
              <button
                onClick={handleMarkInterested}
                className={`w-full px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors ${
                  isInterested
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isInterested ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Intéressé
                  </>
                ) : (
                  <>
                    <Star className="w-5 h-5" />
                    Marquer comme intéressant
                  </>
                )}
              </button>
              
              <button
                onClick={handleAnalyzeWithAI}
                disabled={analyzing}
                className="w-full px-4 py-3 bg-blue-600  text-white rounded-lg hover:from-blue-700 hover:to-pink-700 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50"
              >
                {analyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5" />
                    Analyser avec IA
                  </>
                )}
              </button>
              
              <button
                onClick={() => window.print()}
                className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                <Printer className="w-5 h-5" />
                Imprimer
              </button>
              
              <Link
                href={`/dashboard/chat?topic=${encodeURIComponent(sujet.titre)}`}
                className="block w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-5 h-5" />
                Discuter avec l'IA
              </Link>
            </div>
          </div>

          {/* Info complémentaire */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Informations</h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Statut</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">Actif</span>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500 mb-1">Popularité</div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.min(4, Math.floor((sujet.like_count || 0) / 10)) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {sujet.like_count > 50 ? 'Élevée' : sujet.like_count > 20 ? 'Moyenne' : 'Faible'}
                  </span>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500 mb-1">Complexité</div>
                <div className="flex items-center gap-2">
                  <div className={`w-24 h-2 rounded-full ${
                    sujet.difficulté === 'facile' ? 'bg-green-200' :
                    sujet.difficulté === 'moyenne' ? 'bg-yellow-200' :
                    'bg-red-200'
                  }`}>
                    <div 
                      className={`h-full rounded-full ${
                        sujet.difficulté === 'facile' ? 'w-1/3 bg-green-500' :
                        sujet.difficulté === 'moyenne' ? 'w-2/3 bg-yellow-500' :
                        'w-full bg-red-500'
                      }`}
                    ></div>
                  </div>
                  <span className="font-medium text-gray-900 capitalize">
                    {difficultyText}
                  </span>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500 mb-1">Auteur</div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Users className="w-4 h-4" />
                  <span>Système MemoBot</span>
                </div>
              </div>
            </div>
          </div>

          {/* Suggestions */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-50 rounded-2xl border border-blue-100 p-6">
            <h3 className="font-bold text-gray-900 mb-3">Conseils</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <span className="text-gray-700">Consultez les ressources recommandées</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <span className="text-gray-700">Utilisez l'analyse IA pour évaluer le sujet</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <span className="text-gray-700">Discutez avec l'assistant IA pour plus d'infos</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <span className="text-gray-700">Consultez un enseignant pour validation</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Analyse IA Modal */}
      {showAnalysis && aiAnalysis && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Brain className="w-6 h-6 text-blue-600" />
                Analyse IA du sujet
              </h3>
              <button
                onClick={() => setShowAnalysis(false)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Score de pertinence */}
              <div className="text-center py-6 border-b border-gray-200">
                <div className="text-5xl font-bold text-gray-900 mb-2">
                  {aiAnalysis.pertinence || 75}%
                </div>
                <div className="text-lg text-gray-600">Score de pertinence IA</div>
                <p className="text-sm text-gray-500 mt-2">
                  Basé sur l'analyse des critères académiques et méthodologiques
                </p>
              </div>

              {/* Points forts */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Points forts
                </h4>
                <ul className="space-y-2">
                  {(aiAnalysis.points_forts || []).map((point: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span className="text-gray-700">{point}</span>
                    </li>
                  ))}
                  {(aiAnalysis.points_forts || []).length === 0 && (
                    <li className="text-gray-500 italic p-3 bg-gray-50 rounded-lg">
                      Analyse en cours...
                    </li>
                  )}
                </ul>
              </div>

              {/* Points faibles */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  Points d'amélioration
                </h4>
                <ul className="space-y-2">
                  {(aiAnalysis.points_faibles || []).map((point: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                      <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span className="text-gray-700">{point}</span>
                    </li>
                  ))}
                  {(aiAnalysis.points_faibles || []).length === 0 && (
                    <li className="text-gray-500 italic p-3 bg-gray-50 rounded-lg">
                      Aucun point faible significatif identifié
                    </li>
                  )}
                </ul>
              </div>

              {/* Suggestions */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-blue-600" />
                  Suggestions
                </h4>
                <ul className="space-y-2">
                  {(aiAnalysis.suggestions || []).map((suggestion: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span className="text-gray-700">{suggestion}</span>
                    </li>
                  ))}
                  {(aiAnalysis.suggestions || []).length === 0 && (
                    <li className="text-gray-500 italic p-3 bg-gray-50 rounded-lg">
                      Suggestions en cours de génération...
                    </li>
                  )}
                </ul>
              </div>

              {/* Recommandations */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Star className="w-5 h-5 text-blue-600" />
                  Recommandations
                </h4>
                <ul className="space-y-2">
                  {(aiAnalysis.recommandations || []).map((reco: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span className="text-gray-700">{reco}</span>
                    </li>
                  ))}
                  {(aiAnalysis.recommandations || []).length === 0 && (
                    <li className="text-gray-500 italic p-3 bg-gray-50 rounded-lg">
                      Recommandations à venir...
                    </li>
                  )}
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowAnalysis(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Fermer
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Imprimer l'analyse
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}