module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        spaceMono: ['SpaceMono', 'monospace'],
        pressStart: ['PressStart2P', 'cursive'],
        silkscreen: ['Silkscreen', 'sans-serif'],
      },
      animation: {
        'bounce-subtle': 'bounce 1s ease-in-out infinite',
        'pulse-slow': 'pulse 2s ease-in-out infinite',
        'flash-fade': 'flashFade 0.6s ease-out forwards',
        'explosion': 'explosion 0.8s ease-out forwards',
        'slide-in': 'slideIn 0.3s ease-out forwards',
        'bounce-in': 'bounceIn 0.4s ease-out forwards',
        'glow': 'glow 0.5s ease-in-out infinite alternate',
        'glow-green': 'glow-green 1s ease-in-out infinite',
        'glow-red': 'glow-red 1s ease-in-out infinite',
        'chaos-pulse': 'chaosPulse 0.4s ease-in-out infinite',
        'spin-slow': 'spin 2s linear infinite',
        'rainbow': 'rainbow 1s linear infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'explode': 'explode 0.5s ease-out',
      },
      keyframes: {
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        flashFade: {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '25%': { opacity: '0.8', transform: 'scale(1.1)', backgroundColor: '#fbbf24' },
          '50%': { opacity: '0.6', transform: 'scale(1.2)', backgroundColor: '#f59e0b' },
          '75%': { opacity: '0.3', transform: 'scale(1.15)', backgroundColor: '#d97706' },
          '100%': { opacity: '0', transform: 'scale(0.8)' }
        },
        explosion: {
          '0%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
          '50%': { transform: 'scale(1.5) rotate(180deg)', opacity: '0.7' },
          '100%': { transform: 'scale(2) rotate(360deg)', opacity: '0' }
        },
        slideIn: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)', opacity: '0.8' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(34, 197, 94, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(34, 197, 94, 0.8)' }
        },
        'glow-green': {
          '0%': { 
            boxShadow: '0 0 10px rgba(34, 197, 94, 0.4)',
            transform: 'scale(1.05)'
          },
          '50%': { 
            boxShadow: '0 0 25px rgba(34, 197, 94, 0.8)',
            transform: 'scale(1.08)'
          },
          '100%': { 
            boxShadow: '0 0 10px rgba(34, 197, 94, 0.4)',
            transform: 'scale(1.05)'
          }
        },
        'glow-red': {
          '0%': { 
            boxShadow: '0 0 10px rgba(239, 68, 68, 0.4)',
            transform: 'scale(1.05)'
          },
          '50%': { 
            boxShadow: '0 0 25px rgba(239, 68, 68, 0.8)',
            transform: 'scale(1.08)'
          },
          '100%': { 
            boxShadow: '0 0 10px rgba(239, 68, 68, 0.4)',
            transform: 'scale(1.05)'
          }
        },
        chaosPulse: {
          '0%': { 
            transform: 'scale(1) rotate(0deg)',
            borderColor: '#facc15',
            boxShadow: '0 0 10px rgba(250, 204, 21, 0.5)'
          },
          '25%': { 
            transform: 'scale(1.1) rotate(5deg)',
            borderColor: '#ef4444',
            boxShadow: '0 0 20px rgba(239, 68, 68, 0.7)'
          },
          '50%': { 
            transform: 'scale(1.2) rotate(0deg)',
            borderColor: '#06b6d4',
            boxShadow: '0 0 30px rgba(6, 182, 212, 0.8)'
          },
          '75%': { 
            transform: 'scale(1.1) rotate(-5deg)',
            borderColor: '#8b5cf6',
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.7)'
          },
          '100%': { 
            transform: 'scale(1) rotate(0deg)',
            borderColor: '#facc15',
            boxShadow: '0 0 10px rgba(250, 204, 21, 0.5)'
          }
        },
        rainbow: {
          '0%': { filter: 'hue-rotate(0deg) saturate(2) brightness(1.5)' },
          '100%': { filter: 'hue-rotate(360deg) saturate(2) brightness(1.5)' }
        },
        shimmer: {
          '0%': { 
            backgroundPosition: '-100% 0',
            opacity: '0.6'
          },
          '50%': { 
            backgroundPosition: '100% 0',
            opacity: '0.8'
          },
          '100%': { 
            backgroundPosition: '-100% 0',
            opacity: '0.6'
          }
        },
        explode: {
          '0%': { 
            transform: 'scale(1)', 
            opacity: '1',
            filter: 'brightness(1)' 
          },
          '50%': { 
            transform: 'scale(1.2)', 
            filter: 'brightness(1.5)',
            opacity: '0.8'
          },
          '100%': { 
            opacity: '0', 
            transform: 'scale(0.5)',
            filter: 'brightness(2)' 
          }
        }
      }
    },
  },
  plugins: [],
}