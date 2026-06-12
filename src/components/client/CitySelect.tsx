import React, { useState, useRef, useEffect } from 'react';

interface Props {
  cities: string[];
  value: string | null;
  onChange: (city: string) => void;
}

export function CitySelect({ cities, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('mousedown', h);
    return () => window.removeEventListener('mousedown', h);
  }, []);

  const filtered = cities.filter((c) => c.toLowerCase().includes(query.toLowerCase()));

  return (
    <div ref={ref} className="relative w-full max-w-xs">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between bg-surface border border-border rounded-lg px-4 py-2.5 text-sm hover:border-caramel transition-colors"
      >
        <span className={value ? 'text-brown font-medium' : 'text-muted'}>
          {value ? `📍 ${value}` : 'Alege un oraș…'}
        </span>
        <span className="text-muted text-xs">▾</span>
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full bg-surface border border-border rounded-lg shadow-lg overflow-hidden">
          <div className="p-2 border-b border-border">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Caută oraș…"
              className="w-full bg-paper border border-border rounded-md px-3 py-1.5 text-sm outline-none focus:border-caramel"
            />
          </div>
          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-xs text-muted">Niciun oraș găsit.</p>
            ) : (
              filtered.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => { onChange(c); setOpen(false); setQuery(''); }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-caramel/10 transition-colors ${
                    value === c ? 'text-caramel font-semibold' : 'text-brown'
                  }`}
                >
                  {c}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
