import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#fffdf7",
          100: "#fbf4e7",
          200: "#f1dfbd",
          300: "#dec48f"
        },
        ink: "#171615",
        milk: "#fffefa",
        whey: "#f8efe0"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(23, 22, 21, 0.08)"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
        display: ["var(--font-display)", "ui-serif", "Georgia"]
      }
    }
  },
  plugins: []
};

export default config;
