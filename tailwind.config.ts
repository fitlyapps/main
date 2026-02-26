import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#f4f6f8",
        foreground: "#0e1217",
        accent: "#1f7aea",
        card: "#ffffff",
        muted: "#5f6b7a"
      },
      boxShadow: {
        soft: "0 12px 35px rgba(17, 32, 63, 0.08)"
      }
    }
  },
  plugins: []
} satisfies Config;
