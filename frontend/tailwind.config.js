/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body:    ['DM Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg:       { DEFAULT: '#0d0d0d', 2: '#161616', 3: '#1e1e1e', 4: '#252525' },
        border:   { DEFAULT: '#2a2a2a', 2: '#333333', 3: '#404040' },
        text:     { DEFAULT: '#f0ede8', 2: '#a09d98', 3: '#6a6762', 4: '#3a3835' },
        accent:   { DEFAULT: '#e8d5a3', 2: '#c4a96d', 3: '#8b6f3a', 4: '#5a4520' },
        danger:   '#e05c5c',
        success:  '#5cbf87',
        info:     '#5b9bd5',
      },
      borderRadius: {
        sm: '6px', DEFAULT: '10px', md: '12px', lg: '16px', xl: '20px',
      },
      animation: {
        'fade-in':   'fadeIn 0.2s ease',
        'slide-up':  'slideUp 0.3s cubic-bezier(0.4,0,0.2,1)',
        'scale-in':  'scaleIn 0.2s ease',
        'spin-slow': 'spin 2s linear infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        scaleIn: { from: { opacity: 0, transform: 'scale(0.95)' }, to: { opacity: 1, transform: 'scale(1)' } },
      },
    },
  },
  plugins: [],
};
