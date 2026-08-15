/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#0c0205',
          bgDark: '#080103',
          bgCard: '#15040a',
          bgCardLight: '#1f060f',
          neon: '#ff2a6d',
          neonHover: '#ff5388',
          hotPink: '#ff0055',
          pinkDim: '#a62450',
          pinkMuted: '#5e152d',
          cyan: '#05d9e8',
          cyanDim: '#005670',
          cyanGlow: '#00b4d8',
          textActive: '#ffffff',
          textBright: '#ffe4ec',
          textDim: '#bf436c',
          textMuted: '#661b36',
          border: '#ff2a6d',
          borderDim: '#590e24',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Share Tech Mono"', 'Consolas', 'monospace'],
        pixel: ['"VT323"', '"JetBrains Mono"', 'monospace'],
        cyber: ['"Share Tech Mono"', '"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'neon-sm': '0 0 5px rgba(255, 42, 109, 0.4)',
        'neon': '0 0 10px rgba(255, 42, 109, 0.4), 0 0 20px rgba(255, 42, 109, 0.15)',
        'neon-strong': '0 0 15px rgba(255, 42, 109, 0.8), 0 0 30px rgba(255, 0, 85, 0.4)',
        'cyan': '0 0 10px rgba(5, 217, 232, 0.4)',
        'inner-glow': 'inset 0 0 12px rgba(255, 42, 109, 0.15)',
      },
      animation: {
        'scanline': 'scanline 8s linear infinite',
        'flicker': 'flicker 0.15s infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-breathe': 'glowBreathe 3s ease-in-out infinite alternate',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
        glowBreathe: {
          '0%': { opacity: '0.8', filter: 'drop-shadow(0 0 4px rgba(255,42,109,0.4))' },
          '100%': { opacity: '1', filter: 'drop-shadow(0 0 10px rgba(255,42,109,0.9))' },
        }
      }
    },
  },
  plugins: [],
}
