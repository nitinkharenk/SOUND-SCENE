import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        foreground: "var(--foreground)",
        border: "var(--line)",
        card: "var(--card)",
        accent: {
          DEFAULT: "var(--color-accent)",
          hover: "var(--color-accent-hover)",
          subtle: "var(--color-accent-subtle)",
        },
      },
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-heading)", "sans-serif"],
        ui: ["var(--font-body)", "sans-serif"],
        heading: ["var(--font-heading)"],
        card: ["var(--font-card)"],
        body: ["var(--font-body)"],
      },
    },
  },
};

export default config;
