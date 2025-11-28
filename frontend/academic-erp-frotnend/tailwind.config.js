/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter var"', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#fef5f0',
          100: '#fde6d9',
          200: '#fbcbb3',
          300: '#f8a682',
          400: '#f4873e',
          500: '#f4873e',
          600: '#e25814',
          700: '#cc4d0f',
          800: '#a63d0c',
          900: '#7a2f09',
        },
      },
    },
  },
  plugins: [],
}

