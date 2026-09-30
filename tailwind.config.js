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
          DEFAULT: '#07A33E',
          50: '#EDFBF2',
          100: '#D3F5E0',
          200: '#A7EBC1',
          300: '#6EDB9A',
          400: '#22C865',
          500: '#07A33E',
          600: '#058A33',
          700: '#056B29',
          800: '#064E20',
          900: '#052E14',
        },
        sidebar: {
          DEFAULT: '#0A0F0C',
          card: '#101713',
          border: 'rgba(255, 255, 255, 0.08)',
          hover: 'rgba(255, 255, 255, 0.05)',
          active: '#07A33E',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          bg: '#F4F6FA',
          card: '#FFFFFF',
          border: '#EAEFF5',
          subtle: '#F8FAFC',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Outfit"', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
        'green-glow': '0 0 25px -5px rgba(7, 163, 62, 0.4)',
        'modal': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      }
    },
  },
  plugins: [],
}
