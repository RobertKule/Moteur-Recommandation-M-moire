// src/app/(auth)/register/page.tsx - VERSION CONNECTÉE À L'API
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, Mail, Lock, GraduationCap, BookOpen, Check, Sparkles, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import ThemeToggle from '@/components/ui/theme-toggle'

export default function RegisterPage() {
  const router = useRouter()
  const { register, isLoading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [step, setStep] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    studyLevel: 'licence',
    domain: 'informatique',
    interests: '',
    terms: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation étape par étape
    if (step < 3) {
      nextStep()
      return
    }

    // Validation finale
    if (!formData.terms) {
      setError('Veuillez accepter les conditions d\'utilisation')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    setError(null)

    try {
      // Appel à l'API via le contexte d'authentification
      await register({
        email: formData.email,
        full_name: formData.fullName,
        password: formData.password,
        role: 'etudiant'  // Par défaut, tous les nouveaux sont étudiants
      })

      // La redirection se fait automatiquement dans le contexte
      // après l'inscription réussie
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de l\'inscription')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const target = e.target as HTMLInputElement
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? target.checked : value
    }))
    
    // Effacer les erreurs quand l'utilisateur modifie
    if (error) setError(null)
  }

  const nextStep = () => {
    // Validation avant de passer à l'étape suivante
    if (step === 1) {
      if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
        setError('Veuillez remplir tous les champs obligatoires')
        return
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError('Les mots de passe ne correspondent pas')
        return
      }
      
      if (formData.password.length < 6) {
        setError('Le mot de passe doit contenir au moins 6 caractères')
        return
      }
    } else if (step === 2) {
      if (!formData.studyLevel || !formData.domain) {
        setError('Veuillez sélectionner votre niveau et domaine d\'études')
        return
      }
    }
    
    setError(null)
    if (step < 3) setStep(step + 1)
  }

  const prevStep = () => {
    setError(null)
    if (step > 1) setStep(step - 1)
  }

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  }

  const slideIn = {
    hidden: { opacity: 0, x: 20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3 }
    }
  }

  const studyLevels = [
    { value: 'licence', label: 'Licence (L3)' },
    { value: 'master1', label: 'Master 1' },
    { value: 'master2', label: 'Master 2' },
    { value: 'doctorat', label: 'Doctorat' },
    { value: 'ingenieur', label: 'Cycle Ingénieur' }
  ]

  const domains = [
    { value: 'genie_informatique', label: 'Génie Informatique' },
    { value: 'genie_civil', label: 'Génie Civil' },
    { value: 'genie_electrique', label: 'Génie Electrique' },
    { value: 'genie_mecanique', label: 'Génie Mecanique' },
    { value: 'genie_electronique', label: 'Génie Electronique' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
      {/* Toggle du thème */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Carte d'inscription */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl"
      >
        {/* En-tête */}
        <motion.div 
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="text-center mb-8"
        >
          <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">MemoBot</div>
              <div className="text-sm text-blue-600 dark:text-blue-400">Commencez votre parcours</div>
            </div>
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Rejoignez notre communauté
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Créez votre compte pour trouver votre sujet idéal
          </p>
        </motion.div>

        {/* Indicateur de progression */}
        <motion.div 
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= s 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}>
                  {s}
                </div>
                {s < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > s ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span className={step >= 1 ? 'text-blue-600 dark:text-blue-400 font-medium' : ''}>
              Informations personnelles
            </span>
            <span className={step >= 2 ? 'text-blue-600 dark:text-blue-400 font-medium' : ''}>
              Profil académique
            </span>
            <span className={step >= 3 ? 'text-blue-600 dark:text-blue-400 font-medium' : ''}>
              Finalisation
            </span>
          </div>
        </motion.div>

        {/* Formulaire */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8"
        >
          {/* Message d'erreur */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.form 
              key={step}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={slideIn}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* Étape 1 : Informations personnelles */}
              {step === 1 && (
                <>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nom complet *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="fullName"
                          name="fullName"
                          type="text"
                          required
                          value={formData.fullName}
                          onChange={handleChange}
                          disabled={isLoading}
                          className="pl-10 w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                          placeholder="Jean Dupont"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email académique *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          disabled={isLoading}
                          className="pl-10 w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                          placeholder="jean.dupont@universite.ac"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Mot de passe *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          required
                          value={formData.password}
                          onChange={handleChange}
                          disabled={isLoading}
                          className="pl-10 pr-10 w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                          placeholder="••••••••"
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Confirmer le mot de passe *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          disabled={isLoading}
                          className="pl-10 pr-10 w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={isLoading}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Liste de validation du mot de passe */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                      Votre mot de passe doit contenir :
                    </p>
                    <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-400">
                      <li className={`flex items-center gap-2 ${formData.password.length >= 6 ? 'text-green-600' : ''}`}>
                        <Check className="w-4 h-4" />
                        Au moins 6 caractères
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        Pour plus de sécurité, ajoutez :
                      </li>
                      <li className="flex items-center gap-2 ml-4 text-sm text-gray-600 dark:text-gray-400">
                        • Une majuscule et une minuscule
                      </li>
                      <li className="flex items-center gap-2 ml-4 text-sm text-gray-600 dark:text-gray-400">
                        • Un chiffre ou un caractère spécial
                      </li>
                    </ul>
                  </div>
                </>
              )}

              {/* Étape 2 : Profil académique */}
              {step === 2 && (
                <>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="studyLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Niveau d'études *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <GraduationCap className="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                          id="studyLevel"
                          name="studyLevel"
                          required
                          value={formData.studyLevel}
                          onChange={handleChange}
                          disabled={isLoading}
                          className="pl-10 w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 dark:text-white appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="">Sélectionnez votre niveau</option>
                          {studyLevels.map(level => (
                            <option key={level.value} value={level.value}>
                              {level.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="domain" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Domaine d'études *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <BookOpen className="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                          id="domain"
                          name="domain"
                          required
                          value={formData.domain}
                          onChange={handleChange}
                          disabled={isLoading}
                          className="pl-10 w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 dark:text-white appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="">Sélectionnez votre domaine</option>
                          {domains.map(domain => (
                            <option key={domain.value} value={domain.value}>
                              {domain.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="interests" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Vos centres d'intérêt (optionnel)
                    </label>
                    <textarea
                      id="interests"
                      name="interests"
                      rows={3}
                      value={formData.interests}
                      onChange={handleChange}
                      disabled={isLoading}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 dark:text-white resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Ex: Intelligence artificielle, Développement web, Recherche appliquée..."
                    />
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Ces informations nous aideront à mieux personnaliser vos recommandations. 
                      Vous pourrez les modifier plus tard.
                    </p>
                  </div>
                </>
              )}

              {/* Étape 3 : Finalisation */}
              {step === 3 && (
                <>
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      Presque terminé !
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8">
                      Vérifiez vos informations et acceptez les conditions pour finaliser votre inscription
                    </p>

                    {/* Récapitulatif */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 max-w-md mx-auto mb-8 text-left">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Nom :</span>
                          <span className="font-medium text-gray-900 dark:text-white">{formData.fullName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Email :</span>
                          <span className="font-medium text-gray-900 dark:text-white">{formData.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Niveau :</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {studyLevels.find(l => l.value === formData.studyLevel)?.label}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Domaine :</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {domains.find(d => d.value === formData.domain)?.label}
                          </span>
                        </div>
                        {formData.interests && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Intérêts :</span>
                            <span className="font-medium text-gray-900 dark:text-white text-right">
                              {formData.interests.length > 30 ? `${formData.interests.substring(0, 30)}...` : formData.interests}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Conditions */}
                    <div className="text-left max-w-md mx-auto">
                      <div className="flex items-start">
                        <input
                          id="terms"
                          name="terms"
                          type="checkbox"
                          required
                          checked={formData.terms}
                          onChange={handleChange}
                          disabled={isLoading}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded mt-1 disabled:opacity-50"
                        />
                        <label htmlFor="terms" className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                          J'accepte les{' '}
                          <Link href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline">
                            Conditions d'utilisation
                          </Link>{' '}
                          et la{' '}
                          <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">
                            Politique de confidentialité
                          </Link>
                          . Je comprends que mes données seront utilisées pour améliorer mes recommandations.
                        </label>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Boutons de navigation */}
              <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={isLoading}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Retour
                  </button>
                ) : (
                  <div></div>
                )}

                {step < 3 ? (
                  <motion.button
                    whileHover={!isLoading ? { scale: 1.02 } : {}}
                    whileTap={!isLoading ? { scale: 0.98 } : {}}
                    type="button"
                    onClick={nextStep}
                    disabled={isLoading}
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Continuer</span>
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={!isLoading && formData.terms ? { scale: 1.02 } : {}}
                    whileTap={!isLoading && formData.terms ? { scale: 0.98 } : {}}
                    type="submit"
                    disabled={isLoading || !formData.terms}
                    className="px-8 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Inscription en cours...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        <span>Finaliser l'inscription</span>
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </motion.form>
          </AnimatePresence>

          {/* Lien vers login */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Vous avez déjà un compte ?{' '}
              <Link 
                href="/login" 
                className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm text-green-700 dark:text-green-300">
              Inscrivez-vous gratuitement et commencez dès aujourd'hui
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[
              { icon: GraduationCap, text: "Recommandations personnalisées" },
              { icon: BookOpen, text: "Accès à toutes les ressources" },
              { icon: Check, text: "Support académique inclus" }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-center gap-2 justify-center"
              >
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center">
                  <feature.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400">{feature.text}</span>
              </motion.div>
            ))}
          </div>
          
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <p>En vous inscrivant, vous acceptez nos <Link href="/terms" className="underline hover:text-blue-600">Conditions d'utilisation</Link></p>
            <p className="mt-1">et notre <Link href="/privacy" className="underline hover:text-blue-600">Politique de confidentialité</Link></p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}