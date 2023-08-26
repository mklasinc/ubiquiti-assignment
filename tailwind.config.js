/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        error: '#ff0000',
        active: '#82d3f5',
        hover: '#4D9AFE',
      },
    },
  },
  plugins: [],
}
