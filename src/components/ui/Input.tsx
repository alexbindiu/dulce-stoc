import React from 'react'

const BASE = 'w-full px-3 py-2.5 bg-paper border rounded-md text-sm text-brown outline-none placeholder:text-muted placeholder:opacity-60'
const BORDER = (err?: string) => err ? 'border-red-400 focus:border-red-500' : 'border-border focus:border-caramel'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string; error?: string; hint?: string
}
export function Input({ label, error, hint, id, ...props }: InputProps) {
  const uid = id ?? label.toLowerCase().replace(/[^a-z0-9]/g, '-')
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={uid} className="text-xs font-semibold uppercase tracking-wide text-brown-soft">{label}</label>
      <input id={uid} {...props} className={`${BASE} ${BORDER(error)}`} />
      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
    </div>
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string; error?: string
}
export function Textarea({ label, error, id, ...props }: TextareaProps) {
  const uid = id ?? label.toLowerCase().replace(/[^a-z0-9]/g, '-')
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={uid} className="text-xs font-semibold uppercase tracking-wide text-brown-soft">{label}</label>
      <textarea id={uid} {...props} className={`${BASE} ${BORDER(error)} resize-y min-h-[80px]`} />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string; error?: string; children: React.ReactNode
}
export function Select({ label, error, id, children, ...props }: SelectProps) {
  const uid = id ?? label.toLowerCase().replace(/[^a-z0-9]/g, '-')
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={uid} className="text-xs font-semibold uppercase tracking-wide text-brown-soft">{label}</label>
      <select id={uid} {...props} className={`${BASE} ${BORDER(error)} cursor-pointer`}>{children}</select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
