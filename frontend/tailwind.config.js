/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        jade: {
          50: '#EAF3EF',
          100: '#CFE5DA',
          400: '#2E8A6B',
          500: '#1B6B54',
          600: '#124A3A',
          700: '#0D372C',
        },
        saffron: {
          400: '#F0B65C',
          500: '#E8A33D',
          600: '#C6862A',
        },
        ink: '#1C201D',
      },
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
