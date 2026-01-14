'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, ThumbsUp, ThumbsDown, Copy, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

type MessageType = {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: Date
  likes?: number
  feedback?: 'like' | 'dislike' | null
}

type SuggestionType = {
  id: string
  title: string
  description: string
  tags: string[]
}

export function ChatInterface() {
  const [messages, setMessages] = useState<MessageType[]>([
    {
      id: '1',
      content: 'Bonjour ! Je suis MemoBot, votre assistant pour trouver le sujet de mémoire idéal. Parlez-moi de vos intérêts et je vous aiderai à trouver des sujets pertinents.',
      sender: 'ai',
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: '2',
      content: 'Bonjour ! Je suis intéressé par l\'intelligence artificielle en santé.',
      sender: 'user',
      timestamp: new Date(Date.now() - 1800000),
    },
    {
      id: '3',
      content: 'Excellent ! L\'IA en santé est un domaine passionnant. Je peux vous suggérer des sujets comme : "L\'utilisation du machine learning pour le diagnostic précoce du cancer" ou "Les systèmes de recommandation pour les traitements personnalisés". Quel aspect vous intéresse le plus ?',
      sender: 'ai',
      timestamp: new Date(Date.now() - 900000),
    },
  ])
  
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions] = useState<SuggestionType[]>([
    {
      id: 's1',
      title: 'Sujets en IA médicale',
      description: 'Explorez des sujets comme le diagnostic assisté par IA, la robotique chirurgicale, ou l\'analyse d\'images médicales.',
      tags: ['IA', 'Santé', 'Machine Learning']
    },
    {
      id: 's2',
      title: 'Problématiques actuelles',
      description: 'Éthique de l\'IA en santé, confidentialité des données, biais algorithmiques.',
      tags: ['Éthique', 'Données', 'Algorithmes']
    },
    {
      id: 's3',
      title: 'Méthodologies de recherche',
      description: 'Apprenez les méthodes de recherche en IA : apprentissage supervisé, validation croisée, tests statistiques.',
      tags: ['Méthodologie', 'Recherche', 'Validation']
    }
  ])

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: MessageType = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    // Simuler une réponse de l'IA
    setTimeout(() => {
      const aiResponse: MessageType = {
        id: (Date.now() + 1).toString(),
        content: `Merci pour votre message : "${inputValue}". En tant qu'assistant IA, je peux vous aider à développer cette idée. Voulez-vous que je propose des problématiques spécifiques ou des méthodologies de recherche ?`,
        sender: 'ai',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, aiResponse])
      setIsLoading(false)
    }, 1500)
  }

  const handleQuickSuggestion = (suggestion: string) => {
    setInputValue(suggestion)
  }

  const handleFeedback = (messageId: string, type: 'like' | 'dislike') => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId ? { ...msg, feedback: type } : msg
      )
    )
  }

  const quickQuestions = [
    'Quels sont les sujets tendance en IA ?',
    'Comment choisir une problématique ?',
    'Quelle méthodologie pour mon mémoire ?',
    'Comment structurer un plan de recherche ?',
  ]

  return (
    <div className="flex flex-col h-full">
      {/* En-tête du chat */}
      <div className="border-b border-gray-200 p-4 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar
                src="/ai-avatar.png"
                fallback="AI"
                className="w-12 h-12"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h2 className="font-semibold text-lg">MemoBot Assistant</h2>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                En ligne • Assistant IA spécialisé
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Nouvelle discussion
          </Button>
        </div>
      </div>

      {/* Zone de messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                <Avatar
                  fallback={message.sender === 'ai' ? 'AI' : 'Vous'}
                  className="w-8 h-8 mt-1"
                />
                <div className="space-y-2">
                  <div className={`rounded-2xl px-4 py-3 ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-white border border-gray-200 rounded-tl-none shadow-sm'
                  }`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <div className={`flex items-center gap-2 text-xs text-gray-500 ${message.sender === 'user' ? 'justify-end' : ''}`}>
                    <span>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {message.sender === 'ai' && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleFeedback(message.id, 'like')}
                          className={`p-1 rounded ${message.feedback === 'like' ? 'text-blue-600 bg-blue-50' : 'hover:text-blue-600'}`}
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleFeedback(message.id, 'dislike')}
                          className={`p-1 rounded ${message.feedback === 'dislike' ? 'text-red-600 bg-red-50' : 'hover:text-red-600'}`}
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </button>
                        <button className="p-1 rounded hover:text-gray-700">
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[80%]">
                <Avatar fallback="AI" className="w-8 h-8 mt-1" />
                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggestions rapides */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Questions rapides</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuickSuggestion(question)}
                className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Zone de saisie */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Posez votre question à MemoBot..."
                className="py-3"
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              className="px-6"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="mt-2 text-xs text-gray-500 text-center">
            MemoBot peut faire des erreurs. Vérifiez toujours les informations importantes.
          </div>
        </div>
      </div>
    </div>
  )
}