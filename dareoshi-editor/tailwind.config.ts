import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#172033",
        paper: "#F8FAFC",
        card: "#FFFFFF",
        line: "#E2E8F0",
        muted: "#64748B",
        navy: "#102A43",
        mint: "#DDF8EC",
        mintText: "#047857",
        coral: "#FFE4E0",
        coralText: "#B42318",
        lemon: "#FFF4C7",
        lemonText: "#854D0E",
        sky: "#E0F2FE",
        skyText: "#0369A1",
        lavender: "#EEE7FF",
        lavenderText: "#6D28D9"
      },
      boxShadow: {
        card: "0 18px 45px rgba(15, 23, 42, 0.08)",
        soft: "0 8px 24px rgba(15, 23, 42, 0.08)"
      },
      fontFamily: {
        sans: [
          "\"Noto Sans JP\"",
          "\"BIZ UDPGothic\"",
          "-apple-system",
          "BlinkMacSystemFont",
          "ui-sans-serif",
          "system-ui",
          "sans-serif"
        ],
        number: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "ui-sans-serif",
          "system-ui",
          "sans-serif"
        ]
      }
    }
  },
  plugins: []
};

export default config;
