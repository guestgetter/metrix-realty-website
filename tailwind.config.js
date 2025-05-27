/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html", "./assets/js/*.js"],
  theme: {
    extend: {
      colors: {
        'metrix-blue': '#233c75',
        'metrix-blue-light': '#3d5a9e',
        'metrix-blue-dark': '#1a2d5a',
        'metrix-green': '#3faa4d',
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
      }
    },
  },
  plugins: [],
} 