import React from 'react'

interface PaginationProps {
  currentPage: number; totalPages: number; onPageChange: (p: number) => void
  totalItems: number; pageSize: number
}

export function Pagination({ currentPage, totalPages, onPageChange, totalItems, pageSize }: PaginationProps) {
  const from = Math.min((currentPage - 1) * pageSize + 1, totalItems)
  const to   = Math.min(currentPage * pageSize, totalItems)
  const btnClass = (active: boolean) =>
    `w-8 h-8 flex items-center justify-center rounded-md border text-sm transition-colors ${active ? 'bg-brown border-brown text-white' : 'border-border text-muted hover:border-caramel hover:text-caramel'}`

  return (
    <div className="flex items-center justify-between mt-4 text-sm">
      <span className="text-muted text-xs">
        {totalItems === 0 ? 'Niciun produs' : `${from}–${to} din ${totalItems}`}
      </span>
      <div className="flex gap-1">
        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
          className={`${btnClass(false)} disabled:opacity-40 disabled:cursor-not-allowed`}>‹</button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
          <button key={p} onClick={() => onPageChange(p)} className={btnClass(p === currentPage)}>{p}</button>
        ))}
        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
          className={`${btnClass(false)} disabled:opacity-40 disabled:cursor-not-allowed`}>›</button>
      </div>
    </div>
  )
}
