module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        forest: { DEFAULT: "#1a3a2e", dark: "#2C4A3E" },
        gold: "#B8965A",
        ivory: "#FAF8F4",
      },
      fontFamily: {
        display: ["Cormorant Garamond", "serif"],
        body: ["Jost", "sans-serif"],
      },
    },
  },
  plugins: [],
}
