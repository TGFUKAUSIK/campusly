import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#15201f",
        paper: "#f6f8f5",
        moss: "#194b43",
        mint: "#dff2e9",
        coral: "#ff8b73",
        sun: "#ffca6b"
      },
      boxShadow: {
        card: "0 18px 55px rgba(43, 72, 66, 0.09)",
        float: "0 12px 35px rgba(18, 47, 42, 0.16)"
      }
    }
  },
  plugins: []
} satisfies Config;
