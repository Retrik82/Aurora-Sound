import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./features/**/*.{ts,tsx}", "./player/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#070812",
        glass: "rgba(255,255,255,0.08)",
        aurora: "#8b5cf6",
        cyan: "#67e8f9"
      },
      boxShadow: {
        glow: "0 0 60px rgba(139, 92, 246, 0.35)",
        cyan: "0 0 42px rgba(103, 232, 249, 0.22)"
      }
    }
  },
  plugins: []
};

export default config;
