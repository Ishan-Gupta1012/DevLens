/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050505",
        surface: {
          DEFAULT: "#0d0d0f",
          raised: "#141416",
        },
        border: "rgba(255, 255, 255, 0.08)",
        muted: "#9a9aa0",
        teal: {
          DEFAULT: "#14b8a6",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
        },
        orange: {
          DEFAULT: "#f97316",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        DEFAULT: "12px",
        lg: "12px",
        xl: "14px",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

