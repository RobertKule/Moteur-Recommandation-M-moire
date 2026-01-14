// src/components/chat/quick-chat.tsx
'use client'

import { useState } from 'react'
import { MessageSquare, X, Send, Bot } from 'lucide-react'

export default function QuickChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([
    { id: 1, text: "Bonjour ! Je suis MemoBot. Comment puis-je vous aider à trouver votre sujet de mémoire ?", sender: 'bot' }
  ])

  const handleSend = () => {
    if (!message.trim()) return
    
    setMessages(prev => [...prev, { id: Date.now(), text: message, sender: 'user' }])
    setMessage('')
    
    // Simuler une réponse
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        text: "Merci pour votre message. Pour mieux vous aider, pourriez-vous me dire quel est votre domaine d'études ?", 
        sender: 'bot' 
      }])
    }, 1000)
  }

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-gray-900 dark:bg-gray-800 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center p-4 md:p-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md h-[500px] flex flex-col animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">MemoBot Assistant</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">En ligne • Prêt à vous aider</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl px-4 py-3 ${
                      msg.sender === 'user'
                        ? 'bg-gray-900 dark:bg-gray-700 text-white rounded-br-none'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
                    }`}
                  >
                    <p>{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Posez votre question..."
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
                <button
                  onClick={handleSend}
                  disabled={!message.trim()}
                  className="px-4 py-3 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                Connectez-vous pour sauvegarder votre conversation
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}