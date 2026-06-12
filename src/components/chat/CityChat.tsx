import React, { useState, useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRoomChat, ChatMeta } from '@/hooks/useRoomChat';
import { ChatPanel } from './ChatPanel';

// Chat de grup pe oraș — buton plutitor în dreapta-jos.
export function CityChat({ city }: { city: string }) {
  const { currentUser } = useAuthStore();
  const [open, setOpen] = useState(false);

  const room = `city:${city}`;
  const meta: ChatMeta | null = useMemo(() => {
    if (!currentUser) return null;
    return {
      kind: 'CITY',
      senderId: currentUser.id,
      senderName: currentUser.firstName,
      senderRole: currentUser.role?.name === 'ADMIN' ? 'BUSINESS' : 'CLIENT',
    };
  }, [currentUser]);

  // Conectăm camera doar când chatul e deschis.
  const { messages, sendMessage } = useRoomChat(open ? room : null, meta);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 bg-caramel text-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-brown transition-transform hover:scale-105"
      >
        {open ? '✕' : '💬'}
      </button>

      {open && (
        <ChatPanel
          title={`Chat ${city}`}
          subtitle="Discută cu alți clienți din oraș"
          messages={messages}
          meId={currentUser?.id ?? ''}
          onSend={sendMessage}
          className="absolute bottom-16 right-0 w-80 h-[30rem] max-h-[75vh] shadow-2xl mb-2"
        />
      )}
    </div>
  );
}
