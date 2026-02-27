/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          main: '#0A1B3A',
          card: '#152A4A',
          border: '#2E4A6B',
        },
        blue: {
          primary: '#4A9EFF',
          hover: '#2E7CD6',
          accent: '#4A9EFF',
          light: '#6BB3FF',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#B8C5D9',
        },
        status: {
          paid: '#22C55E',
          partial: '#EAB308',
          unpaid: '#EF4444',
        },
        bg: {
          main: '#0A1B3A',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        display: ['Bebas Neue', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
