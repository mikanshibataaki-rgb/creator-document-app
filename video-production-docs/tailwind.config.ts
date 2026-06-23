import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./features/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { ink: "#17201d", paper: "#f7f7f4", brand: { DEFAULT: "#b72d2d", dark: "#8f2020", soft: "#fff2f0" } },
      boxShadow: { sheet: "0 12px 32px rgba(23,32,29,.10)" },
    },
  },
  plugins: [],
} satisfies Config;
