import React, { useState, useEffect, useRef } from 'react';
import type { ChatMsg } from '@/hooks/useRoomChat';

interface Props {
  title: string;
  subtitle?: string;
  messages: ChatMsg[];
  meId: string;
  onSend: (text: string) => void;
  emptyText?: string;
  className?: string;
}

export function ChatPanel({ title, subtitle, messages, meId, onSend, emptyText, className }: Props) {
  const [text, setText] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
  }

  return (
    <div className={`flex flex-col overflow-hidden bg-surface border border-border rounded-xl ${className ?? ''}`}>
      <div className="bg-brown px-4 py-3 text-white flex-shrink-0">
        <h3 className="font-display font-semibold text-lg leading-tight">{title}</h3>
        {subtitle && <p className="text-xs text-white/60">{subtitle}</p>}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 bg-paper">
        {messages.length === 0 ? (
          <p className="text-xs text-muted text-center mt-4">{emptyText ?? 'Niciun mesaj încă. Scrie primul!'}</p>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.senderId === meId;
            return (
              <div key={msg._id ?? i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <span className="text-[10px] text-muted mb-0.5 px-1">
                  {msg.senderName}
                  {msg.senderRole === 'BUSINESS' && <span className="text-caramel"> · afacere</span>}
                </span>
                <div
                  className={`px-3 py-2 rounded-lg text-sm max-w-[85%] break-words ${
                    isMe
                      ? 'bg-caramel text-white rounded-tr-none'
                      : 'bg-surface border border-border text-brown rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={submit} className="p-3 bg-surface border-t border-border flex gap-2 flex-shrink-0">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Scrie un mesaj..."
          className="flex-1 bg-paper border border-border rounded-full px-4 py-2 text-sm text-brown outline-none focus:border-caramel"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="bg-caramel text-white w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-50 flex-shrink-0"
        >
          ➤
        </button>
      </form>
    </div>
  );
}
