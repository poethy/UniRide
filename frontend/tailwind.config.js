/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#eef2fb',
          100: '#E8EDF7',
          200: '#b5c8eb',
          500: '#5a7dc4',
          600: '#2e5ab8',
          700: '#1E3A78',
          900: '#16285A',
        },
        brand: {
          DEFAULT: '#1E3A78',
          dark:    '#16285A',
          light:   '#E8EDF7',
        },
        accent: {
          DEFAULT: '#E8852A',
          dark:    '#C26A19',
          light:   '#FBEEDD',
        },
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
