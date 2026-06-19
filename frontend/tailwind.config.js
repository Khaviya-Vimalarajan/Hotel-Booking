/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0F6E5C',
          light: '#179E84',
          dark: '#0A4C40',
        },
        secondary: {
          DEFAULT: '#C2703D',
          light: '#D78B58',
          dark: '#9B542A',
        },
        accent: {
          gold: '#D4AF37',
        },
        luxury: {
          bg: '#FAF8F5',
          card: '#FFFFFF',
          text: '#1E2024',
          darkBg: '#10121A',
          darkCard: '#1A1D27',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
