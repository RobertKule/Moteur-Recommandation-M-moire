'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { MessageSquare, X, Send, Bot, Loader2, LogIn, Sparkles, ChevronUp, ArrowUp } from 'lucide-react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

interface Message {
  id: number
  text: string
  sender: 'user' | 'bot'
  timestamp: string
}

// Suggestions de questions pour les nouveaux utilisateurs
const QUICK_SUGGESTIONS = [
  "Comment choisir un bon sujet de mémoire ?",
  "Quelle méthodologie pour un mémoire en informatique ?",
  "Comment formuler une problématique ?",
  "Donne-moi des idées de sujets en IA",
  "Combien de temps faut-il pour un mémoire ?"
]

export default function QuickChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      text: "👋 Bonjour ! Je suis MemoBot, votre assistant pour trouver le sujet de mémoire parfait.\n\nJe peux vous aider à :\n• Explorer des idées de sujets\n• Affiner votre problématique\n• Choisir une méthodologie\n• Structurer votre mémoire", 
      sender: 'bot',
      timestamp: getCurrentTime()
    },
    { 
      id: 2, 
      text: "💡 Essayez une de ces questions ou posez-moi votre propre question !", 
      sender: 'bot',
      timestamp: getCurrentTime()
    }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [showChatBubble, setShowChatBubble] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Utilisez useAuth pour vérifier si l'utilisateur est connecté
  const { user } = useAuth?.() || { user: null }

  // Fonction utilitaire pour l'heure
  function getCurrentTime() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Cacher la bulle de chat après 5 secondes
  useEffect(() => {
    if (showChatBubble) {
      const timer = setTimeout(() => {
        setShowChatBubble(false)
      }, 5000)
      
      return () => clearTimeout(timer)
    }
  }, [showChatBubble])

  // Réafficher la bulle quand l'utilisateur hover le bouton
  const handleMouseEnter = () => {
    setShowChatBubble(true)
  }

  // Scroll vers le dernier message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Gestion du clavier
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false)
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Fonction pour envoyer un message
  const handleSend = useCallback(async (text?: string) => {
    const messageToSend = text || message.trim()
    if (!messageToSend || isLoading) return
    
    // Ajouter message utilisateur
    const userMessage: Message = {
      id: Date.now(),
      text: messageToSend,
      sender: 'user',
      timestamp: getCurrentTime()
    }
    
    setMessages(prev => [...prev, userMessage])
    
    if (!text) setMessage('') // Ne pas effacer si c'est une suggestion
    
    setIsLoading(true)
    setIsTyping(true)

    try {
      // Utiliser l'API publique ou authentifiée selon le statut
      let response
      if (user) {
        // Utilisateur connecté - utiliser l'API authentifiée
        response = await api.askAI(messageToSend)
      } else {
        // Utilisateur non connecté - utiliser l'API publique
        response = await api.askAIPublic(messageToSend)
      }
      
      // Simulation de frappe
      await new Promise(resolve => setTimeout(resolve, 500))
      setIsTyping(false)
      
      // Ajouter réponse de l'IA
      const botMessage: Message = {
        id: Date.now() + 1,
        text: response.réponse || response.message || "Je n'ai pas pu traiter votre demande. Pourriez-vous reformuler ?",
        sender: 'bot',
        timestamp: getCurrentTime()
      }
      
      setMessages(prev => [...prev, botMessage])
      
    } catch (error) {
      console.error('Erreur API:', error)
      setIsTyping(false)
      
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: "Désolé, je rencontre une difficulté technique. Veuillez réessayer.",
        sender: 'bot',
        timestamp: getCurrentTime()
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [message, isLoading, user])

  // Gestion du clic sur une suggestion
  const handleQuickSuggestion = (suggestion: string) => {
    handleSend(suggestion)
  }

  // Gestion du clic sur le fond
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false)
    }
  }

  return (
    <>
      {/* Bouton de chat flottant amélioré */}
      <div className="fixed bottom-6 left-6 z-40">
        {/* Bulle de chat avec flèche qui rebondit */}
        {showChatBubble && (
          <div className="absolute bottom-16 left-0 mb-2 animate-fade-in-up">
            <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg max-w-[180px]">
              <div className="flex items-center gap-2">
                <ArrowUp className="w-3 h-3 animate-bounce-slow" />
                <span>Posez votre question ici !</span>
              </div>
              {/* Pointe de la bulle */}
              <div className="absolute -bottom-1 left-4 w-3 h-3 bg-blue-600 transform rotate-45"></div>
            </div>
          </div>
        )}

        <button
          onClick={() => {
            setIsOpen(true)
            setShowChatBubble(false)
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={() => {
            // Ne pas cacher immédiatement, laisser le timeout le faire
          }}
          className="relative w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center group"
          aria-label="Ouvrir le chat avec l'assistant IA"
        >
          {/* Effet de halo pulsant */}
          <div className="absolute inset-0 rounded-full bg-blue-500 opacity-20 animate-ping-slow"></div>
          
          {/* Icône du chat avec effet de brillance */}
          <div className="relative z-10">
            <MessageSquare className="w-6 h-6" />
            {/* Point vert indiquant que l'IA est active */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse ring-2 ring-white"></div>
          </div>
          
          {/* Texte au survol */}
          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg pointer-events-none">
            <span className="flex items-center gap-1">
              <ChevronUp className="w-3 h-3 animate-bounce" />
              Assistant IA MemoBot
            </span>
          </span>
          
          {/* Flèche qui rebondit en permanence */}
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronUp className="w-4 h-4 text-blue-600 animate-bounce-slow" />
          </div>
        </button>
      </div>

      {/* Modal de chat avec bordure animée */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleBackgroundClick}
        >
          {/* Conteneur avec bordure animée (gradient qui se déplace) */}
          <div className="relative p-[3px] rounded-3xl bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 animate-border-spin">
            
            {/* Contenu du modal */}
            <div 
              className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              
              {/* En-tête */}
              <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">MemoBot Assistant</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {user ? 'Assistant IA personnel' : 'Posez vos questions sur les mémoires'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              {/* Zone des messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-950">
                {/* Messages */}
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] ${msg.sender === 'user' ? 'ml-auto' : ''}`}>
                        <div className={`rounded-2xl px-4 py-3 ${msg.sender === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-none'
                          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                        }`}>
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                        <div className={`mt-1 text-xs ${msg.sender === 'user' 
                          ? 'text-gray-500 text-right' 
                          : 'text-gray-400 text-left'}`}>
                          {msg.timestamp}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Indicateur de frappe */}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="max-w-[85%]">
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-none px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                            <span className="text-sm text-gray-500">MemoBot réfléchit...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Suggestions rapides */}
                  {messages.length <= 3 && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">💡 Questions fréquentes :</p>
                      <div className="flex flex-wrap gap-2">
                        {QUICK_SUGGESTIONS.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleQuickSuggestion(suggestion)}
                            disabled={isLoading}
                            className="px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Bannière de connexion */}
              {!user && messages.length > 2 && (
                <div className="px-5 py-3 bg-inherit border-t border-blue-200 dark:border-blue-900 border border-blue-600 border-2 m-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Créez un compte pour :
                      </span>
                    </div>
                    <Link
                      href="/register"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <LogIn className="w-3 h-3" />
                      S'inscrire gratuitement
                    </Link>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <span>• Sauvegarder les conversations</span>
                    <span>• Générer des sujets personnalisés</span>
                    <span>• Suivre votre progression</span>
                    <span>• Accès complet aux outils</span>
                  </div>
                </div>
              )}

              {/* Zone de saisie */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSend()
                        }
                      }}
                      placeholder={user 
                        ? "Posez votre question sur votre mémoire..."
                        : "Posez votre question (ex: idées de sujets, méthodologie...)"
                      }
                      className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm placeholder-gray-500"
                      rows={1}
                      disabled={isLoading}
                      style={{ minHeight: '56px', maxHeight: '120px' }}
                    />
                    <div className="absolute right-3 bottom-3 text-xs text-gray-400">
                      {message.length}/500
                    </div>
                  </div>
                  <button
                    onClick={() => handleSend()}
                    disabled={!message.trim() || isLoading}
                    className="px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}