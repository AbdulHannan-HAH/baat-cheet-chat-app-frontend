/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      maxWidth: {
        '6xl': '72rem', // same as old Tailwind v3
        '7xl': '80rem',
      },
    },
  },
  plugins: [],
}
