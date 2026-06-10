/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        glacier: '#e8f4f4',
        teal: {
          550: '#0d9b8a',
        },
      },
      fontFamily: {
        display: ['"Trebuchet MS"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
