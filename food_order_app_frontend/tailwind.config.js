// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Ceci scanne tous les fichiers dans src/
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}