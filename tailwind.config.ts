import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        paper: '#F7F2EB',
        surface: '#FDFAF5',
        border: '#E2D5C0',
        brown: {
          DEFAULT: '#2E1A0E',
          mid: '#6B4226',
          soft: '#A07050',
        },
        caramel: '#C47A3A',
        gold: '#C9A84C',
        muted: '#9A8070',
      },
      transitionDuration: {
        '250': '250ms',
      },
      backgroundSize: {
        '200': '200% 200%',
      },
      animation: {
        fadeIn: 'fadeIn .4s ease-out both',
        slideUp: 'slideUp .4s cubic-bezier(.22,1,.36,1) both',
        'fade-in-up': 'fadeInUp .5s cubic-bezier(.22,1,.36,1) both',
        'scale-in': 'scaleIn .3s cubic-bezier(.22,1,.36,1) both',
        float: 'floaty 4s ease-in-out infinite',
        gradient: 'gradientShift 8s ease infinite',
        shimmer: 'shimmer 1.5s infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
