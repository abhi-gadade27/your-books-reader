/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          dark: '#0a050f', // Near black with purple tint
          darker: '#050208',
          glass: 'rgba(15, 5, 25, 0.45)',
          red: {
            deep: '#8B0000',
            dark: '#580000',
            bright: '#D32F2F',
            glow: '#FF1744'
          },
          purple: {
            royal: '#3B0066',
            dark: '#1E0033',
            bright: '#7B1FA2',
            glow: '#E040FB'
          },
          gold: {
            elegant: '#D4AF37',
            dark: '#AA7C11',
            bright: '#FFDF00',
            glow: '#FFE082'
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        marathi: ['Rozha One', 'Inter', 'sans-serif']
      },
      boxShadow: {
        'gold-glow': '0 0 15px rgba(212, 175, 55, 0.4)',
        'red-glow': '0 0 15px rgba(139, 0, 0, 0.5)',
        'purple-glow': '0 0 15px rgba(59, 0, 102, 0.6)',
        'glass-card': '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'spin-slow': 'spin 12s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: 0.6, transform: 'scale(1)' },
          '50%': { opacity: 1, transform: 'scale(1.05)' },
        }
      }
    },
  },
  plugins: [],
}
