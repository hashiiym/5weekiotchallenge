import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        arcade: "#050511",
        cyan: "#00f3ff",
        magenta: "#ff00ff",
        toxic: "#39ff14",
        corrupted: "#ff003c",
      },
      fontFamily: {
        display: ["Orbitron", "Bank Gothic", "Rajdhani", "sans-serif"],
        mono: ["IBM Plex Mono", "Fira Code", "monospace"],
      },
      keyframes: {
        flicker: {
          "0%, 19%, 21%, 23%, 80%, 100%": { opacity: "1" },
          "20%, 22%, 24%, 79%": { opacity: "0.45" },
        },
        pulseGrid: {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "120px 120px" },
        },
        sweep: {
          "0%": { transform: "translateX(-120%)" },
          "100%": { transform: "translateX(220%)" },
        },
        particle: {
          "0%": { transform: "translateY(0) scale(0.9)", opacity: "0.25" },
          "100%": { transform: "translateY(-16px) scale(1.15)", opacity: "1" },
        },
        scoreFlash: {
          "0%": { opacity: "0.35", transform: "scale(0.98)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        flicker: "flicker 2.8s infinite",
        pulseGrid: "pulseGrid 12s linear infinite",
        sweep: "sweep 1.8s linear infinite",
        particle: "particle 0.9s ease-out infinite alternate",
        scoreFlash: "scoreFlash 0.25s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
