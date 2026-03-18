import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pickle: {
          green: "#5D8A34",
          light: "#8CB84A",
          dark: "#3D5E20",
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
