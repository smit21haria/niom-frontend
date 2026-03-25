module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#FAF8F4",
        green: "#2C4A3E",
        gold: "#B8965A",
        charcoal: "#2E2E2E",
        sage: "#EFF2EE",
        "footer-dark": "#1A2B25",
        "panel-bg": "#f4f2ee",
      },
      fontFamily: {
        display: ["Cormorant Garamond", "serif"],
        body: ["Jost", "sans-serif"],
      },
      borderColor: {
        DEFAULT: "rgba(44,74,62,0.14)",
      },
      boxShadow: {
        card: "0 4px 24px rgba(44,74,62,0.08)",
      },
      borderRadius: {
        card: "16px",
      },
    },
  },
  plugins: [],
}
