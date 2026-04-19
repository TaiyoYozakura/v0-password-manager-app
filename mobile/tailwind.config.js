/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bg: "#0b1220",
        surface: "#111a2e",
        card: "#152038",
        border: "#1f2a44",
        muted: "#7c8aa8",
        text: "#e6edf7",
        primary: "#14b8a6",
        primaryDark: "#0f766e",
        danger: "#ef4444",
        warning: "#f59e0b",
        success: "#22c55e",
      },
      fontFamily: {
        sans: ["System"],
        mono: ["Menlo"],
      },
    },
  },
  plugins: [],
}
