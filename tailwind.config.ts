import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#161311",
        gold: {
          50: "#fbf7ee",
          100: "#f3e9d0",
          400: "#d8ad4f",
          500: "#c4933a",
          600: "#a3752c",
        },
      },
      fontFamily: {
        display: ["Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
