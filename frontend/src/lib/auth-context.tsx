'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: number
  email: string
  full_name: string
  role: 'etudiant' | 'enseignant' | 'admin'
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Simuler un utilisateur pour le développement
    const mockUser: User = {
      id: 1,
      email: 'etudiant@example.com',
      full_name: 'Jean Dupont',
      role: 'etudiant'
    }
    setUser(mockUser)
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    // Simulation de login
    const mockUser: User = {
      id: 1,
      email: email,
      full_name: email.split('@')[0],
      role: 'etudiant'
    }
    setUser(mockUser)
    router.push('/dashboard')
  }

  const logout = () => {
    setUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}