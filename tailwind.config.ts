import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#09090b",
          900: "#0c0c10",
          800: "#121218",
          700: "#1a1a22",
          600: "#26262f",
        },
        neon: {
          pink: "#ff2a85",
          cyan: "#00f0ff",
          purple: "#a855f7",
          sun: "#ffb347",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        "neon-pink": "0 0 0 1px rgba(255,42,133,.5), 0 0 24px -4px rgba(255,42,133,.55)",
        "neon-cyan": "0 0 0 1px rgba(0,240,255,.45), 0 0 24px -4px rgba(0,240,255,.5)",
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px)",
        sunset: "linear-gradient(135deg, #ff2a85 0%, #a855f7 50%, #00f0ff 100%)",
      },
      keyframes: {
        flicker: {
          "0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%": { opacity: "1" },
          "20%, 24%, 55%": { opacity: ".55" },
        },
      },
      animation: { flicker: "flicker 4s linear infinite" },
    },
  },
  plugins: [],
};

export default config;
