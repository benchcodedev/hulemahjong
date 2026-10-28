/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        khaki: {
          DEFAULT: '#c3b091',
          50: '#fbf9f5',
          100: '#f5efe4',
          200: '#ebe0cc',
          300: '#dcc9aa',
          400: '#c3b091',
          500: '#ab9470',
          600: '#8e7754',
          700: '#6e5b3e',
          800: '#53442e',
          900: '#392f20',
        },
        obsidian: '#0e0f0d',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        summary: '0 22px 60px -12px rgba(20, 17, 12, 0.08)',
        soft: '0 10px 30px -8px rgba(20, 17, 12, 0.06)',
      },
    },
  },
  plugins: [],
};
