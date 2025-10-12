/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6ccaf1',
        'primary-dark': '#5ab8df',
        'primary-light': '#8ed6f5',
      },
      fontFamily: {
        sans: [
          'Noto Sans JP',
          'Hiragino Kaku Gothic ProN',
          'Yu Gothic',
          'Meiryo',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}
