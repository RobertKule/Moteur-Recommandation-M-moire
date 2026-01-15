'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { 
  Bot, 
  User, 
  Send, 
  RefreshCw, 
  Copy, 
  ThumbsUp, 
  ThumbsDown,
  MessageSquare,
  BookOpen,
  Sparkles,
  TrendingUp,
  Clock,
  HelpCircle,
  Lightbulb
} from 'lucide-react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

interface Message {
  id: number
  sender: 'user' | 'bot'
  content: string
  time: string
}

interface SuggestedTopic {
  id: number
  titre: string
  domaine: string
}

interface GeneratedTopic {
  titre: string
  problematique?: string
  probleme?: string
  description?: string
  domaine?: string
}

export default function ChatPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      sender: 'bot', 
      content: `Bonjour ${user?.full_name || ''} ! Je suis MemoBot, votre assistant IA spécialisé pour vous aider à trouver le sujet de mémoire idéal.

Je peux vous aider à :
• Générer des idées de sujets personnalisés
• Analyser et évaluer vos propositions  
• Vous guider sur la méthodologie
• Répondre à toutes vos questions

De quoi avez-vous besoin aujourd'hui ?`, 
      time: getCurrentTime() 
    }
  ])
  
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [suggestedTopics, setSuggestedTopics] = useState<SuggestedTopic[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  function getCurrentTime() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    loadPopularTopics()
    inputRef.current?.focus()
  }, [])

  const loadPopularTopics = async () => {
    try {
      const response = await api.getPopularSujets(3)
      const topics = Array.isArray(response) ? response : []
      setSuggestedTopics(topics.map((topic: any) => ({
        id: topic.id,
        titre: topic.titre,
        domaine: topic.domaine || 'Général'
      })))
    } catch (error) {
      console.error('Erreur chargement sujets:', error)
    }
  }

  const handleSend = async () => {
    const trimmedInput = input.trim()
    if (!trimmedInput || isLoading) return

    // Ajouter le message de l'utilisateur
    const userMessage: Message = {
      id: messages.length + 1,
      sender: 'user',
      content: trimmedInput,
      time: getCurrentTime()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setIsTyping(true)

    try {
      const response = await api.askAI(trimmedInput)
      
      setTimeout(() => {
        const botMessage: Message = {
          id: messages.length + 2,
          sender: 'bot',
          content: response.réponse || response.message || "Je n'ai pas pu générer de réponse pour le moment.",
          time: getCurrentTime()
        }

        setMessages(prev => [...prev, botMessage])
        
        // Générer des sujets uniquement si l'utilisateur le demande explicitement
        if (trimmedInput.toLowerCase().includes('générer des sujets') || 
            trimmedInput.toLowerCase().includes('sujet en')) {
          handleGenerateTopics(trimmedInput)
        }
        
        setIsLoading(false)
        setIsTyping(false)
      }, 800)

    } catch (error) {
      console.error('Erreur API:', error)
      
      const errorMessage: Message = {
        id: messages.length + 2,
        sender: 'bot',
        content: "Désolé, je rencontre une difficulté technique. Pourriez-vous reformuler votre question ?",
        time: getCurrentTime()
      }
      
      setMessages(prev => [...prev, errorMessage])
      setIsLoading(false)
      setIsTyping(false)
    }
  }

  const handleGenerateTopics = async (interests: string) => {
    try {
      const keywords = interests
        .toLowerCase()
        .split(/[ ,.!?;:]+/)
        .filter(word => word.length > 2)
        .slice(0, 5)

      if (keywords.length === 0) return

      const response = await api.generateSubjects({
        interests: keywords,
        count: 3
      })

      const topics = Array.isArray(response) ? response : []
      
      if (topics.length > 0) {
        // Format simple et lisible
        const topicsList = topics.map((topic: GeneratedTopic, i: number) => 
          `${i + 1}. **${topic.titre}**\n   ${topic.problematique || topic.probleme || 'Sujet à explorer'}`
        ).join('\n\n')

        const topicsMessage: Message = {
          id: messages.length + 1,
          sender: 'bot',
          content: `Voici quelques suggestions basées sur vos intérêts :\n\n${topicsList}`,
          time: getCurrentTime()
        }

        setMessages(prev => [...prev, topicsMessage])
        
        setSuggestedTopics(topics.map((topic: GeneratedTopic, index: number) => ({
          id: Date.now() + index,
          titre: topic.titre || `Sujet ${index + 1}`,
          domaine: topic.domaine || 'Général'
        })))
      }
    } catch (error) {
      console.error('Erreur génération sujets:', error)
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
      "Conseils méthodologie": "Donne-moi des conseils méthodologiques"
    }
    
    setInput(actions[action])
    inputRef.current?.focus()
  }

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
    // Toast de confirmation optionnel
  }

  const quickActions = [
    "Générer des sujets",
    "Analyser un sujet", 
    "Critères d'acceptation",
    "Conseils méthodologie"
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      
      {/* En-tête simplifié */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Assistant Mémoire
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Dialoguez avec l'IA pour trouver votre sujet idéal
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadPopularTopics}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              title="Actualiser"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Chat principal - Prend plus d'espace */}
        <div className="flex-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-[calc(100vh-10rem)]">
            
            {/* En-tête minimaliste */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">MemoBot Assistant</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Prêt à vous aider</p>
                </div>
              </div>
            </div>

            {/* Zone de messages avec espacement clair */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] ${msg.sender === 'user' ? 'ml-auto' : ''}`}>
                    
                    {/* Avatar seulement pour le bot */}
                    {msg.sender === 'bot' && (
                      <div className="flex items-start gap-2 mb-1">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <Bot className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">MemoBot</span>
                      </div>
                    )}
                    
                    {/* Message */}
                    <div className={`rounded-lg p-3 whitespace-pre-wrap ${msg.sender === 'user' 
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-gray-900 dark:text-white' 
                      : 'bg-gray-50 dark:bg-gray-700/30 text-gray-800 dark:text-gray-200'
                    }`}>
                      <div className="text-sm">
                        {msg.content.split('\n').map((line, i) => {
                          // Liste à puces
                          if (line.startsWith('• ') || line.startsWith('- ') || line.startsWith('* ')) {
                            return (
                              <div key={i} className="flex items-start mb-1">
                                <span className="mr-2 text-blue-500">•</span>
                                <span className="flex-1">{line.substring(2)}</span>
                              </div>
                            )
                          }
                          // Titre en gras
                          if (line.includes('**') && line.includes('**')) {
                            const parts = line.split('**')
                            return (
                              <div key={i} className="mb-2">
                                <strong className="font-semibold text-gray-900 dark:text-white">
                                  {parts[1]}
                                </strong>
                                {parts[2]}
                              </div>
                            )
                          }
                          // Ligne vide
                          if (line.trim() === '') {
                            return <br key={i} />
                          }
                          // Texte normal
                          return (
                            <p key={i} className="mb-1 leading-relaxed">
                              {line}
                            </p>
                          )
                        })}
                      </div>
                    </div>
                    
                    {/* Temps et actions */}
                    <div className={`mt-1 flex items-center gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-xs text-gray-400">{msg.time}</span>
                      {msg.sender === 'bot' && (
                        <button
                          onClick={() => handleCopyMessage(msg.content)}
                          className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="Copier"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-[85%]">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <Bot className="w-3 h-3 text-white" />
                      </div>
                      <div className="rounded-lg p-3 bg-gray-50 dark:bg-gray-700/30">
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse delay-150"></div>
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse delay-300"></div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">Écrit...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions rapides */}
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Exemples :</span>
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickAction(action)}
                    disabled={isLoading}
                    className="px-3 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>

            {/* Zone de saisie épurée */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Posez votre question..."
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none min-h-[60px] text-sm"
                    rows={2}
                    disabled={isLoading}
                  />
                </div>
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-1 text-xs text-gray-400 flex justify-between">
                <span>Entrée pour envoyer • Shift+Entrée pour nouvelle ligne</span>
                <span>{input.length}/2000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Réduite et simplifiée */}
        <div className="lg:w-80 space-y-4">
          
          {/* Sujets populaires */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900 dark:text-white">Sujets populaires</h3>
              <Link 
                href="/dashboard/sujets"
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Voir plus
              </Link>
            </div>
            <div className="space-y-2">
              {suggestedTopics.length > 0 ? (
                suggestedTopics.map((topic, index) => (
                  <div 
                    key={topic.id}
                    className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <div className="text-xs text-gray-500 mt-0.5">{index + 1}.</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                          {topic.titre}
                        </h4>
                        <div className="mt-1">
                          <span className="text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded">
                            {topic.domaine}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <div className="text-gray-300 dark:text-gray-600 mb-1">
                    <BookOpen className="w-6 h-6 mx-auto" />
                  </div>
                  <p className="text-sm text-gray-500">Chargement...</p>
                </div>
              )}
            </div>
          </div>

          {/* Statistiques */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Votre session</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Messages</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">{messages.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Sujets suggérés</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">{suggestedTopics.length}</span>
              </div>
            </div>
          </div>

          {/* Aide */}
          <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800 p-4">
            <div className="flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Conseil</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Soyez précis : mentionnez votre domaine et vos centres d'intérêt.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}