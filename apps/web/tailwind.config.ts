import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        field: "#f8fafc",
        signal: "#16a34a",
        market: "#0369a1",
        warm: "#f59e0b"
      }
    }
  },
  plugins: []
};

export default config;
