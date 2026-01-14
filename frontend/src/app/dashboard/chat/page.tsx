// src/app/(dashboard)/chat/page.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { Bot, User, Send, Paperclip, Clock, BookOpen, Target, MessageSquare } from 'lucide-react'
import Link from 'next/link'

interface Message {
  id: number
  sender: 'user' | 'bot'
  content: string
  time: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      sender: 'bot', 
      content: 'Bonjour ! Je suis MemoBot, votre assistant pour trouver votre sujet de mémoire. Parlez-moi de vos intérêts académiques.', 
      time: '10:30' 
    }
  ])
  
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return

    const newMessage: Message = {
      id: messages.length + 1,
      sender: 'user',
      content: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages([...messages, newMessage])
    setInput('')
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chat Assistant</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Discutez pour affiner votre sujet de mémoire
              </p>
            </div>
          </div>
          <Link 
            href="/dashboard/recommendations"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voir recommandations
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat principal */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-[calc(100vh-16rem)]">
            {/* En-tête du chat */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">MemoBot Assistant</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Prêt à vous aider</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>En ligne</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xl ${msg.sender === 'user' ? 'ml-auto' : ''}`}>
                    <div className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${msg.sender === 'user' ? 'bg-blue-600' : 'bg-blue-600'}`}>
                        {msg.sender === 'user' ? (
                          <User className="w-4 h-4 text-white" />
                        ) : (
                          <Bot className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div>
                        <div className={`rounded-lg p-4 ${msg.sender === 'user' ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
                          <p className="text-gray-900 dark:text-white">{msg.content}</p>
                        </div>
                        <div className={`mt-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{msg.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <div className="relative">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Décrivez vos intérêts académiques..."
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none min-h-[80px]"
                      rows={2}
                    />
                    <div className="absolute right-3 bottom-3">
                      <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <Paperclip className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Conseils */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Conseils</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <div className="w-1 h-1 bg-blue-500 rounded-full mt-2"></div>
                <span>Soyez précis sur votre domaine d'études</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1 h-1 bg-blue-500 rounded-full mt-2"></div>
                <span>Mentionnez votre niveau académique</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1 h-1 bg-blue-500 rounded-full mt-2"></div>
                <span>Décrivez vos compétences techniques</span>
              </li>
            </ul>
          </div>

          {/* Sujets suggérés */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Sujets suggérés</h3>
              <Target className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {[
                { title: "IA et cybersécurité", domain: "Informatique" },
                { title: "Blockchain applications", domain: "Informatique" },
                { title: "Réseaux 5G optimisation", domain: "Télécoms" },
              ].map((topic, index) => (
                <Link 
                  key={index}
                  href="/dashboard/recommendations"
                  className="block p-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">{topic.title}</h4>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{topic.domain}</div>
                </Link>
              ))}
            </div>
          </div>

          {/* Objectifs */}
          <div className="bg-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-5 h-5" />
              <h3 className="font-semibold">Objectifs</h3>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <div className="w-1 h-1 bg-white rounded-full mt-2"></div>
                <span>Définir vos critères de recherche</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1 h-1 bg-white rounded-full mt-2"></div>
                <span>Identifier des pistes pertinentes</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1 h-1 bg-white rounded-full mt-2"></div>
                <span>Établir un plan d'action</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}