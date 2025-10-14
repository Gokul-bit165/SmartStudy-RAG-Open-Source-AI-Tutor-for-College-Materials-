// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        blink: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0 },
        }
      },
      animation: {
        blink: 'blink 1s step-end infinite',
      }
    },
  },
  // frontend/tailwind.config.js
// ... (keep existing content)
theme: {
  extend: {
    keyframes: {
      blink: {
        '0%, 100%': { opacity: 1 },
        '50%': { opacity: 0 },
      },
      'scale-in': {
        '0%': { opacity: 0, transform: 'scale(0.9)' },
        '100%': { opacity: 1, transform: 'scale(1)' },
      },
      'fade-in': {
        '0%': { opacity: 0 },
        '100%': { opacity: 1 },
      },
    },
    animation: {
      blink: 'blink 1s step-end infinite',
      'scale-in': 'scale-in 0.3s ease-out forwards',
      'fade-in': 'fade-in 0.5s ease-in-out forwards',
    }
  },
},
// ... (keep existing plugins)
  
  
  plugins: [],
}
