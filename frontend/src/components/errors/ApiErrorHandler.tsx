// src/components/errors/ApiErrorHandler.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function useApiErrorHandler() {
  const router = useRouter()

  useEffect(() => {
    // Intercepter les erreurs globales
    const handleError = (event: ErrorEvent) => {
      const error = event.error
      
      // Vérifier si c'est une erreur 401
      if (error?.isUnauthorized || error?.status === 401) {
        event.preventDefault()
        
        // Nettoyer le localStorage
        localStorage.removeItem('access_token')
        localStorage.removeItem('user_data')
        
        // Afficher une notification
        toast.error('Session expirée', {
          description: 'Votre session a expiré. Veuillez vous reconnecter.',
          duration: 5000,
        })
        
        // Rediriger vers login
        setTimeout(() => {
          router.push('/login')
        }, 1000)
      }
    }

    // Ajouter le listener d'erreur
    window.addEventListener('error', handleError)

    return () => {
      window.removeEventListener('error', handleError)
    }
  }, [router])
}

// Composant wrapper
export function ApiErrorHandler({ children }: { children: React.ReactNode }) {
  useApiErrorHandler()
  return <>{children}</>
}