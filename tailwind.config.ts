import type { Config } from "tailwindcss";
import { ceruleanBlue, gossamerGreen } from "./styling/colors";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
      colors: {
        gossamerGreen,
        ceruleanBlue,
      },
    },
  },
  plugins: [],
} satisfies Config;
