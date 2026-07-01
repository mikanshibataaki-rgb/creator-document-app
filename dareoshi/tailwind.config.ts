import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#10152B",
        cream: "#FFF6DF",
        coral: "#FF6D8D",
        lemon: "#FFE45E",
        mint: "#5AF0B4",
        lavender: "#A993FF",
        sky: "#58D7FF",
        orange: "#FF9A45",
        danger: "#FF5B5B",
        slate: "#20263D",
        muted: "#737C98",
      },
      boxShadow: {
        sticker: "4px 4px 0 #060812",
        soft: "0 16px 40px rgba(0, 0, 0, 0.26)",
        card: "3px 3px 0 rgba(6, 8, 18, 0.9)",
      },
      fontFamily: {
        sans: [
          "\"Noto Sans JP\"",
          "\"BIZ UDPGothic\"",
          "-apple-system",
          "BlinkMacSystemFont",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        rounded: [
          "\"M PLUS Rounded 1c\"",
          "\"Zen Maru Gothic\"",
          "\"Noto Sans JP\"",
          "-apple-system",
          "BlinkMacSystemFont",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        number: [
          "Inter",
          "\"Noto Sans JP\"",
          "-apple-system",
          "BlinkMacSystemFont",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
