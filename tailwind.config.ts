import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      colors: {
        pickle: {
          green: "#059669",
          light: "#34d399",
          dark: "#065f46",
        },
        ball: {
          yellow: "#F5E642",
        },
      },
    },
  },
  plugins: [],
};

export default config;
