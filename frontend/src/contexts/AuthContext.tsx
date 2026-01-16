// src/contexts/AuthContext.tsx - VERSION CORRIGÉE
'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { api, User } from '@/lib/api'
import { usePathname, useRouter } from 'next/navigation'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<User>
  register: (data: {
    email: string
    full_name: string
    password: string
    role: 'etudiant' | 'enseignant' | 'admin'
  }) => Promise<User>
  logout: () => void
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Fonction pour nettoyer le storage
  const clearAuthStorage = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user_data')
      localStorage.removeItem('user_preferences')
    }
  }

  // Fonction pour rediriger vers login
  const redirectToLogin = () => {
    const publicPaths = ['/', '/login', '/register', '/forgot-password', '/reset-password']
    const isPublicPath = publicPaths.some(path => pathname?.startsWith(path))
    
    if (!isPublicPath && typeof window !== 'undefined') {
      router.push('/login')
    }
  }

  /**
   * 🔐 Initialisation de l'auth
   */
  useEffect(() => {
    let mounted = true

    const initAuth = async () => {
      try {
        // Vérifier si on est côté client
        if (typeof window === 'undefined') {
          setIsLoading(false)
          return
        }

        const token = localStorage.getItem('access_token')

        if (!token) {
          if (mounted) {
            setUser(null)
            setIsLoading(false)
          }
          redirectToLogin()
          return
        }

        // Récupérer les données utilisateur
        const userData = await api.getCurrentUser()
        
        if (mounted) {
          setUser(userData)
          setIsLoading(false)
        }

      } catch (error: any) {
        console.error('Auth initialization error:', error)
        
        // Si c'est une erreur 401, nettoyer et rediriger
        if (error?.isUnauthorized || error?.status === 401) {
          clearAuthStorage()
          
          if (mounted) {
            setUser(null)
            setIsLoading(false)
          }
          
          redirectToLogin()
        } else {
          // Pour les autres erreurs, garder l'utilisateur connecté
          // mais marquer comme chargé
          if (mounted) {
            setIsLoading(false)
          }
        }
      }
    }

    initAuth()

    return () => {
      mounted = false
    }
  }, [pathname, router])

  /**
   * 🔑 LOGIN
   */
  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true)

    try {
      const response = await api.login(email, password)

      if (!response?.access_token) {
        throw new Error('No access token received')
      }

      localStorage.setItem('access_token', response.access_token)

      const userData = await api.getCurrentUser()
      setUser(userData)

      // Rediriger après connexion réussie
      router.push('/dashboard')

      return userData

    } catch (error: any) {
      clearAuthStorage()
      setUser(null)
      throw new Error(error.message || 'Échec de la connexion')

    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 📝 REGISTER
   */
  const register = async (data: {
    email: string
    full_name: string
    password: string
    role: 'etudiant' | 'enseignant' | 'admin'
  }): Promise<User> => {
    setIsLoading(true)

    try {
      await api.register(data)

      const loginResponse = await api.login(data.email, data.password)

      if (!loginResponse?.access_token) {
        throw new Error('No access token after registration')
      }

      localStorage.setItem('access_token', loginResponse.access_token)

      const userData = await api.getCurrentUser()
      setUser(userData)

      // Rediriger après inscription réussie
      router.push('/dashboard')

      return userData

    } catch (error: any) {
      throw new Error(error.message || 'Échec de l\'inscription')

    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 🚪 LOGOUT
   */
  const logout = () => {
    clearAuthStorage()
    setUser(null)
    setIsLoading(false)
    router.push('/login')
  }

  /**
   * 🔄 UPDATE USER
   */
  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}