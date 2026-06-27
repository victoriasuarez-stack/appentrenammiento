import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        deep: "#050508",
        card: "#111118",
        elevated: "#1A1A24",
        input: "#0D0D14",
        primary: "#FFFFFF",
        secondary: "#D0CDD6",
        muted: "#9490A0",
        accent: "#4ECDC4",
        "accent-light": "#6BE8DF",
        violet: "#7B5AFF",
        emerald: "#00D4AA",
        coral: "#FF6B6B",
        amber: "#FFB347",
        line: "rgba(255,255,255,0.10)",
      },
      fontSize: {
        body: ["18px", "1.5"],
        lg: ["20px", "1.4"],
        xl: ["24px", "1.3"],
        "2xl": ["28px", "1.2"],
        "3xl": ["32px", "1.1"],
      },
    },
  },
  plugins: [],
};
export default config;
