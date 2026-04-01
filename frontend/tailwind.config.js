/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        risk: {
          low: "#22c55e",
          moderate: "#f59e0b",
          high: "#ef4444",
          very_high: "#7f1d1d",
        },
      },
    },
  },
  plugins: [],
};