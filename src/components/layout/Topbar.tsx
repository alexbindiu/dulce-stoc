import React from 'react'

interface TopbarProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export function Topbar({ title, subtitle, actions }: TopbarProps) {
  return (
    <header className="bg-surface border-b border-border px-8 py-3.5 flex items-center gap-3 sticky top-0 z-10">
      <div className="flex items-baseline gap-2">
        <h1 className="font-display text-xl font-semibold text-brown">{title}</h1>
        {subtitle && (
          <span className="font-display italic text-base text-muted hidden sm:inline">
            {subtitle}
          </span>
        )}
      </div>
      {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
    </header>
  )
}
