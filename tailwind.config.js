/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f0f1a',
        card: '#1a1a2e',
        accent: '#e91e63',
        muted: '#b0b0c0',
        mood: {
          sad: '#4a90d9',
          missing: '#9b59b6',
          loving: '#e91e63',
          happy: '#f39c12',
          inLove: '#e74c3c',
        },
      },
    },
  },
  plugins: [],
};
