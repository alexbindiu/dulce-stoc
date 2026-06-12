import { useCallback, useEffect, useState } from 'react';
import { getSocket } from '@/services/websocket';

export interface ChatMsg {
  _id?: string;
  room: string;
  kind?: 'CITY' | 'DM';
  businessId?: string;
  businessName?: string;
  clientId?: string;
  clientName?: string;
  senderId: string;
  senderName: string;
  senderRole?: 'CLIENT' | 'BUSINESS';
  text: string;
  createdAt?: string;
}

export interface ChatMeta {
  kind: 'CITY' | 'DM';
  senderId: string;
  senderName: string;
  senderRole: 'CLIENT' | 'BUSINESS';
  businessId?: string;
  businessName?: string;
  clientId?: string;
  clientName?: string;
}

/**
 * Se conectează la o cameră de chat (oraș sau DM) prin Socket.IO:
 * primește istoricul, ascultă mesajele noi și expune `sendMessage`.
 * Mai multe componente pot folosi hook-ul cu camere diferite; fiecare
 * filtrează mesajele după `room`.
 */
export function useRoomChat(room: string | null, meta: ChatMeta | null) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);

  useEffect(() => {
    if (!room) {
      setMessages([]);
      return;
    }
    const socket = getSocket();

    const onHistory = (payload: { room: string; messages: ChatMsg[] }) => {
      if (payload?.room === room) setMessages(payload.messages ?? []);
    };
    const onNew = (msg: ChatMsg) => {
      if (msg?.room === room) setMessages((prev) => [...prev, msg]);
    };

    socket.on('chat:history', onHistory);
    socket.on('chat:newMessage', onNew);
    socket.emit('chat:join', { room });

    return () => {
      socket.emit('chat:leave', { room });
      socket.off('chat:history', onHistory);
      socket.off('chat:newMessage', onNew);
    };
  }, [room]);

  const sendMessage = useCallback(
    (text: string) => {
      if (!room || !meta || !text.trim()) return;
      getSocket().emit('chat:send', { room, ...meta, text: text.trim() });
    },
    [room, meta],
  );

  return { messages, sendMessage };
}
