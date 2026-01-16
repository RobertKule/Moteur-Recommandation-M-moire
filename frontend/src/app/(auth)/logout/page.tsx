'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { LogOut, CheckCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function LogoutPage() {
  const { logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Attendre un peu pour l'effet visuel
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Déconnexion
        await logout()
        
        toast.success('Déconnexion réussie')
        
        // Redirection vers la page d'accueil après déconnexion
        setTimeout(() => {
          router.push('/')
        }, 1000)
        
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error)
        toast.error('Erreur lors de la déconnexion')
        
        // Redirection même en cas d'erreur
        setTimeout(() => {
          router.push('/')
        }, 2000)
      }
    }

    performLogout()
  }, [logout, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <LogOut className="w-10 h-10 text-white" />
          </motion.div>

          {/* Titre */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Déconnexion en cours...
          </motion.h1>

          {/* Message */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600 dark:text-gray-400 mb-8"
          >
            Nous nettoyons votre session et sécurisons vos données.
          </motion.p>

          {/* Animation de chargement */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <div className="relative">
              {/* Cercle de progression */}
              <div className="w-32 h-32 mx-auto relative">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  {/* Cercle de fond */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    className="dark:stroke-gray-700"
                  />
                  {/* Cercle de progression */}
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="8"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: "283", strokeDashoffset: "283" }}
                    animate={{ strokeDashoffset: 0 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                
                {/* Icône au centre */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.5, type: "spring" }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Étapes de déconnexion */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="space-y-3 text-left mb-8"
          >
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7 }}
                className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center"
              >
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              </motion.div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Suppression du token d'authentification
              </span>
            </div>

            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.9 }}
                className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center"
              >
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              </motion.div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Nettoyage des données de session
              </span>
            </div>

            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.1 }}
                className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center"
              >
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              </motion.div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Sécurisation de votre compte
              </span>
            </div>
          </motion.div>

          {/* Message final */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
            className="text-center"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Redirection vers la page d'accueil...
            </p>
          </motion.div>
        </motion.div>

        {/* Info de sécurité */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-center"
        >
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Votre session a été sécurisée. Vous pouvez fermer cette fenêtre en toute sécurité.
          </p>
        </motion.div>
      </div>
    </div>
  )
}