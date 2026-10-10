/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neuro: {
          bg: '#0B1220',
          nav: '#101A2B',
          card: '#141F31',
          raised: '#1B2A40',
          text: '#F3F6FA',
          muted: '#A5B2C5',
          teal: '#35D0C1',
          'teal-glow': '#35D0C133',
          success: '#43C98B',
          warning: '#F4B860',
          error: '#F07178',
          border: '#29384D',
          hover: '#223450'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
        sans: ['Roboto', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
