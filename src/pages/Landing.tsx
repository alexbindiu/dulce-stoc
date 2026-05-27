import React from 'react'
import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="min-h-screen bg-paper flex flex-col">
      {/* ── HERO ── */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-64px)]">

        {/* Left — copy */}
        <div className="flex flex-col justify-center px-10 lg:px-20 py-16">

          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-7">
            <div className="w-8 h-px bg-caramel" />
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-caramel">
              Pentru patiserii &amp; cofetării
            </span>
          </div>

          {/* Logo / Name */}
          <div className="font-display text-6xl lg:text-7xl font-semibold text-brown leading-none mb-4">
            Dulce{' '}
            <span className="text-caramel italic">Stoc</span>
          </div>

          {/* Tagline */}
          <p className="font-display italic text-xl text-brown-soft mb-6">
            — Evidența afacerii tale, simplă.
          </p>

          {/* Description */}
          <p className="text-base text-muted leading-relaxed max-w-md mb-10">
            Dulce Stoc este platforma de gestiune gândită special pentru
            patiserii și cofetării mici. Ține evidența produselor, stocurilor
            și prețurilor — fără foi de calcul, fără bătăi de cap. Tot ce ai
            nevoie, într-un singur loc.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-brown text-white px-7 py-3 rounded-lg text-sm font-semibold hover:bg-brown-mid transition-colors"
            >
              Deschide aplicația →
            </Link>
          </div>

          {/* Quick stats */}
          <div className="flex gap-8 mt-12 pt-8 border-t border-border">
            {[
              { value: '100%', label: 'Gratuit' },
              { value: '10+',  label: 'Moduri de customizare' },
              { value: '60s',  label: 'Inventar rapid' },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="font-display text-2xl font-semibold text-brown">
                  {value}
                </div>
                <div className="text-xs text-muted uppercase tracking-wide mt-0.5">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — decorative mockup */}
        <div className="hidden lg:flex items-center justify-center bg-brown px-12 py-16">
          <div className="w-full max-w-sm bg-surface rounded-xl overflow-hidden shadow-2xl">
            {/* Mini topbar */}
            <div className="bg-paper border-b border-border px-4 py-3 flex items-center justify-between">
              <span className="font-display text-base font-semibold text-brown">
                Produse
              </span>
              <span className="text-xs bg-brown text-white px-3 py-1 rounded-md font-medium">
                + Produs nou
              </span>
            </div>
            {/* Mini rows */}
            {[
              { emoji: '🎂', name: 'Tort Ștefania',    price: '85,00',  stock: 24,  active: true  },
              { emoji: '🥐', name: 'Croissant cu unt', price: '9,50',   stock: 80,  active: true  },
              { emoji: '🍫', name: 'Ecler ciocolată',  price: '12,00',  stock: 45,  active: true  },
              { emoji: '🍰', name: 'Prăjitură nucă',   price: '7,50',   stock: 0,   active: false },
            ].map((row) => (
              <div
                key={row.name}
                className="flex items-center gap-3 px-4 py-3 border-b border-border/40 last:border-0"
              >
                <div className="w-8 h-8 rounded bg-paper border border-border flex items-center justify-center text-lg flex-shrink-0">
                  {row.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-brown truncate">{row.name}</div>
                  <div className="text-[10px] text-muted">{row.price} lei · {row.stock} buc.</div>
                </div>
                <span
                  className={[
                    'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                    row.active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-700',
                  ].join(' ')}
                >
                  {row.active ? 'Activ' : 'Inactiv'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* ── FEATURES STRIP ── */}
      <section className="border-t border-border bg-surface py-10 px-10 lg:px-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl">
          {[
            {
              icon: '📦',
              title: 'Gestiune produse',
              text: 'Adaugă, editează și șterge produse. Stoc actualizat în timp real.',
            },
            {
              icon: '🔍',
              title: 'Filtrare rapidă',
              text: 'Caută după nume, filtrează după categorie sau status activ/inactiv.',
            },
            {
              icon: '⚡',
              title: 'Inventar rapid',
              text: 'Actualizează stocul pentru toate produsele în mai puțin de 60 de secunde.',
            },
          ].map(({ icon, title, text }) => (
            <div key={title} className="flex flex-col gap-2">
              <span className="text-2xl">{icon}</span>
              <div className="text-sm font-semibold text-brown">{title}</div>
              <div className="text-xs text-muted leading-relaxed">{text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-brown text-center py-5 text-xs text-white/30">
        © {new Date().getFullYear()}{' '}
        <span className="text-gold font-medium">Dulce Stoc</span> · Patiserie artizanală · Toate drepturile rezervate
      </footer>
    </div>
  )
}
