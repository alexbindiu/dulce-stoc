import React, { useEffect } from 'react'

interface ModalProps {
  isOpen: boolean; onClose: () => void; title: string
  children: React.ReactNode; maxWidth?: string
}

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
      style={{ background: 'rgba(46,26,14,0.5)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      role="dialog" aria-modal="true" aria-labelledby="modal-title"
    >
      <div className={`bg-surface border border-border rounded-xl w-full shadow-2xl animate-slideUp ${maxWidth}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 id="modal-title" className="font-display text-xl font-semibold text-brown">{title}</h2>
          <button onClick={onClose} aria-label="Închide" className="text-muted hover:text-brown p-1">✕</button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}
