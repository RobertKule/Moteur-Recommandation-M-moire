// src/lib/api-utils.ts
import { api } from './api'

export async function secureRequest<T>(
  requestFn: () => Promise<T>,
  onUnauthorized?: () => void
): Promise<T | null> {
  try {
    return await requestFn()
  } catch (error: any) {
    console.error('Secure request error:', error)
    
    // Si c'est une erreur 401
    if (error?.isUnauthorized || error?.status === 401) {
      // Nettoyer le localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token')
        localStorage.removeItem('user_data')
      }
      
      // Appeler le callback si fourni
      if (onUnauthorized) {
        onUnauthorized()
      }
      
      return null
    }
    
    // Relancer l'erreur pour les autres cas
    throw error
  }
}

// Exemple d'utilisation :
export async function getSecureUser() {
  return secureRequest(
    () => api.getCurrentUser(),
    () => {
      window.location.href = '/login'
    }
  )
}