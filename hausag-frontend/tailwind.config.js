/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'black-pure': '#000000',
        'black-rich': '#050505',
        'black-surface': '#0a0a0a',
        'black-elevated': '#121212',
        'black-border': '#1a1a1a',
        'black-hover': '#222222',
        'brand-black': '#111111',
        'brand-white': '#FFFFFF',
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
        'serif': ['"Playfair Display"', 'serif'],
      }
    },
  },
  plugins: [],
}
