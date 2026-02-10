
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
      },
      colors: {
        agri: {
          primary: 'var(--primary-earth)',
          secondary: 'var(--secondary-tan)',
          gold: 'var(--accent-gold)',
          bg: 'var(--bg-silk)',
          text: 'var(--text-charcoal)',
          border: 'var(--border-sepia)',
          accent: '#8B5E34',
        }
      },
      boxShadow: {
        'premium': '0 20px 50px -12px rgba(61, 43, 31, 0.12)',
      },
    }
  },
  plugins: [],
}
