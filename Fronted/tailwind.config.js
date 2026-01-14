// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          purple: "#520893",
          light: "#8B5CF6",
          dark: "#6D28D9"
        },
        accent: {
          yellow: "#FBBF24",
          light: "#FCD34D",
          dark: "#F59E0B"
        },
        neutral: {
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#E5E5E5",
          300: "#D4D4D4",
          700: "#404040",
          800: "#262626",
          900: "#171717"
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}