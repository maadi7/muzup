/** @type {import('tailwindcss').Config} */
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1DB954",
        secondary: "#303F9F"
    },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
          
      },
      fontFamily: {
        playfair: ['var(--font-playfair)', 'serif'],
        nunito: ['var(--font-nunito)', 'sans-serif'],
        raleway: ['var(--font-raleway)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
