'use client'

import React, { useState, useRef, useEffect } from 'react'
import { FiSend, FiLoader } from 'react-icons/fi'
import { ChatMessage } from '@/types'

interface ChatInterfaceProps {
  messages: ChatMessage[]
  onSendMessage: (message: string) => Promise<void>
  isLoading?: boolean
  placeholder?: string
}

export default function ChatInterface({
  messages,
  onSendMessage,
  isLoading = false,
  placeholder = 'Ask about policy requirements...',
}: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isSubmitting || isLoading) return

    const message = input.trim()
    setInput('')
    setIsSubmitting(true)

    try {
      await onSendMessage(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex h-full flex-col bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center">
            <div className="text-gray-400">
              <p className="text-sm">No messages yet</p>
              <p className="text-xs mt-1">Start by asking about policy requirements</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => {
              const showDate =
                index === 0 ||
                new Date(messages[index - 1].timestamp).toDateString() !==
                  new Date(msg.timestamp).toDateString()

              return (
                <div key={msg.id}>
                  {showDate && (
                    <div className="flex items-center gap-2 my-4">
                      <div className="flex-1 h-px bg-gray-200" />
                      <span className="text-xs text-gray-500">
                        {msg.timestamp.toLocaleDateString()}
                      </span>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>
                  )}

                  <div
                    className={`flex gap-3 ${
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.role === 'agent' && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 flex-shrink-0">
                        <span className="text-xs font-semibold text-blue-600">
                          {msg.agentName?.charAt(0).toUpperCase() || 'A'}
                        </span>
                      </div>
                    )}

                    <div
                      className={`max-w-xs rounded-lg px-4 py-2 text-sm ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p
                        className={`mt-1 text-xs ${
                          msg.role === 'user'
                            ? 'text-blue-100'
                            : 'text-gray-500'
                        }`}
                      >
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    {msg.role === 'user' && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 flex-shrink-0">
                        <span className="text-xs font-semibold text-white">U</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {isLoading && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 flex-shrink-0">
                  <span className="text-xs font-semibold text-blue-600">A</span>
                </div>
                <div className="bg-gray-100 rounded-lg px-4 py-3 flex items-center gap-2">
                  <span className="text-sm text-gray-600">Thinking</span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.1s' }}
                    />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            disabled={isSubmitting || isLoading}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || isSubmitting || isLoading}
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isSubmitting || isLoading ? (
              <FiLoader size={18} className="animate-spin" />
            ) : (
              <FiSend size={18} />
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
