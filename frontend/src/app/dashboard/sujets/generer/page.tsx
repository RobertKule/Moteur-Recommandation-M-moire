// src/app/dashboard/sujets/generer/page.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Sparkles, 
  Brain, 
  Target, 
  Clock, 
  Zap,
  Copy,
  Download,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Filter,
  Plus,
  X,
  Lightbulb,
  BookOpen,
  TrendingUp
} from 'lucide-react'
import { api } from '@/lib/api'
import { toast } from 'sonner'

interface GeneratedSubject {
  titre: string
  problématique: string
  keywords: string
  description: string
  methodologie: string
  difficulté: string
  durée_estimée: string
}

export default function GenerateSubjectsPage() {
  const [loading, setLoading] = useState(false)
  const [generatedSubjects, setGeneratedSubjects] = useState<GeneratedSubject[]>([])
  const [formData, setFormData] = useState({
    interests: '',
    domaine: '',
    niveau: '',
    faculté: '',
    count: 3
  })
  const [selectedSubject, setSelectedSubject] = useState<GeneratedSubject | null>(null)
  const [savedSubjects, setSavedSubjects] = useState<string[]>([])

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleGenerate = async () => {
    if (!formData.interests.trim()) {
      toast.error('Veuillez spécifier au moins un centre d\'intérêt')
      return
    }

    try {
      setLoading(true)
      
      const interestsArray = formData.interests
        .split(',')
        .map(interest => interest.trim())
        .filter(interest => interest)

      const generated = await api.generateSubjects({
        interests: interestsArray,
        domaine: formData.domaine || undefined,
        niveau: formData.niveau || undefined,
        faculté: formData.faculté || undefined,
        count: formData.count
      })

      setGeneratedSubjects(generated)
      setSelectedSubject(generated[0] || null)
      
      toast.success(`${generated.length} sujets générés avec succès`)
      
    } catch (error: any) {
      console.error('Error generating subjects:', error)
      toast.error(error.message || 'Erreur lors de la génération')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSubject = (titre: string) => {
    if (savedSubjects.includes(titre)) {
      setSavedSubjects(prev => prev.filter(t => t !== titre))
      toast.success('Sujet retiré des sauvegardés')
    } else {
      setSavedSubjects(prev => [...prev, titre])
      toast.success('Sujet sauvegardé')
    }
  }

  const handleCopySubject = (subject: GeneratedSubject) => {
    const text = `Titre: ${subject.titre}\nProblématique: ${subject.problématique}\nDescription: ${subject.description}\nMéthodologie: ${subject.methodologie}\nDifficulté: ${subject.difficulté}\nDurée estimée: ${subject.durée_estimée}`
    
    navigator.clipboard.writeText(text)
    toast.success('Sujet copié dans le presse-papier')
  }

  const handleExportSubject = (subject: GeneratedSubject) => {
    const data = {
      titre: subject.titre,
      problématique: subject.problématique,
      description: subject.description,
      methodologie: subject.methodologie,
      difficulté: subject.difficulté,
      durée_estimée: subject.durée_estimée,
      keywords: subject.keywords,
      export_date: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sujet-${subject.titre.toLowerCase().replace(/[^a-z0-9]/g, '-')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Sujet exporté au format JSON')
  }

  const handleReset = () => {
    setFormData({
      interests: '',
      domaine: '',
      niveau: '',
      faculté: '',
      count: 3
    })
    setGeneratedSubjects([])
    setSelectedSubject(null)
  }

  const difficultyColors: Record<string, string> = {
    'Facile': 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
    'Moyen': 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400',
    'Difficile': 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400',
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-pink-600 rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Générer des sujets avec IA</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Utilisez l'intelligence artificielle pour créer des sujets personnalisés
            </p>
          </div>
        </div>
        <button
          onClick={handleReset}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Réinitialiser
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulaire de génération */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 sticky top-24">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Paramètres de génération</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Centres d'intérêt *
                </label>
                <textarea
                  value={formData.interests}
                  onChange={(e) => handleInputChange('interests', e.target.value)}
                  placeholder="IA, Blockchain, Énergies renouvelables, Marketing digital..."
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 min-h-[100px]"
                  rows={3}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Séparez par des virgules
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Domaine
                </label>
                <input
                  type="text"
                  value={formData.domaine}
                  onChange={(e) => handleInputChange('domaine', e.target.value)}
                  placeholder="Informatique, Finance, Santé..."
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Niveau académique
                </label>
                <select
                  value={formData.niveau}
                  onChange={(e) => handleInputChange('niveau', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                >
                  <option value="">Tous niveaux</option>
                  <option value="Licence 1">Licence 1</option>
                  <option value="Licence 2">Licence 2</option>
                  <option value="Licence 3">Licence 3</option>
                  <option value="Master 1">Master 1</option>
                  <option value="Master 2">Master 2</option>
                  <option value="Doctorat">Doctorat</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Faculté / École
                </label>
                <input
                  type="text"
                  value={formData.faculté}
                  onChange={(e) => handleInputChange('faculté', e.target.value)}
                  placeholder="Faculté des Sciences, École d'Ingénieurs..."
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre de sujets à générer
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleInputChange('count', Math.max(1, formData.count - 1))}
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    disabled={formData.count <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-lg font-medium text-gray-900 dark:text-white min-w-[2rem] text-center">
                    {formData.count}
                  </span>
                  <button
                    onClick={() => handleInputChange('count', formData.count + 1)}
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    disabled={formData.count >= 10}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleGenerate}
                  disabled={loading || !formData.interests.trim()}
                  className="w-full px-4 py-3 bg-blue-600  text-white rounded-lg hover:from-blue-700 hover:to-pink-700 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Générer des sujets avec IA
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Conseils */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-600" />
                Conseils pour de meilleurs résultats
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
                  <span className="text-gray-600 dark:text-gray-400">Soyez spécifique dans vos centres d'intérêt</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
                  <span className="text-gray-600 dark:text-gray-400">Précisez votre niveau académique</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
                  <span className="text-gray-600 dark:text-gray-400">Le domaine aide à contextualiser les sujets</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Résultats */}
        <div className="lg:col-span-2 space-y-6">
          {generatedSubjects.length > 0 ? (
            <>
              {/* Liste des sujets générés */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generatedSubjects.map((subject, index) => {
                  const isSelected = selectedSubject?.titre === subject.titre
                  const isSaved = savedSubjects.includes(subject.titre)
                  
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => setSelectedSubject(subject)}
                      className={`cursor-pointer bg-white dark:bg-gray-800 rounded-xl border ${
                        isSelected 
                          ? 'border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/20' 
                          : 'border-gray-200 dark:border-gray-700'
                      } p-4 hover:shadow-lg transition-all`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                            {subject.titre}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              difficultyColors[subject.difficulté] || 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                            }`}>
                              {subject.difficulté}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {subject.durée_estimée}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSaveSubject(subject.titre)
                          }}
                          className={`p-1.5 rounded-lg ${
                            isSaved 
                              ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' 
                              : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                          }`}
                        >
                          <Save className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                        {subject.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-1">
                        {subject.keywords.split(',').slice(0, 3).map((keyword, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
                            {keyword.trim()}
                          </span>
                        ))}
                        {subject.keywords.split(',').length > 3 && (
                          <span className="px-2 py-0.5 text-gray-500 text-xs">+{subject.keywords.split(',').length - 3}</span>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {/* Détail du sujet sélectionné */}
              {selectedSubject && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedSubject.titre}
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopySubject(selectedSubject)}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                        title="Copier"
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleExportSubject(selectedSubject)}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
                        title="Exporter"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleSaveSubject(selectedSubject.titre)}
                        className={`p-2 rounded-lg ${
                          savedSubjects.includes(selectedSubject.titre)
                            ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                            : 'text-gray-600 dark:text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                        }`}
                        title={savedSubjects.includes(selectedSubject.titre) ? "Retirer des sauvegardés" : "Sauvegarder"}
                      >
                        <Save className={`w-5 h-5 ${savedSubjects.includes(selectedSubject.titre) ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Métadonnées */}
                    <div className="flex flex-wrap gap-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Difficulté</div>
                          <div className={`font-medium ${
                            selectedSubject.difficulté === 'Facile' ? 'text-green-600' :
                            selectedSubject.difficulté === 'Moyen' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {selectedSubject.difficulté}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Durée estimée</div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {selectedSubject.durée_estimée}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Mots-clés</div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {selectedSubject.keywords.split(',').length}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Problématique */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Problématique</h4>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {selectedSubject.problématique}
                      </p>
                    </div>

                    {/* Description */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Description</h4>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {selectedSubject.description}
                      </p>
                    </div>

                    {/* Méthodologie */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Méthodologie proposée</h4>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {selectedSubject.methodologie}
                      </p>
                    </div>

                    {/* Mots-clés */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Mots-clés</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedSubject.keywords.split(',').map((keyword, idx) => (
                          <span key={idx} className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm rounded-lg">
                            {keyword.trim()}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => handleGenerate()}
                        className="px-4 py-2.5 bg-blue-600  text-white rounded-lg hover:from-blue-700 hover:to-pink-700 flex items-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Régénérer
                      </button>
                      <button
                        onClick={() => toast.info('Fonctionnalité à venir')}
                        className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <BookOpen className="w-4 h-4" />
                        Analyser ce sujet
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          ) : (
            /* État initial */
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-pink-100 dark:from-blue-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Générer votre premier sujet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                Remplissez le formulaire avec vos centres d'intérêt et cliquez sur "Générer" pour créer des sujets personnalisés avec l'IA.
              </p>
              <div className="inline-flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Sujets 100% originaux</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Adaptés à votre niveau</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Méthodologie incluse</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Composant Minus pour le compteur
function Minus(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

// Composant Plus pour le compteur
function Plus(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}