import React, { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/authStore'
import { getSocket } from '@/services/websocket'

interface ChatMessage {
  _id: string;
  senderName: string;
  text: string;
  createdAt: string;
}

export function ChatBox() {
  const { currentUser } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputText, setInputText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll la ultimul mesaj
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isOpen])

  useEffect(() => {
    if (!isOpen) return;

    const socket = getSocket()

    // Cerem istoricul când deschidem chatul
    socket.emit('chat:join')

    // Ascultăm istoricul inițial
    socket.on('chat:history', (history: ChatMessage[]) => {
      setMessages(history)
    })

    // Ascultăm mesaje noi în timp real
    socket.on('chat:newMessage', (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg])
    })

    return () => {
      socket.off('chat:history')
      socket.off('chat:newMessage')
    }
  }, [isOpen])

  function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!inputText.trim()) return

    const socket = getSocket()
    socket.emit('chat:sendMessage', {
      senderName: currentUser?.firstName || 'Anonim',
      text: inputText.trim()
    })
    
    setInputText('')
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end animate-fadeIn">
      {/* Butonul de deschidere a chat-ului */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-caramel text-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-brown transition-transform hover:scale-105"
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Fereastra de Chat */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 h-[30rem] max-h-[75vh] bg-surface border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden mb-2 animate-slideUp">
          <div className="bg-brown px-4 py-3 text-white">
            <h3 className="font-display font-semibold text-lg">Grupul Pofticioșilor</h3>
            <p className="text-xs text-white/60">Discută live cu alți clienți</p>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 bg-paper">
            {messages.length === 0 ? (
              <p className="text-xs text-muted text-center mt-4">Niciun mesaj încă. Fii primul care scrie!</p>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderName === currentUser?.firstName
                return (
                  <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] text-muted mb-0.5 px-1">{msg.senderName}</span>
                    <div className={`px-3 py-2 rounded-lg text-sm max-w-[85%] ${isMe ? 'bg-caramel text-white rounded-tr-none' : 'bg-surface border border-border text-brown rounded-tl-none'}`}>
                      {msg.text}
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-3 bg-surface border-t border-border flex gap-2">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Scrie un mesaj..." 
              className="flex-1 bg-paper border border-border rounded-full px-4 py-2 text-sm text-brown outline-none focus:border-caramel"
            />
            <button type="submit" disabled={!inputText.trim()} className="bg-caramel text-white w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-50">
              ➤
            </button>
          </form>
        </div>
      )}
    </div>
  )
}