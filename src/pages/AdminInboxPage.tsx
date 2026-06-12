import React, { useEffect, useMemo, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { getSocket } from '@/services/websocket'
import { useRoomChat, ChatMeta } from '@/hooks/useRoomChat'
import { ChatPanel } from '@/components/chat/ChatPanel'
import { Topbar } from '@/components/layout/Topbar'

interface Conversation {
  clientId: string
  clientName: string
  room: string
  lastMessage: string
  lastAt: string
}

export default function AdminInboxPage() {
  const { currentUser } = useAuthStore()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selected, setSelected] = useState<Conversation | null>(null)

  // Lista conversațiilor + reîmprospătare în timp real (inclusiv clienți noi)
  useEffect(() => {
    if (!currentUser) return
    const socket = getSocket()
    const load = () => socket.emit('chat:conversations:get', { businessId: currentUser.id })
    const onList = (list: Conversation[]) => setConversations(list ?? [])

    socket.on('chat:conversations', onList)
    socket.on('chat:inbox-updated', load)
    socket.emit('chat:inbox:subscribe', { businessId: currentUser.id })
    load()

    return () => {
      socket.off('chat:conversations', onList)
      socket.off('chat:inbox-updated', load)
    }
  }, [currentUser])

  const room = selected && currentUser ? `dm:${currentUser.id}:${selected.clientId}` : null
  const meta: ChatMeta | null = useMemo(() => {
    if (!selected || !currentUser) return null
    return {
      kind: 'DM',
      senderId: currentUser.id,
      senderName: currentUser.businessName || currentUser.firstName,
      senderRole: 'BUSINESS',
      businessId: currentUser.id,
      businessName: currentUser.businessName,
      clientId: selected.clientId,
      clientName: selected.clientName,
    }
  }, [selected, currentUser])

  const { messages, sendMessage } = useRoomChat(room, meta)

  return (
    <div className="flex flex-col min-h-full">
      <Topbar title="Mesaje" subtitle="— conversații cu clienții" />

      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversation list */}
          <div className="lg:col-span-1 bg-surface border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-paper">
              <h2 className="font-semibold text-brown text-sm">Conversații ({conversations.length})</h2>
            </div>
            <div className="divide-y divide-border max-h-[28rem] overflow-y-auto">
              {conversations.length === 0 ? (
                <p className="px-4 py-6 text-xs text-muted text-center">Niciun mesaj de la clienți încă.</p>
              ) : (
                conversations.map((c) => (
                  <button
                    key={c.clientId}
                    onClick={() => setSelected(c)}
                    className={`w-full text-left px-4 py-3 hover:bg-caramel/5 transition-colors ${
                      selected?.clientId === c.clientId ? 'bg-caramel/10' : ''
                    }`}
                  >
                    <p className="font-semibold text-brown text-sm">{c.clientName}</p>
                    <p className="text-xs text-muted truncate">{c.lastMessage}</p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat */}
          <div className="lg:col-span-2">
            {selected ? (
              <ChatPanel
                title={selected.clientName}
                subtitle="Conversație privată"
                messages={messages}
                meId={currentUser?.id ?? ''}
                onSend={sendMessage}
                className="h-[32rem]"
              />
            ) : (
              <div className="h-[32rem] flex items-center justify-center bg-surface border border-border rounded-xl text-sm text-muted">
                Selectează o conversație din stânga.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
