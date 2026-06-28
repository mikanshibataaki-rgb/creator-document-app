import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./domain/**/*.{ts,tsx}", "./features/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#15171a",
        paper: "#f7f7f4",
        canvas: "var(--canvas)",
        surface: { DEFAULT: "var(--surface)", 2: "var(--surface-2)", 3: "var(--surface-3)" },
        line: { DEFAULT: "var(--line)", strong: "var(--line-strong)" },
        fg: { DEFAULT: "var(--fg)", muted: "var(--fg-2)", faint: "var(--fg-3)" },
        preview: "var(--preview)",
        brand: { DEFAULT: "#e53e3e", dark: "#b91c1c", soft: "rgba(229,62,62,0.12)", bright: "#f87171" },
        palette: {
          video: "#4a90e2",
          design: "#9b51e0",
          text: "#27ae60",
          human: "#d97706",
          live: "#f43f5e",
        },
      },
      fontFamily: {
        sans: ['"Urbanist"', '"Inter"', '"Noto Sans JP"', '"Hiragino Kaku Gothic ProN"', '"Hiragino Sans"', '"Yu Gothic"', "YuGothic", "system-ui", "sans-serif"],
        display: ['"Hiragino Mincho ProN"', '"Yu Mincho"', "YuMincho", '"Noto Serif JP"', '"Times New Roman"', "serif"],
      },
      boxShadow: {
        sheet: "0 18px 50px -24px rgba(15,17,20,.45)",
        float: "0 40px 90px -40px rgba(0,0,0,.9)",
      },
      letterSpacing: { brand: ".22em" },
    },
  },
  plugins: [],
} satisfies Config;
