// src/contexts/AuthContext.tsx
'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api, User } from '@/lib/api'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: {
    email: string;
    full_name: string;
    password: string;
    role: 'etudiant' | 'enseignant' | 'admin';
  }) => Promise<void>
  logout: () => void
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      const userData = await api.getCurrentUser()
      setUser(userData)
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('access_token')
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await api.login(email, password)
      localStorage.setItem('access_token', response.access_token)
      
      const userData = await api.getCurrentUser()
      setUser(userData)
      
      router.push('/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: {
    email: string;
    full_name: string;
    password: string;
    role: 'etudiant' | 'enseignant' | 'admin';
  }) => {
    setIsLoading(true)
    try {
      const userData = await api.register(data)
      setUser(userData)
      
      // Auto-login after registration
      const loginResponse = await api.login(data.email, data.password)
      localStorage.setItem('access_token', loginResponse.access_token)
      
      router.push('/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    setUser(null)
    router.push('/login')
  }

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