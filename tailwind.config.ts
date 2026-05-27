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
    },
  },
  plugins: [],
} satisfies Config
