// src/app/dashboard/chat/page.tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Bot,
  User,
  Send,
  RefreshCw,
  Copy,
  MessageSquare,
  BookOpen,
  Sparkles,
  TrendingUp,
  Clock,
  HelpCircle,
  Lightbulb,
  Zap,
  Loader2,
  Eye,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react'
import Link from 'next/link'
import { api, Sujet, AIResponse } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

interface Message {
  id: number
  sender: 'user' | 'bot'
  content: string
  time: string
}

export default function ChatPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const topicParam = searchParams?.get('topic')

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [popularTopics, setPopularTopics] = useState<Sujet[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [showQuickActions, setShowQuickActions] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  function getCurrentTime() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const isInputEmpty = !input || !input.trim()
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    // Initialiser les messages avec ou sans topic
    if (topicParam) {
      const decodedTopic = decodeURIComponent(topicParam)
      setMessages([
        {
          id: 1,
          sender: 'bot',
          content: `👋 Bonjour ${user?.full_name || ''} ! Je vois que vous voulez discuter du sujet :\n\n**${decodedTopic}**\n\nJe suis MemoBot, votre assistant IA spécialisé pour vous aider à trouver le sujet de mémoire idéal.\n\nJe peux vous aider à analyser ce sujet, suggérer des améliorations, ou vous proposer des sujets similaires.\n\nQue souhaitez-vous savoir sur ce sujet ?`,
          time: getCurrentTime()
        }
      ])
      setInput(`Parle-moi du sujet : ${decodedTopic}`)
    } else {
      setMessages([
        {
          id: 1,
          sender: 'bot',
          content: `👋 Bonjour ${user?.full_name || ''} ! Je suis MemoBot, votre assistant IA spécialisé pour vous aider à trouver le sujet de mémoire idéal.\n\nJe peux vous aider à :\n• Générer des idées de sujets personnalisés\n• Analyser et évaluer vos propositions  \n• Vous guider sur la méthodologie\n• Répondre à toutes vos questions\n\nDe quoi avez-vous besoin aujourd'hui ?`,
          time: getCurrentTime()
        }
      ])
      setInput('') // Assurez-vous que input est initialisé même sans topicParam
    }

    loadPopularTopics()
    inputRef.current?.focus()
  }, [topicParam, user?.full_name])

  // Auto-scroll quand les messages changent
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const loadPopularTopics = async () => {
    try {
      const topics = await api.getPopularSujets(3)
      setPopularTopics(topics || [])
    } catch (error) {
      console.error('Erreur chargement sujets populaires:', error)
    }
  }

  const handleSend = async () => {
    if (!input || isLoading) return

    const trimmedInput = input.trim()
    if (!trimmedInput) {
      setInput('') // Réinitialiser si c'est juste des espaces
      return
    }

    // Ajouter le message de l'utilisateur
    const userMessage: Message = {
      id: Date.now(),
      sender: 'user',
      content: trimmedInput,
      time: getCurrentTime()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setIsTyping(true)

    try {
      const response: AIResponse = await api.askAI(trimmedInput)

      setTimeout(() => {
        const botMessage: Message = {
          id: Date.now() + 1,
          sender: 'bot',
          content: response.réponse || "Je n'ai pas pu générer de réponse pour le moment.",
          time: getCurrentTime()
        }

        setMessages(prev => [...prev, botMessage])
        setIsLoading(false)
        setIsTyping(false)
      }, 800)

    } catch (error) {
      console.error('Erreur API:', error)

      const errorMessage: Message = {
        id: Date.now() + 1,
        sender: 'bot',
        content: "Désolé, je rencontre une difficulté technique. Pourriez-vous reformuler votre question ?",
        time: getCurrentTime()
      }

      setMessages(prev => [...prev, errorMessage])
      setIsLoading(false)
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleQuickAction = (action: string) => {
    const actions: Record<string, string> = {
      "Générer des sujets": "Génère-moi des sujets de mémoire",
      "Analyser un sujet": "Analyse ce sujet pour moi",
      "Critères d'acceptation": "Quels sont les critères d'un bon sujet ?",
      "Conseils méthodologie": "Donne-moi des conseils méthodologiques",
      "Rechercher des références": "Trouve-moi des références bibliographiques"
    }

    setInput(actions[action])
    inputRef.current?.focus()
  }

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
    toast.success('Message copié')
  }

  const handleLikeMessage = (messageId: number) => {
    toast.success('Feedback envoyé')
  }

  const handleDislikeMessage = (messageId: number) => {
    toast.info('Feedback envoyé')
  }

  const handleAnalyzeTopic = async (topicTitle: string) => {
    setInput(`Analyse ce sujet : "${topicTitle}"`)
    setTimeout(() => handleSend(), 100)
  }

  const handleGenerateSimilarTopics = async () => {
    if (topicParam) {
      const decodedTopic = decodeURIComponent(topicParam)
      setInput(`Génère-moi des sujets similaires à : "${decodedTopic}"`)
      setTimeout(() => handleSend(), 100)
    }
  }

  const quickActions = topicParam ? [
    "Analyser ce sujet",
    "Critères d'évaluation",
    "Sujets similaires",
    "Méthodologie recommandée",
    "Références bibliographiques"
  ] : [
    "Générer des sujets",
    "Analyser un sujet",
    "Critères d'acceptation",
    "Conseils méthodologie",
    "Rechercher des références"
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex">

      {/* Chat principal */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${showSidebar ? 'lg:w-3/4' : 'w-full'}`}>

        {/* Header */}
        <header className="sticky top-16 z-10 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    MemoBot Assistant
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {topicParam ? 'Analyse de sujet' : 'Spécialiste en sujets de mémoire'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {topicParam && (
                  <button
                    onClick={handleGenerateSimilarTopics}
                    disabled={isLoading}
                    className="px-3 py-1.5 text-sm bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sujets similaires
                  </button>
                )}
                <button
                  onClick={loadPopularTopics}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title="Actualiser"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors lg:hidden"
                  title={showSidebar ? "Masquer la sidebar" : "Afficher la sidebar"}
                >
                  {showSidebar ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Zone de messages */}
        <main
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-gray-900/50"
        >
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] ${msg.sender === 'user' ? 'ml-auto' : ''}`}>
                  <div className={`rounded-2xl p-4 ${msg.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                    } ${msg.sender === 'user' ? 'rounded-br-none' : 'rounded-bl-none'}`}>

                    {/* Header du message */}
                    <div className="flex items-center gap-2 mb-3">
                      {msg.sender === 'bot' ? (
                        <>
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-full flex items-center justify-center flex-shrink-0">
                            <Bot className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">MemoBot</span>
                        </>
                      ) : (
                        <>
                          <span className="text-sm font-medium text-white/90">{user?.full_name}</span>
                          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-3 h-3 text-white" />
                          </div>
                        </>
                      )}

                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                        {msg.time}
                      </span>
                    </div>

                    {/* Contenu du message */}
                    <div className="space-y-2">
                      {msg.content.split('\n').map((line, i) => {
                        if (line.trim() === '') return <br key={i} />

                        if (line.startsWith('• ') || line.startsWith('- ')) {
                          return (
                            <div key={i} className="flex items-start">
                              <span className={`mr-2 mt-1 ${msg.sender === 'user' ? 'text-blue-200' : 'text-blue-500'}`}>•</span>
                              <span className={msg.sender === 'user' ? 'text-white/90' : 'text-gray-700 dark:text-gray-300'}>
                                {line.substring(2)}
                              </span>
                            </div>
                          )
                        }

                        if (line.includes('**') && line.includes('**')) {
                          const parts = line.split('**')
                          return (
                            <div key={i}>
                              <strong className={msg.sender === 'user' ? 'text-white' : 'text-gray-900 dark:text-white'}>
                                {parts[1]}
                              </strong>
                              <span className={msg.sender === 'user' ? 'text-white/90' : 'text-gray-700 dark:text-gray-300'}>
                                {parts[2]}
                              </span>
                            </div>
                          )
                        }

                        return (
                          <p key={i} className={msg.sender === 'user' ? 'text-white/90' : 'text-gray-700 dark:text-gray-300'}>
                            {line}
                          </p>
                        )
                      })}
                    </div>

                    {/* Actions du message */}
                    <div className="mt-4 flex items-center gap-2">
                      {msg.sender === 'bot' ? (
                        <>
                          <button
                            onClick={() => handleCopyMessage(msg.content)}
                            className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Copier"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleLikeMessage(msg.id)}
                            className="p-1.5 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="J'aime"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDislikeMessage(msg.id)}
                            className="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Je n'aime pas"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleCopyMessage(msg.content)}
                          className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                          title="Copier"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Indicateur de frappe */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[85%]">
                  <div className="rounded-2xl p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-bl-none">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-full flex items-center justify-center">
                        <Bot className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">MemoBot</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-300"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Suggestions rapides */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="max-w-3xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowQuickActions(!showQuickActions)}
                  className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title={showQuickActions ? "Réduire les suggestions" : "Afficher les suggestions"}
                >
                  {showQuickActions ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Suggestions rapides
                </span>
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {showQuickActions ? `${quickActions.length} actions` : "Cliquez pour développer"}
              </span>
            </div>

            {showQuickActions && (
              <div className="mt-2 flex flex-wrap gap-2 animate-in fade-in duration-200">
                {quickActions.map((action) => (
                  <button
                    key={action}
                    onClick={() => handleQuickAction(action)}
                    disabled={isLoading}
                    className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 hover:border-blue-300 dark:hover:border-blue-600 border border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Zone de saisie */}
        <div className="sticky bottom-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <div className="relative flex items-end gap-2 w-full">
              {/* Textarea avec padding pour le bouton */}
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input || ''}
                  onChange={(e) => setInput(e.target.value || '')}
                  onKeyDown={handleKeyPress}
                  placeholder={topicParam ? "Posez votre question sur ce sujet..." : "Posez votre question à MemoBot..."}
                  className="w-full px-4 py-3 pr-16 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none min-h-[60px] text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  rows={2}
                  disabled={isLoading}
                />

                {/* Bouton dans la zone de texte */}

                <button
                  onClick={handleSend}
                  disabled={isInputEmpty || isLoading}
                  className="absolute right-2 bottom-2 p-2 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white rounded-full hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  style={{ width: '36px', height: '36px' }}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Info ligne */}
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex justify-between text-center">
              <span>Shift+Entrée pour nouvelle ligne • Entrée pour envoyer</span>
              <span>{(input || '').length}/2000</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar - Réduisible */}
      {showSidebar && (
        <div className="hidden sticky top-2 lg:block w-1/4 h-screen border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-y-auto">
          <div className="p-4">

            {/* Bouton pour réduire */}
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setShowSidebar(false)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Réduire la sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Sujets populaires */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Sujets populaires</h3>
                <Link
                  href="/dashboard/sujets"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Voir tous
                </Link>
              </div>
              <div className="space-y-3">
                {popularTopics.length > 0 ? (
                  popularTopics.map((topic) => (
                    <div
                      key={topic.id}
                      className="block p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors group cursor-pointer"
                      onClick={() => handleAnalyzeTopic(topic.titre)}
                    >
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {topic.titre}
                      </h4>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                          {topic.domaine}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Eye className="w-3 h-3" />
                          <span>{topic.vue_count || 0}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <div className="text-gray-300 dark:text-gray-600 mb-2">
                      <BookOpen className="w-8 h-8 mx-auto" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Chargement...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Statistiques */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Votre session</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Messages</span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">{messages.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Sujets suggérés</span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">{popularTopics.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Durée active</span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">0 min</span>
                </div>
              </div>
            </div>

            {/* Conseils */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800/30">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Conseil</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {topicParam
                      ? "Demandez une analyse détaillée, des améliorations ou des sujets similaires."
                      : "Soyez précis : mentionnez votre domaine et vos centres d'intérêt pour des suggestions pertinentes."}
                  </p>
                </div>
              </div>
            </div>

            {/* Fonctionnalités IA */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                {topicParam ? 'Analyse IA' : 'Fonctionnalités IA'}
              </h3>
              <div className="space-y-2">
                {topicParam ? (
                  <>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Analyse détaillée</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Points forts et faibles</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-lg flex items-center justify-center">
                        <Zap className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Sujets similaires</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Variations et alternatives</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Génération de sujets</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Personnalisés selon vos intérêts</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-lg flex items-center justify-center">
                        <Zap className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Analyse de sujets</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Évaluation et critique constructive</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bouton pour afficher la sidebar quand elle est cachée */}
      {!showSidebar && (
        <div className="hidden lg:flex items-center border-l border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setShowSidebar(true)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Afficher la sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}