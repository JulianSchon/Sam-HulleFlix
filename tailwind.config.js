/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cinema: {
          bg: '#0a0a0a',
          surface: '#111118',
          border: '#1e1b30',
          red: '#e50914',
          gold: '#c8a951',
          blue: '#4a90d9',
          muted: '#888888',
          dim: '#555555',
        },
      },
    },
  },
  plugins: [],
}

